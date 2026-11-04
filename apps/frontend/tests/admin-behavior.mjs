// Run: node tests/admin-behavior.mjs (Node 22.18+).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { loadBindings } from 'next/dist/build/swc/index.js';
import { pageCount } from '../src/lib/pagination.ts';

// Exercise existing TSX without adding a test framework or a DOM dependency.
const require = createRequire(import.meta.url);
const swc = await loadBindings();
function loadSource(path, dependencies = {}) {
  const url = new URL(path, import.meta.url);
  const { code } = swc.transformSync(readFileSync(url, 'utf8'), {
    filename: url.pathname,
    jsc: { parser: { syntax: 'typescript', tsx: true }, transform: { react: { runtime: 'automatic' } } },
    module: { type: 'commonjs' },
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)((id) => id in dependencies ? dependencies[id] : require(id), module, module.exports);
  return module.exports;
}
const effects = [];
const { DataTable } = loadSource('../src/components/ui/data-table/data-table.tsx', {
  react: { useEffect: (effect) => effects.push(effect) },
  '~/components/ui/button': { Button: () => null },
  '~/lib/cn': { cn: (...values) => values.filter(Boolean).join(' ') },
  '~/lib/pagination': { pageCount },
  './data-table-pagination': { DataTablePagination: () => null },
  './data-table-toolbar': { DataTableToolbar: () => null },
  './data-table-types': { sortOptionsFromColumns: () => [] },
});
function correctedPage(state) {
  const changes = [];
  effects.length = 0;
  DataTable({ data: [], columns: [], getRowId: (row) => row.id, page: 3, pageSize: 10, total: 0,
    sort: { sort: 'createdAt', order: 'desc' }, search: '', itemLabel: 'aktivitas',
    onPageChange: (page) => changes.push(page), onPageSizeChange() {}, onSortChange() {}, onSearchChange() {}, ...state });
  effects.forEach((effect) => effect());
  return changes;
}
assert.deepEqual(correctedPage({ isLoading: true }), [], 'loading must not reset the requested server page');
assert.deepEqual(correctedPage({ isFetching: true }), [], 'pending replies must not clamp from stale totals');
assert.deepEqual(correctedPage({ error: new Error('offline') }), [], 'failed replies must preserve retry page');
assert.deepEqual(correctedPage({ total: 21 }), []);
assert.deepEqual(correctedPage({ total: 11 }), [2]);
assert.deepEqual(correctedPage({ total: 0 }), [1]);
console.log('PASS pagination: wait for successful server totals, preserve page on error/retry');

const { QueryClient } = require('@tanstack/react-query');
const sessionCache = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const { useAuthStore } = loadSource('../src/features/auth/hooks/auth-store.ts', {
  '~/lib/query/client': { getQueryClient: () => sessionCache },
});
const session = { token: 'test-session-a', user: { id: 'admin-a', role: 'admin' } };
useAuthStore.getState().setSession(session);
for (const key of ['admin', 'users', 'destinations']) sessionCache.setQueryData([key], { private: true });
useAuthStore.getState().clearSession();
assert.equal(sessionCache.getQueryCache().getAll().length, 0, 'logout must clear privileged cached reads');
useAuthStore.getState().setSession(session);
let finishRead;
const oldRead = sessionCache.fetchQuery({ queryKey: ['admin', '/admin/activity'], queryFn: () => new Promise((resolve) => { finishRead = resolve; }) }).catch(() => undefined);
useAuthStore.getState().clearSession();
useAuthStore.getState().setSession({ ...session, token: 'test-session-b' });
finishRead({ data: ['old activity'] });
await oldRead;
assert.equal(sessionCache.getQueryCache().getAll().length, 0, 'late old-session reads must not repopulate cache');
sessionCache.setQueryData(['users'], { private: true });
useAuthStore.getState().setSession(session);
assert.equal(sessionCache.getQueryCache().getAll().length, 0, 'login must not reuse a previous session cache');
console.log('PASS auth cache: login/logout clear private data, cancel stale reads');
import { promoSchema, supportSchema, faqSchema, feedbackSchema } from '../src/features/operations/validation.ts';
import { qrGeometry } from '../src/features/operations/qr-geometry.ts';

const matrix = Array.from({ length: 21 }, () => Array(21).fill(false));
matrix[0][0] = true;
matrix[20][20] = true;
assert.deepEqual(qrGeometry(matrix), { size: 29, modules: [{ x: 4, y: 4 }, { x: 24, y: 24 }] });
for (const invalid of [[], [[true]], Array(21).fill([true]), Array(21).fill(Array(21).fill(1))]) assert.equal(qrGeometry(invalid), null);
console.log('PASS QR: backend modules only, four-module quiet zone, reject malformed');
const support = { destinationId: '550e8400-e29b-41d4-a716-446655440000', name: 'Homestay', category: 'accommodation', description: null, locationLabel: null, capacity: null, distanceLabel: null, priceLabel: null, priceUnit: null, priceMin: 0, priceMax: 0, contactPhone: null, contactWhatsapp: null, contactInstagram: null, imageUrl: null, facilities: [], routes: [], cuisine: [], includesDriver: false, verified: false };
assert.equal(supportSchema.safeParse(support).success, true);
assert.equal(supportSchema.safeParse({ ...support, priceMin: 10 }).success, false);
assert.equal(supportSchema.safeParse({ ...support, priceMin: 1.5 }).success, false);
assert.equal(supportSchema.safeParse({ ...support, priceMax: null }).success, true);
assert.equal(supportSchema.safeParse({ ...support, imageUrl: 'javascript:alert(1)' }).success, false);
console.log('PASS support: nullable prices, zero allowed, range, integer, safe image URL');

const promo = { code: 'TRIP_10', title: 'Diskon perjalanan', discountType: 'percentage', value: 10, minAmount: 0, maxDiscount: null, startsAt: '2026-11-04T00:00:00.000Z', endsAt: '2026-11-05T00:00:00.000Z', active: true };
assert.equal(promoSchema.safeParse(promo).success, true);
assert.equal(promoSchema.safeParse({ ...promo, code: 'lowercase' }).success, false);
assert.equal(promoSchema.safeParse({ ...promo, value: 101 }).success, false);
assert.equal(promoSchema.safeParse({ ...promo, startsAt: promo.endsAt }).success, false);
assert.equal(promoSchema.safeParse({ ...promo, endsAt: 'invalid' }).success, false);
assert.equal(promoSchema.safeParse({ ...promo, discountType: 'fixed', value: 10000 }).success, true);
console.log('PASS promo: code, integer discount, date range');

assert.equal(faqSchema.safeParse({ category: 'akun', question: 'Cara masuk?', answer: 'Gunakan akun Anda.' }).success, true);
assert.equal(faqSchema.safeParse({ category: 'invalid', question: 'Cara masuk?', answer: 'Jawaban' }).success, false);
assert.equal(faqSchema.safeParse({ category: 'data', question: '   ', answer: 'Jawaban' }).success, false);
assert.equal(feedbackSchema.safeParse({ category: 'saran', subject: 'Masukan fitur', message: 'Tambahkan panduan persiapan.', rating: 0 }).success, true);
assert.equal(feedbackSchema.safeParse({ category: 'bug', subject: 'Bug', message: 'Terlalu pendek'.slice(0, 9) }).success, false);
assert.equal(feedbackSchema.safeParse({ category: 'bug', subject: 'Bug', message: 'Pesan cukup panjang', rating: 6 }).success, false);
assert.equal(feedbackSchema.safeParse({ category: 'bug', subject: 'Bug', message: 'Pesan cukup panjang', userId: 'other-user' }).success, false);
console.log('PASS content: FAQ categories, trimmed input, feedback length/rating, no userId payload');


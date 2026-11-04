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
function renderTable(state = {}) {
  return DataTable({ data: [], columns: [], getRowId: (row) => row.id, page: 3, pageSize: 10, total: 0,
    sort: { sort: 'createdAt', order: 'desc' }, search: '', itemLabel: 'aktivitas',
    onPageChange() {}, onPageSizeChange() {}, onSortChange() {}, onSearchChange() {}, ...state });
}
function correctedPage(state) {
  const changes = [];
  effects.length = 0;
  renderTable({ onPageChange: (page) => changes.push(page), ...state });
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

const { renderToStaticMarkup } = require('react-dom/server');
const { DataTableToolbar } = loadSource('../src/components/ui/data-table/data-table-toolbar.tsx', {
  '~/lib/cn': { cn: (...values) => values.filter(Boolean).join(' ') },
  './data-table-filter-panel': { DataTableFilterPanel: () => null },
});
const toolbarMarkup = (state) => renderToStaticMarkup(DataTableToolbar(renderTable(state).props.children[0].props));
assert(!toolbarMarkup({ isLoading: true }).includes('0 aktivitas'), 'unknown loading total must not be presented as zero');
assert(!toolbarMarkup({ error: new Error('offline') }).includes('0 aktivitas'), 'failed replies must not manufacture a zero total');
assert(toolbarMarkup({ total: 0 }).includes('0 aktivitas'), 'confirmed empty server totals must remain visible');
console.log('PASS counts: no invented zeros while loading or failed');

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

const queryLibrary = require('@tanstack/react-query');
const { ApiError } = loadSource('../src/lib/api/types.ts');
const pendingReads = [];
const readPrivate = (...args) => new Promise((resolve) => pendingReads.push({ args, resolve }));
const queryDependencies = { ...queryLibrary, useQuery: (options) => options };
const mutationDependencies = { ...queryDependencies, useMutation: (options) => options, useQueryClient: () => sessionCache };
const userHooks = loadSource('../src/features/users/hooks/use-users.ts', {
  '@tanstack/react-query': mutationDependencies,
  '~/features/auth/hooks/auth-store': { useAuthStore },
  '~/lib/api/types': { ApiError },
  '../api/users': { usersApi: { list: readPrivate, get: readPrivate } },
});
const destinationHooks = loadSource('../src/features/destinations/hooks/use-destinations.ts', {
  '@tanstack/react-query': mutationDependencies,
  '~/features/auth/hooks/auth-store': { useAuthStore },
  '../api/destinations': { destinationsApi: { list: readPrivate, get: readPrivate } },
});
for (const [label, options] of [
  ['users', (token) => userHooks.useUsers({ page: 1 }, token, true)],
  ['user detail', (token) => userHooks.useUser('same-id', token, true)],
  ['destinations', (token) => destinationHooks.useDestinations({ page: 1 }, token, true)],
  ['destination detail', (token) => destinationHooks.useDestination('same-id', token, true)],
]) {
  useAuthStore.getState().setSession(session);
  const observer = new queryLibrary.QueryObserver(sessionCache, options(session.token));
  const unsubscribe = observer.subscribe(() => {});
  const firstRead = observer.refetch();
  pendingReads.shift().resolve({ data: ['private session A'] });
  await firstRead;
  assert.deepEqual(observer.getCurrentResult().data.data, ['private session A']);
  useAuthStore.getState().setSession({ ...session, token: 'test-session-b' });
  observer.setOptions(options('test-session-b'));
  assert.equal(observer.getCurrentResult().data, undefined, `${label}: mounted readers must not retain old-session data`);
  const secondRead = observer.refetch();
  pendingReads.shift().resolve({ data: ['private session B'] });
  await secondRead;
  assert.deepEqual(observer.getCurrentResult().data.data, ['private session B']);
  unsubscribe();
  observer.destroy();
}
useAuthStore.getState().clearSession();
console.log('PASS session observers: user/destination list/detail hide prior session while switching');

const notifications = [];
const navigations = [];
let saved = 0;
const adminShared = loadSource('../src/features/operations/shared.tsx', {
  react: { useEffect: (effect) => effects.push(effect) },
  'next/navigation': { useRouter: () => ({ replace: (path) => navigations.push(path) }) },
  '@tanstack/react-query': { ...queryDependencies, useMutation: (options) => options, useQueryClient: () => sessionCache },
  '~/features/auth/hooks/use-auth': { useAuth: () => ({ ...useAuthStore.getState(), logout: useAuthStore.getState().clearSession }) },
  '~/features/auth/hooks/auth-store': { useAuthStore },
  '~/lib/api/client': { get: readPrivate },
  '~/lib/api/types': { ApiError },
  '~/components/ui/button': {},
  '~/components/ui/dialog': {},
  '~/components/ui/toaster': { useToast: () => ({ toast: (message) => notifications.push(message) }) },
});
useAuthStore.getState().setSession(session);
const adminObserver = new queryLibrary.QueryObserver(sessionCache, adminShared.useAdminQuery('/admin/supports'));
const unsubscribeAdmin = adminObserver.subscribe(() => {});
const adminRead = adminObserver.refetch();
pendingReads.shift().resolve({ data: ['private admin A'] });
await adminRead;
useAuthStore.getState().setSession({ ...session, token: 'test-session-b' });
adminObserver.setOptions(adminShared.useAdminQuery('/admin/supports'));
assert.equal(adminObserver.getCurrentResult().data, undefined, 'admin placeholder must not display previous-session rows for the same user');
unsubscribeAdmin();
adminObserver.destroy();
useAuthStore.getState().clearSession();
console.log('PASS admin queries: no previous-session placeholder data');
for (const outcome of ['success', 'unauthorized', 'same-token']) {
  useAuthStore.getState().setSession(session);
  let finish;
  const observer = new queryLibrary.MutationObserver(sessionCache, adminShared.useAdminMutation(
    () => new Promise((resolve, reject) => { finish = outcome === 'unauthorized' ? reject : resolve; }),
    () => { saved++; },
  ));
  const mutation = observer.mutate({});
  await new Promise((resolve) => setImmediate(resolve));
  useAuthStore.getState().clearSession();
  const newToken = outcome === 'same-token' ? session.token : 'test-session-b';
  useAuthStore.getState().setSession({ ...session, token: newToken });
  finish(outcome === 'unauthorized' ? new ApiError(401, 'UNAUTHORIZED', 'Expired session A') : { data: 'old saved' });
  await mutation.catch(() => undefined);
  assert.equal(saved, 0, 'late admin mutation must not close a new-session dialog');
  assert.deepEqual(notifications, [], 'late admin mutation must not announce a success in another session');
  assert.deepEqual(navigations, [], 'late unauthorized mutation must not redirect a new session');
  assert.equal(useAuthStore.getState().token, newToken, 'late unauthorized mutation must not log out a new session');
}
useAuthStore.getState().clearSession();
console.log('PASS admin mutations: ignore stale success/401 after logout or session switch');

for (const [label, configure, input] of [
  ['users', () => userHooks.useUserMutation({ token: session.token, onSaved: () => { saved++; }, onUnauthorized: () => { navigations.push('logout'); } }), { kind: 'create', payload: {} }],
  ['destination delete', () => destinationHooks.useDeleteDestination({ token: session.token, onDeleted: () => { saved++; } }), { id: 'same-id' }],
  ['destination save', () => destinationHooks.useSaveDestination({ token: session.token, editing: false, onSaved: () => { saved++; } }), {}],
]) {
  useAuthStore.getState().setSession(session);
  const callbacks = configure();
  let finish;
  const observer = new queryLibrary.MutationObserver(sessionCache, { ...callbacks, mutationFn: () => new Promise((resolve) => { finish = resolve; }) });
  const mutation = observer.mutate(input);
  await new Promise((resolve) => setImmediate(resolve));
  useAuthStore.getState().clearSession();
  useAuthStore.getState().setSession(session);
  finish({ data: { id: 'old-session-result' } });
  await mutation;
  assert.equal(saved, 0, `${label}: late mutation must not announce success or close another session's dialog`);
}
useAuthStore.getState().clearSession();
console.log('PASS user/destination mutations: ignore completion after session reset');
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


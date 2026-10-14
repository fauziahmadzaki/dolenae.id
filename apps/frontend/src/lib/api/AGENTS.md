# AGENTS.md — lib/api/

Lapisan klien HTTP ke backend Dolenae. Envelope `{ success, data, meta }`,
error → `ApiError`.

## File

| File | Isi |
| --- | --- |
| `types.ts` | Tipe envelope (`ApiSuccess`, `ApiFailure`, `ApiResult`), `ApiError`, `RequestOptions`. |
| `core.ts` | `createApi(baseUrl)` → `request/get/post/patch/put/del`. Inti bersama. |
| `client.ts` | Instance untuk **browser** (pakai `NEXT_PUBLIC_API_URL`). |
| `server.ts` | Instance untuk **server/SSR** (pakai `API_URL`, privat). |
| `index.ts` | Re-export `types` + `core` saja. |

> `index.ts` sengaja **tidak** mengekspor `client`/`server` supaya `server.ts`
> tidak ikut ter-bundle ke client.

## Cara pakai

```ts
// client component / browser
import { get, post, patch, put, del } from "~/lib/api/client";

// server component / route handler
import { get, post, patch, put, del } from "~/lib/api/server";

const { data, meta } = await get<Destination[]>("/destinations?limit=10");
await post("/destinations", payload);
await patch(`/destinations/${id}`, payload);
await del(`/destinations/${id}`);
```

Signature: `get(path, opts?)`, `post(path, body?, opts?)`,
`patch(path, body?, opts?)`, `put(path, body?, opts?)`, `del(path, opts?)`.
`opts`: `{ token?, headers?, signal? }`.

## Aturan

- **Jangan** impor `./server` dari client component (`"use client"`).
- Base URL otomatis: browser → `NEXT_PUBLIC_API_URL`, server → `API_URL`.
- `createApi` dipakai hanya di `client.ts`/`server.ts`; komponen pakai helper.
- Tipe response ditulis manual (tak ada paket shared) — sinkron dengan backend.

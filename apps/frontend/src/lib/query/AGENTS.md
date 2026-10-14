# AGENTS.md — lib/query/

Setup TanStack Query + helper optimistic update.

## File

| File | Isi |
| --- | --- |
| `client.ts` | `getQueryClient()` — singleton di browser, baru per-request di server. |
| `optimistic.ts` | `applyOptimistic`, `rollbackOptimistic`, `settleInvalidate`. |

Provider `QueryProvider` dipasang di root layout (`components/providers/`).
Devtools hanya aktif di development (dynamic import).

## Query & mutation

```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { get, post } from "~/lib/api/client";

const queryKey = ["destinations"] as const;

function useDestinations() {
  return useQuery({
    queryKey,
    queryFn: () => get<Destination[]>("/destinations").then((r) => r.data),
  });
}
```

## Optimistic update

```ts
const queryClient = useQueryClient();

useMutation({
  mutationFn: (input: NewDestination) => post("/destinations", input),
  onMutate: async (input) => {
    await queryClient.cancelQueries({ queryKey });
    return applyOptimistic<Destination[]>(queryClient, queryKey, (old = []) => [
      ...old,
      { ...input, id: "temp" },
    ]);
  },
  onError: (_err, _input, ctx) => rollbackOptimistic(queryClient, queryKey, ctx),
  onSettled: () => settleInvalidate(queryClient, [queryKey]),
});
```

## Aturan

- **queryKey** selalu array & konsisten (mis. `["destinations"]`, `["destinations", id]`).
- Optimistic: `cancelQueries` → `applyOptimistic`; gagal → `rollbackOptimistic`;
  selesai → `settleInvalidate`.
- **Jangan** panggil `fetch` langsung; selalu lewat `~/lib/api/{client,server}`.
- `staleTime` default 60s, `refetchOnWindowFocus` nonaktif.

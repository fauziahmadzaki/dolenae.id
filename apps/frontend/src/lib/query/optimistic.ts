import type { QueryClient, QueryKey } from "@tanstack/react-query";

export interface OptimisticContext<T> {
  previous: T | undefined;
}

/**
 * Snapshot the current cache value, then apply an optimistic update.
 * Call inside a mutation's `onMutate`.
 *
 *   onMutate: async (next) => {
 *     await queryClient.cancelQueries({ queryKey });
 *     return applyOptimistic<Item[]>(queryClient, queryKey, (old) => [
 *       ...(old ?? []),
 *       { ...next, id: "temp" },
 *     ]);
 *   }
 */
export function applyOptimistic<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  updater: (current: T | undefined) => T,
): OptimisticContext<T> {
  const previous = queryClient.getQueryData<T>(queryKey);
  queryClient.setQueryData<T>(queryKey, (current) => updater(current));
  return { previous };
}

/** Restore the snapshot when the mutation fails. Call inside `onError`. */
export function rollbackOptimistic<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  context: OptimisticContext<T> | undefined,
): void {
  if (context && context.previous !== undefined) {
    queryClient.setQueryData<T>(queryKey, context.previous);
  }
}

/** Refetch from the server to reconcile. Call inside `onSettled`. */
export function settleInvalidate(
  queryClient: QueryClient,
  queryKeys: QueryKey[],
): void {
  for (const key of queryKeys) {
    void queryClient.invalidateQueries({ queryKey: key });
  }
}

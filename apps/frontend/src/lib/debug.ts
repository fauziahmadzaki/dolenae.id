/**
 * Dev-only diagnostic logger. Silent in production builds and in SSR.
 * Usage: `const debug = createDebug("data-table"); debug("state", {...})`.
 */
type Debug = (message: string, payload?: unknown) => void;

const noop: Debug = () => {};

export function createDebug(scope: string): Debug {
  if (process.env.NODE_ENV === "production") return noop;
  return (message, payload) => {
    if (payload === undefined) console.log(`[${scope}] ${message}`);
    else console.log(`[${scope}] ${message}`, payload);
  };
}

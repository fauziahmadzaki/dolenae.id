"use client";

import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const MAX_SEARCH_LENGTH = 120;
const CONTROL_CHARS_RE = /[\x00-\x1F\x7F]/g;

function sliceSurrogateSafe(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  let end = maxLength;
  const code = value.charCodeAt(end - 1);
  if (code >= 0xd800 && code <= 0xdbff) {
    end -= 1;
  }
  return value.slice(0, end);
}

/** Sanitize live search input while preserving internal/trailing spaces. */
export function sanitizeLiveSearch(raw: string): string {
  const cleaned = raw.replace(CONTROL_CHARS_RE, "");
  return sliceSurrogateSafe(cleaned, MAX_SEARCH_LENGTH);
}

/** Sanitize URL `?search=` query values with trimming and length cap. */
export function sanitizeUrlSearch(raw: string | null): string {
  if (!raw) return "";
  const cleaned = raw.replace(CONTROL_CHARS_RE, "").trim();
  return sliceSurrogateSafe(cleaned, MAX_SEARCH_LENGTH).trim();
}

export interface ShellSearchRegistration {
  scopeKey: string;
  value: string;
  placeholder: string;
  onChange: (next: string) => void;
}

interface RegistrationMeta {
  scopeKey: string;
  value: string;
  placeholder: string;
}

interface InternalRegistration extends RegistrationMeta {
  owner: symbol;
}

interface RegisterOptions extends ShellSearchRegistration {
  enabled?: boolean;
}

interface UrlSearchSnapshot {
  pathname: string;
  search: string;
  hasRawSearchParam: boolean;
  rawQuery: string;
}

interface ShellSearchStateValue {
  registration: ShellSearchRegistration | null;
  urlSnapshot: UrlSearchSnapshot | null;
}

interface ShellSearchActionsValue {
  register: (
    owner: symbol,
    meta: RegistrationMeta,
    onChange: (next: string) => void,
  ) => void;
  unregister: (owner: symbol) => void;
  clearUrlSearchParam: () => void;
}

interface ShellSearchContextValue {
  registration: ShellSearchRegistration | null;
  urlSearch: string;
  clearUrlSearchParam: () => void;
  register: (
    owner: symbol,
    meta: RegistrationMeta,
    onChange: (next: string) => void,
  ) => void;
  unregister: (owner: symbol) => void;
}

const ShellSearchStateContext = createContext<ShellSearchStateValue | null>(
  null,
);
const ShellSearchActionsContext =
  createContext<ShellSearchActionsValue | null>(null);

function UrlSearchObserver({
  onChange,
}: {
  onChange: (snapshot: UrlSearchSnapshot) => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasRawSearchParam = searchParams.has("search");
  const search = sanitizeUrlSearch(searchParams.get("search"));
  const rawQuery = searchParams.toString();

  useEffect(() => {
    onChange({ pathname, search, hasRawSearchParam, rawQuery });
  }, [pathname, search, hasRawSearchParam, rawQuery, onChange]);

  return null;
}

export function ShellSearchProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const routerRef = useRef(router);
  routerRef.current = router;

  const handlersRef = useRef<Map<symbol, (next: string) => void>>(new Map());
  const [regMeta, setRegMeta] = useState<InternalRegistration | null>(null);
  const [urlSnapshot, setUrlSnapshot] = useState<UrlSearchSnapshot | null>(
    null,
  );
  const latestSnapshotRef = useRef<UrlSearchSnapshot | null>(null);

  const publishUrlSnapshot = useCallback((next: UrlSearchSnapshot) => {
    latestSnapshotRef.current = next;
    setUrlSnapshot((prev) =>
      prev &&
      prev.pathname === next.pathname &&
      prev.search === next.search &&
      prev.hasRawSearchParam === next.hasRawSearchParam &&
      prev.rawQuery === next.rawQuery
        ? prev
        : next,
    );
  }, []);

  const register = useCallback(
    (
      owner: symbol,
      meta: RegistrationMeta,
      onChange: (next: string) => void,
    ) => {
      handlersRef.current.set(owner, onChange);
      setRegMeta((prev) =>
        prev &&
        prev.owner === owner &&
        prev.scopeKey === meta.scopeKey &&
        prev.value === meta.value &&
        prev.placeholder === meta.placeholder
          ? prev
          : { owner, ...meta },
      );
    },
    [],
  );

  const unregister = useCallback((owner: symbol) => {
    handlersRef.current.delete(owner);
    setRegMeta((prev) => (prev?.owner === owner ? null : prev));
  }, []);

  const clearUrlSearchParam = useCallback(() => {
    const currentPathname = pathnameRef.current;
    const latest = latestSnapshotRef.current;
    const windowSearch =
      typeof window !== "undefined" ? window.location.search : "";
    const windowHasSearch = new URLSearchParams(windowSearch).has("search");
    const snapshotHasSearch =
      latest !== null &&
      latest.pathname === currentPathname &&
      latest.hasRawSearchParam;

    if (!windowHasSearch && !snapshotHasSearch) return;

    const rawSource = windowHasSearch
      ? windowSearch
      : (latest?.rawQuery ?? "");
    const params = new URLSearchParams(rawSource);
    params.delete("search");
    const qs = params.toString();
    const hash = typeof window !== "undefined" ? window.location.hash : "";

    const nextSnapshot: UrlSearchSnapshot = {
      pathname: currentPathname,
      search: "",
      hasRawSearchParam: false,
      rawQuery: qs,
    };
    latestSnapshotRef.current = nextSnapshot;
    setUrlSnapshot(nextSnapshot);
    routerRef.current.replace(
      `${qs ? `${currentPathname}?${qs}` : currentPathname}${hash}`,
      { scroll: false },
    );
  }, []);

  const registration = useMemo<ShellSearchRegistration | null>(() => {
    if (!regMeta) return null;
    return {
      scopeKey: regMeta.scopeKey,
      value: regMeta.value,
      placeholder: regMeta.placeholder,
      onChange: (next: string) => {
        handlersRef.current.get(regMeta.owner)?.(sanitizeLiveSearch(next));
      },
    };
  }, [regMeta]);

  const stateValue = useMemo<ShellSearchStateValue>(
    () => ({ registration, urlSnapshot }),
    [registration, urlSnapshot],
  );

  const actionsValue = useMemo<ShellSearchActionsValue>(
    () => ({ register, unregister, clearUrlSearchParam }),
    [register, unregister, clearUrlSearchParam],
  );

  return (
    <ShellSearchActionsContext.Provider value={actionsValue}>
      <ShellSearchStateContext.Provider value={stateValue}>
        <Suspense fallback={null}>
          <UrlSearchObserver onChange={publishUrlSnapshot} />
        </Suspense>
        {children}
      </ShellSearchStateContext.Provider>
    </ShellSearchActionsContext.Provider>
  );
}

export function useShellSearchContext(): ShellSearchContextValue | null {
  const pathname = usePathname();
  const stateCtx = useContext(ShellSearchStateContext);
  const actionsCtx = useContext(ShellSearchActionsContext);
  if (!stateCtx || !actionsCtx) return null;

  const urlSearch =
    stateCtx.urlSnapshot && stateCtx.urlSnapshot.pathname === pathname
      ? stateCtx.urlSnapshot.search
      : "";

  return {
    registration: stateCtx.registration,
    urlSearch,
    clearUrlSearchParam: actionsCtx.clearUrlSearchParam,
    register: actionsCtx.register,
    unregister: actionsCtx.unregister,
  };
}

/**
 * Bind an active list page or tab to the Topbar search input.
 * Cleanup is bound to a per-hook Symbol owner so route/tab transitions never race.
 */
export function useRegisterShellSearch({
  scopeKey,
  value,
  onChange,
  placeholder,
  enabled = true,
}: RegisterOptions) {
  const actions = useContext(ShellSearchActionsContext);
  const [owner] = useState(() => Symbol("shell-search"));
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!actions) return;
    if (!enabled) {
      actions.unregister(owner);
      return;
    }
    actions.register(
      owner,
      { scopeKey, value, placeholder },
      (next) => onChangeRef.current(next),
    );
  }, [actions, owner, scopeKey, value, placeholder, enabled]);

  useEffect(() => {
    if (!actions) return;
    return () => actions.unregister(owner);
  }, [actions, owner]);
}

/**
 * Reactively sync `?search=` from URL (initial mount, Quick-Jump, Back/Forward)
 * only when the snapshot belongs to the active pathname.
 */
export function useUrlSearchSync(
  onApply: (next: string) => void,
  enabled = true,
) {
  const pathname = usePathname();
  const stateCtx = useContext(ShellSearchStateContext);
  const actions = useContext(ShellSearchActionsContext);
  const urlSnapshot = stateCtx?.urlSnapshot ?? null;

  const onApplyRef = useRef(onApply);
  onApplyRef.current = onApply;
  const lastAppliedRef = useRef<{ pathname: string; search: string } | null>(
    null,
  );
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const hasRawSearchParamRef = useRef(false);
  hasRawSearchParamRef.current = Boolean(
    urlSnapshot &&
      urlSnapshot.pathname === pathname &&
      urlSnapshot.hasRawSearchParam,
  );

  useEffect(() => {
    if (
      !enabled ||
      !stateCtx ||
      !urlSnapshot ||
      urlSnapshot.pathname !== pathname
    ) {
      return;
    }
    if (
      lastAppliedRef.current === null ||
      lastAppliedRef.current.pathname !== pathname
    ) {
      lastAppliedRef.current = { pathname, search: urlSnapshot.search };
      if (urlSnapshot.search) {
        onApplyRef.current(urlSnapshot.search);
      }
      return;
    }
    if (urlSnapshot.search !== lastAppliedRef.current.search) {
      lastAppliedRef.current = { pathname, search: urlSnapshot.search };
      onApplyRef.current(urlSnapshot.search);
    }
  }, [enabled, stateCtx, urlSnapshot, pathname]);

  const clearUrlSearch = useCallback(() => {
    if (!actions) return;
    const hasWindowSearch =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("search");
    if (!hasRawSearchParamRef.current && !hasWindowSearch) return;
    lastAppliedRef.current = { pathname: pathnameRef.current, search: "" };
    actions.clearUrlSearchParam();
  }, [actions]);

  return {
    urlSearch: urlSnapshot?.pathname === pathname ? urlSnapshot.search : "",
    clearUrlSearch,
  };
}

/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type RefreshFn = () => Promise<unknown> | unknown;

type CommercialRevenueRefreshContextValue = {
  refresh: () => Promise<void>;
  isRefreshing: boolean;
  lastUpdatedAt: number;
  registerRefresh: (fn: RefreshFn) => () => void;
};

const CommercialRevenueRefreshContext = createContext<CommercialRevenueRefreshContextValue | null>(
  null
);

export function CommercialRevenueRefreshProvider({ children }: { children: ReactNode }) {
  const fnsRef = useRef(new Set<RefreshFn>());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => Date.now());

  const registerRefresh = useCallback((fn: RefreshFn) => {
    fnsRef.current.add(fn);
    return () => {
      fnsRef.current.delete(fn);
    };
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([...fnsRef.current].map((fn) => Promise.resolve(fn())));
      setLastUpdatedAt(Date.now());
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const value = useMemo(
    () => ({ refresh, isRefreshing, lastUpdatedAt, registerRefresh }),
    [refresh, isRefreshing, lastUpdatedAt, registerRefresh]
  );

  return (
    <CommercialRevenueRefreshContext.Provider value={value}>
      {children}
    </CommercialRevenueRefreshContext.Provider>
  );
}

export function useCommercialRevenueRefresh() {
  const ctx = useContext(CommercialRevenueRefreshContext);
  if (!ctx) {
    throw new Error(
      'useCommercialRevenueRefresh must be used within CommercialRevenueRefreshProvider'
    );
  }
  return ctx;
}

/** Register one or more SWR/frappe mutate callbacks for page-level refresh. */
export function useRegisterCommercialRefresh(...mutates: Array<RefreshFn | undefined>) {
  const { registerRefresh } = useCommercialRevenueRefresh();

  useEffect(() => {
    const unsubscribers = mutates
      .filter((fn): fn is RefreshFn => typeof fn === 'function')
      .map((fn) => registerRefresh(fn));
    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
    // Re-register when mutate identities change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerRefresh, ...mutates]);
}

export function formatUpdatedAgo(lastUpdatedAt: number, now = Date.now()): string {
  const seconds = Math.max(0, Math.floor((now - lastUpdatedAt) / 1000));
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

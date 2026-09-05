/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from 'react';
import { useCommercialMetrics } from './hooks/use-commercial-metrics';
import type { CommercialMetrics } from './utils/derive-commercial-metrics';

type CommercialMetricsContextValue = {
  metrics: CommercialMetrics;
  isLoading: boolean;
  hasData: boolean;
};

const CommercialMetricsContext = createContext<CommercialMetricsContextValue | null>(null);

export function CommercialMetricsProvider({ children }: { children: ReactNode }) {
  const value = useCommercialMetrics();
  return (
    <CommercialMetricsContext.Provider value={value}>{children}</CommercialMetricsContext.Provider>
  );
}

export function useCommercialMetricsContext() {
  const ctx = useContext(CommercialMetricsContext);
  if (!ctx) {
    throw new Error('useCommercialMetricsContext must be used within CommercialMetricsProvider');
  }
  return ctx;
}

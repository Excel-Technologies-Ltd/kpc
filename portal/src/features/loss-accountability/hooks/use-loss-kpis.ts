import { useMemo } from 'react';
import { useFrappeGetCall, useFrappeGetDocList } from 'frappe-react-sdk';
import { RECONCILIATION_DOCTYPE, VARIANCE_DOCTYPE } from '@/constants/doctype.string';
import { LOSS_KPIS, type LossKpi } from '../data/dummy';

export interface LossKpisApiResponse {
  message?: {
    kpis: LossKpi[];
    period?: string;
    is_live?: boolean;
    timestamp?: string;
  };
  kpis?: LossKpi[];
  period?: string;
  is_live?: boolean;
  timestamp?: string;
}

export function useLossKpis(period = 'MTD') {
  // 1. Direct whitelisted Frappe API endpoint
  const {
    data: apiData,
    isLoading: apiLoading,
    error,
    mutate: mutateApi,
  } = useFrappeGetCall<LossKpisApiResponse>(
    'kpc.petroleum_operations.api.loss_accountability.get_loss_accountability_kpis',
    { period }
  );

  // 2. SWR revalidation on Reconciliation and Variance documents
  const { mutate: mutateRecon } = useFrappeGetDocList(RECONCILIATION_DOCTYPE, {
    fields: ['name', 'variance_kl', 'variance_percent'],
    limit: 10,
  });

  const { mutate: mutateVariance } = useFrappeGetDocList(VARIANCE_DOCTYPE, {
    fields: ['name', 'variance_kl', 'loss_category'],
    limit: 10,
  });

  const mutate = () => {
    mutateApi();
    mutateRecon();
    mutateVariance();
  };

  const { kpis, isLive, timestamp } = useMemo(() => {
    const res = (apiData?.message || apiData) as
      | { kpis?: LossKpi[]; is_live?: boolean; timestamp?: string }
      | undefined;

    if (res?.kpis && Array.isArray(res.kpis) && res.kpis.length > 0) {
      return {
        kpis: res.kpis,
        isLive: Boolean(res.is_live),
        timestamp: res.timestamp,
      };
    }

    return {
      kpis: LOSS_KPIS,
      isLive: false,
      timestamp: undefined,
    };
  }, [apiData]);

  return {
    kpis,
    isLive,
    timestamp,
    isLoading: apiLoading,
    error,
    mutate,
  };
}

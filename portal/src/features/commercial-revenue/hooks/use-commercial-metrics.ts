import { ALLOCATION_DOCTYPE, INVOICE_DOCTYPE, TARIFF_DOCTYPE } from '@/constants/doctype.string';
import type { Allocation } from '@/types/PetroleumOperations/Allocation';
import type { Invoice } from '@/types/PetroleumOperations/Invoice';
import type { Tariff } from '@/types/PetroleumOperations/Tariff';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { useMemo } from 'react';
import { useRegisterCommercialRefresh } from '../commercial-revenue-refresh';
import { deriveCommercialMetrics } from '../utils/derive-commercial-metrics';

const INVOICE_FIELDS = [
  'name',
  'customer',
  'posting_date',
  'grand_total',
  'currency',
  'docstatus',
  'sales_invoice',
  'journey_ref',
] as const satisfies ReadonlyArray<keyof Invoice>;

const ALLOCATION_FIELDS = [
  'name',
  'customer',
  'product',
  'allocated_quantity_kl',
  'journey_ref',
  'docstatus',
  'creation',
  'modified',
] as const satisfies ReadonlyArray<keyof Allocation>;

const TARIFF_FIELDS = [
  'name',
  'product',
  'rate_per_kl',
  'currency',
  'is_active',
] as const satisfies ReadonlyArray<keyof Tariff>;

export function useCommercialMetrics() {
  const {
    data: invoices,
    isLoading: invoicesLoading,
    mutate: mutateInvoices,
  } = useFrappeGetDocList<Invoice>(INVOICE_DOCTYPE, {
    fields: [...INVOICE_FIELDS],
    filters: [['docstatus', '=', 1]],
    limit: 500,
    orderBy: { field: 'posting_date', order: 'desc' },
  });

  const {
    data: allocations,
    isLoading: allocationsLoading,
    mutate: mutateAllocations,
  } = useFrappeGetDocList<Allocation>(ALLOCATION_DOCTYPE, {
    fields: [...ALLOCATION_FIELDS],
    filters: [['docstatus', '!=', 2]],
    limit: 1000,
    orderBy: { field: 'modified', order: 'desc' },
  });

  const {
    data: tariffs,
    isLoading: tariffsLoading,
    mutate: mutateTariffs,
  } = useFrappeGetDocList<Tariff>(TARIFF_DOCTYPE, {
    fields: [...TARIFF_FIELDS],
    limit: 200,
    orderBy: { field: 'modified', order: 'desc' },
  });

  useRegisterCommercialRefresh(mutateInvoices, mutateAllocations, mutateTariffs);

  const metrics = useMemo(
    () => deriveCommercialMetrics(invoices ?? [], allocations ?? [], tariffs ?? []),
    [invoices, allocations, tariffs]
  );

  const isLoading = invoicesLoading || allocationsLoading || tariffsLoading;
  const hasData = (invoices?.length ?? 0) > 0 || (allocations?.length ?? 0) > 0;

  return { metrics, isLoading, hasData };
}

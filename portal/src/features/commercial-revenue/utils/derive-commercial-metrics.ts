import { formatMetricValue } from '@/lib/utils';
import type { Allocation } from '@/types/PetroleumOperations/Allocation';
import type { Invoice } from '@/types/PetroleumOperations/Invoice';
import type { Tariff } from '@/types/PetroleumOperations/Tariff';
import { formatCompactKes } from './format-money';

export type CommercialKpi = {
  id: string;
  title: string;
  value: string;
  unit?: string;
  delta: string;
  deltaType: 'up' | 'down' | 'flat';
  description: string;
  color: string;
};

export type MonthProductBucket = {
  /** Short month label e.g. Mar */
  label: string;
  /** YYYY-MM key */
  key: string;
  /** product -> amount */
  byProduct: Record<string, number>;
};

export type ProductMixSlice = {
  product: string;
  amount: number;
};

export type TopCustomerRow = {
  customer: string;
  invoiceCount: number;
  volumeKl: number;
  billed: number;
  postedCount: number;
  status: 'Posted' | 'KPC only' | 'Mixed';
};

export type CommercialMetrics = {
  kpis: CommercialKpi[];
  months: MonthProductBucket[];
  products: string[];
  productMix: ProductMixSlice[];
  topCustomers: TopCustomerRow[];
};

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(d: Date): string {
  return d.toLocaleString(undefined, { month: 'short' });
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isInMonth(iso: string | undefined | null, year: number, month: number): boolean {
  const d = parseDate(iso);
  if (!d) return false;
  return d.getFullYear() === year && d.getMonth() === month;
}

function pctDelta(
  current: number,
  previous: number
): { delta: string; deltaType: 'up' | 'down' | 'flat' } {
  if (previous <= 0 && current <= 0) return { delta: 'flat', deltaType: 'flat' };
  if (previous <= 0) return { delta: 'new', deltaType: 'up' };
  const pct = ((current - previous) / previous) * 100;
  if (Math.abs(pct) < 0.05) return { delta: '0.0%', deltaType: 'flat' };
  const sign = pct > 0 ? '▲' : '▼';
  return {
    delta: `${sign} ${Math.abs(pct).toFixed(1)}%`,
    deltaType: pct > 0 ? 'up' : 'down',
  };
}

function lastNMonths(now: Date, n: number): Date[] {
  const months: Date[] = [];
  for (let i = n - 1; i >= 0; i--) {
    months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  }
  return months;
}

function avgRateForProduct(tariffs: Tariff[], product: string): number {
  const active = tariffs.filter((t) => t.is_active !== 0);
  const pool = active.length > 0 ? active : tariffs;
  const match = pool.filter((t) => t.product === product);
  const use = match.length > 0 ? match : pool;
  if (use.length === 0) return 0;
  return use.reduce((sum, t) => sum + (Number(t.rate_per_kl) || 0), 0) / use.length;
}

/** Group submitted allocations by journey_ref for invoice attribution. */
function allocationsByJourney(allocations: Allocation[]): Map<string, Allocation[]> {
  const map = new Map<string, Allocation[]>();
  for (const a of allocations) {
    if (a.docstatus === 2) continue;
    const key = a.journey_ref?.trim();
    if (!key) continue;
    const list = map.get(key) ?? [];
    list.push(a);
    map.set(key, list);
  }
  return map;
}

/**
 * Attribute invoice grand_total across products using Allocation volumes
 * on the same journey_ref. Falls back to tariff × volume when no invoice
 * match, or a single "Unallocated" bucket when journey has no allocations.
 */
function attributeInvoiceToProducts(
  inv: Invoice,
  journeyAllocs: Allocation[] | undefined,
  tariffs: Tariff[]
): { product: string; amount: number; volumeKl: number }[] {
  const total = Number(inv.grand_total) || 0;
  const allocs = journeyAllocs ?? [];

  if (allocs.length === 0) {
    return total > 0 ? [{ product: 'Unallocated', amount: total, volumeKl: 0 }] : [];
  }

  const volumeTotal = allocs.reduce((sum, a) => sum + (Number(a.allocated_quantity_kl) || 0), 0);

  if (volumeTotal <= 0) {
    const share = total / allocs.length;
    return allocs.map((a) => ({
      product: a.product?.trim() || 'Unknown',
      amount: share,
      volumeKl: 0,
    }));
  }

  return allocs.map((a) => {
    const vol = Number(a.allocated_quantity_kl) || 0;
    const product = a.product?.trim() || 'Unknown';
    // Prefer proportional share of billed invoice total
    const amount =
      total > 0 ? (vol / volumeTotal) * total : vol * avgRateForProduct(tariffs, product);
    return { product, amount, volumeKl: vol };
  });
}

export function deriveCommercialMetrics(
  invoices: Invoice[],
  allocations: Allocation[],
  tariffs: Tariff[],
  now: Date = new Date()
): CommercialMetrics {
  const submitted = invoices.filter((inv) => inv.docstatus === 1);
  const liveAllocations = allocations.filter((a) => a.docstatus !== 2);
  const byJourney = allocationsByJourney(liveAllocations);

  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth();
  const prev = new Date(thisYear, thisMonth - 1, 1);
  const prevYear = prev.getFullYear();
  const prevMonth = prev.getMonth();

  const mtdInvoices = submitted.filter((inv) => isInMonth(inv.posting_date, thisYear, thisMonth));
  const priorInvoices = submitted.filter((inv) => isInMonth(inv.posting_date, prevYear, prevMonth));

  const sumGrand = (list: Invoice[]) =>
    list.reduce((sum, inv) => sum + (Number(inv.grand_total) || 0), 0);

  const revenueMtd = sumGrand(mtdInvoices);
  const revenuePrior = sumGrand(priorInvoices);
  const revenueDelta = pctDelta(revenueMtd, revenuePrior);
  const billedTotal = sumGrand(submitted);
  const customersMtd = new Set(mtdInvoices.map((inv) => inv.customer).filter(Boolean));

  // Volume MTD: allocations on journeys billed this month
  const mtdJourneyRefs = new Set(
    mtdInvoices.map((inv) => inv.journey_ref).filter((j): j is string => Boolean(j?.trim()))
  );
  let volumeMtd = 0;
  if (mtdJourneyRefs.size > 0) {
    for (const a of liveAllocations) {
      if (a.journey_ref && mtdJourneyRefs.has(a.journey_ref)) {
        volumeMtd += Number(a.allocated_quantity_kl) || 0;
      }
    }
  } else {
    // Fallback: allocations created/modified in current month
    for (const a of liveAllocations) {
      if (isInMonth(a.creation || a.modified, thisYear, thisMonth)) {
        volumeMtd += Number(a.allocated_quantity_kl) || 0;
      }
    }
  }

  const activeTariffs = tariffs.filter((t) => t.is_active !== 0);
  const tariffPool = activeTariffs.length > 0 ? activeTariffs : tariffs;
  const avgTariff =
    tariffPool.length > 0
      ? tariffPool.reduce((sum, t) => sum + (Number(t.rate_per_kl) || 0), 0) / tariffPool.length
      : 0;

  const mtdCompact = formatCompactKes(revenueMtd);
  const billedCompact = formatCompactKes(billedTotal);
  const tariffCompact = formatCompactKes(avgTariff);

  const kpis: CommercialKpi[] = [
    {
      id: 'revenue-mtd',
      title: 'Tariff revenue MTD',
      value: formatMetricValue(revenueMtd, 1),
      unit: 'KES',
      delta: revenueDelta.delta,
      deltaType: revenueDelta.deltaType,
      description: 'Submitted invoice grand total this month',
      color: '#10b981',
    },
    {
      id: 'billed-total',
      title: 'Billed total',
      value: formatMetricValue(billedTotal, 1),
      unit: 'KES',
      delta: `${submitted.length} invoices`,
      deltaType: 'flat',
      description: 'All submitted invoices (billed AR proxy)',
      color: '#4361ee',
    },
    {
      id: 'customers-mtd',
      title: 'Customers billed',
      value: String(customersMtd.size),
      delta: 'MTD',
      deltaType: 'flat',
      description: 'Distinct OMC customers invoiced this month',
      color: '#8b5cf6',
    },
    {
      id: 'volume-mtd',
      title: 'Volume billed MTD',
      value: formatMetricValue(volumeMtd),
      unit: 'KL',
      delta: 'via allocations',
      deltaType: 'flat',
      description: 'Allocated KL on journeys invoiced this month',
      color: '#f59e0b',
    },
    {
      id: 'avg-tariff',
      title: 'Avg tariff',
      value: formatMetricValue(avgTariff, 1),
      unit: 'KES/KL',
      delta: activeTariffs.length > 0 ? `${activeTariffs.length} active` : 'blended',
      deltaType: 'flat',
      description: 'Mean rate per KL from active tariffs',
      color: '#06b6d4',
    },
  ];

  // —— Revenue by product (last 6 months) via Invoice × Allocation journey ——
  const monthStarts = lastNMonths(now, 6);
  const monthKeys = new Set(monthStarts.map(monthKey));
  const productsSet = new Set<string>();

  const months: MonthProductBucket[] = monthStarts.map((d) => ({
    label: monthLabel(d),
    key: monthKey(d),
    byProduct: {},
  }));
  const monthIndex = new Map(months.map((m, i) => [m.key, i]));

  const mtdNames = new Set(mtdInvoices.map((inv) => inv.name));
  const mixMap = new Map<string, number>();

  for (const inv of submitted) {
    const d = parseDate(inv.posting_date);
    if (!d) continue;
    const key = monthKey(startOfMonth(d));
    const journeyKey = inv.journey_ref?.trim();
    const parts = attributeInvoiceToProducts(
      inv,
      journeyKey ? byJourney.get(journeyKey) : undefined,
      tariffs
    );

    for (const part of parts) {
      productsSet.add(part.product);
      if (monthKeys.has(key)) {
        const idx = monthIndex.get(key);
        if (idx != null) {
          months[idx]!.byProduct[part.product] =
            (months[idx]!.byProduct[part.product] ?? 0) + part.amount;
        }
      }
      if (mtdNames.has(inv.name)) {
        mixMap.set(part.product, (mixMap.get(part.product) ?? 0) + part.amount);
      }
    }
  }

  // If no MTD mix, use last 6 months totals
  if (mixMap.size === 0) {
    for (const m of months) {
      for (const [product, amount] of Object.entries(m.byProduct)) {
        mixMap.set(product, (mixMap.get(product) ?? 0) + amount);
      }
    }
  }

  // Fallback product series from Allocation × Tariff when no invoices yet
  if (productsSet.size === 0 && liveAllocations.length > 0) {
    for (const a of liveAllocations) {
      const d = parseDate(a.creation || a.modified);
      if (!d) continue;
      const key = monthKey(startOfMonth(d));
      if (!monthKeys.has(key)) continue;
      const product = a.product?.trim() || 'Unknown';
      const amount = (Number(a.allocated_quantity_kl) || 0) * avgRateForProduct(tariffs, product);
      productsSet.add(product);
      const idx = monthIndex.get(key);
      if (idx != null) {
        months[idx]!.byProduct[product] = (months[idx]!.byProduct[product] ?? 0) + amount;
      }
      mixMap.set(product, (mixMap.get(product) ?? 0) + amount);
    }
  }

  const products = [...productsSet].sort();
  const productMix: ProductMixSlice[] = [...mixMap.entries()]
    .map(([product, amount]) => ({ product, amount }))
    .sort((a, b) => b.amount - a.amount);

  // —— Top customers ——
  type Agg = {
    invoiceCount: number;
    volumeKl: number;
    billed: number;
    postedCount: number;
  };
  const byCustomer = new Map<string, Agg>();

  for (const inv of submitted) {
    const customer = inv.customer || 'Unknown';
    const agg = byCustomer.get(customer) ?? {
      invoiceCount: 0,
      volumeKl: 0,
      billed: 0,
      postedCount: 0,
    };
    agg.invoiceCount += 1;
    agg.billed += Number(inv.grand_total) || 0;
    if (inv.sales_invoice) agg.postedCount += 1;

    byCustomer.set(customer, agg);
  }

  // Volume per customer: unique journeys first, else direct allocation customer match
  const journeysByCustomer = new Map<string, Set<string>>();
  for (const inv of submitted) {
    const customer = inv.customer || 'Unknown';
    const journeyKey = inv.journey_ref?.trim();
    if (!journeyKey) continue;
    const set = journeysByCustomer.get(customer) ?? new Set<string>();
    set.add(journeyKey);
    journeysByCustomer.set(customer, set);
  }

  for (const [customer, agg] of byCustomer) {
    const journeys = journeysByCustomer.get(customer);
    if (journeys && journeys.size > 0) {
      for (const journeyKey of journeys) {
        for (const a of byJourney.get(journeyKey) ?? []) {
          agg.volumeKl += Number(a.allocated_quantity_kl) || 0;
        }
      }
      continue;
    }
    for (const a of liveAllocations) {
      if ((a.customer || 'Unknown') === customer) {
        agg.volumeKl += Number(a.allocated_quantity_kl) || 0;
      }
    }
  }

  const topCustomers: TopCustomerRow[] = [...byCustomer.entries()]
    .map(([customer, agg]) => {
      let status: TopCustomerRow['status'] = 'KPC only';
      if (agg.postedCount === agg.invoiceCount && agg.invoiceCount > 0) status = 'Posted';
      else if (agg.postedCount > 0) status = 'Mixed';
      return {
        customer,
        invoiceCount: agg.invoiceCount,
        volumeKl: agg.volumeKl,
        billed: agg.billed,
        postedCount: agg.postedCount,
        status,
      };
    })
    .sort((a, b) => b.billed - a.billed)
    .slice(0, 10);

  return { kpis, months, products, productMix, topCustomers };
}

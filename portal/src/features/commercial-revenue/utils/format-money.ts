/** Compact KES formatting for KPI values and table cells. */
export function formatCompactKes(amount: number): { value: string; unit: string } {
  const n = Number.isFinite(amount) ? amount : 0;
  if (Math.abs(n) >= 1_000_000) {
    const m = n / 1_000_000;
    return {
      value: m >= 100 ? Math.round(m).toLocaleString() : m.toFixed(1).replace(/\.0$/, ''),
      unit: 'M',
    };
  }
  if (Math.abs(n) >= 1_000) {
    const k = n / 1_000;
    return {
      value: k >= 100 ? Math.round(k).toLocaleString() : k.toFixed(1).replace(/\.0$/, ''),
      unit: 'k',
    };
  }
  return { value: Math.round(n).toLocaleString(), unit: '' };
}

export function formatKesLabel(amount: number): string {
  const { value, unit } = formatCompactKes(amount);
  if (unit === 'M') return `KES ${value}M`;
  if (unit === 'k') return `KES ${value}k`;
  return `KES ${value}`;
}

export function formatVolumeKl(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '0';
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

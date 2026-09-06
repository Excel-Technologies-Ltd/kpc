/** Resolve CSS custom properties for Chart.js (theme-aware). */
export function getCssColor(varName: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
}

export function getChartTheme() {
  return {
    chart1: getCssColor('--chart-1', 'oklch(0.556 0 0)'),
    chart2: getCssColor('--chart-2', 'oklch(0.439 0 0)'),
    chart3: getCssColor('--chart-3', 'oklch(0.371 0 0)'),
    chart4: getCssColor('--chart-4', 'oklch(0.269 0 0)'),
    chart5: getCssColor('--chart-5', 'oklch(0.205 0 0)'),
    foreground: getCssColor('--foreground', 'oklch(0.145 0 0)'),
    muted: getCssColor('--muted-foreground', 'oklch(0.556 0 0)'),
    border: getCssColor('--border', 'oklch(0.922 0 0)'),
    card: getCssColor('--card', 'oklch(1 0 0)'),
    destructive: getCssColor('--destructive', 'oklch(0.577 0.245 27.325)'),
  };
}

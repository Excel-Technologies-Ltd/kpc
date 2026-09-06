import { FlowKpiCard } from '@/components/shared/FlowKpiCard';
import { AlertTriangle, Droplets, Fuel, Gauge, Layers, Target, TrendingUp } from 'lucide-react';
import type { ReportSummary } from '../data/dummy';

const COLOR_MAP: Record<ReportSummary['tone'], string> = {
  blue: '#4361ee',
  green: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
};

function parseValueAndUnit(raw: string): { value: string; unit?: string } {
  const trimmed = raw.trim();
  if (trimmed === '—' || trimmed === '-') {
    return { value: '0' };
  }
  if (trimmed.startsWith('KES')) {
    const val = trimmed.replace('KES', '').trim();
    return { value: val, unit: 'KES' };
  }
  if (trimmed.endsWith('%')) {
    return { value: trimmed.replace('%', '').trim(), unit: '%' };
  }
  if (trimmed.includes('m³/h')) {
    return { value: trimmed.replace('m³/h', '').trim(), unit: 'm³/h' };
  }
  if (trimmed.includes('m³')) {
    return { value: trimmed.replace('m³', '').trim(), unit: 'm³' };
  }
  return { value: trimmed };
}

function getDeltaType(delta: string): 'up' | 'down' | 'flat' {
  const d = delta.toLowerCase();
  if (d.includes('▲') || d.includes('ahead') || d.includes('record') || d.includes('improving')) {
    return 'up';
  }
  if (
    d.includes('▼') ||
    d.includes('lagging') ||
    d.includes('below') ||
    d.includes('past due') ||
    d.includes('risk')
  ) {
    return 'down';
  }
  return 'flat';
}

function getSummaryIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes('total throughput') || l.includes('volume') || l.includes('stock')) {
    return <Fuel className='size-4' />;
  }
  if (l.includes('attain') || l.includes('target') || l.includes('plan')) {
    return <Target className='size-4' />;
  }
  if (l.includes('flow') || l.includes('rate') || l.includes('velocity')) {
    return <Gauge className='size-4' />;
  }
  if (l.includes('cumulative') || l.includes('mtd') || l.includes('ullage')) {
    return <Layers className='size-4' />;
  }
  if (l.includes('alarm') || l.includes('breach') || l.includes('loss') || l.includes('overdue')) {
    return <AlertTriangle className='size-4' />;
  }
  if (l.includes('revenue') || l.includes('billed') || l.includes('uptime')) {
    return <TrendingUp className='size-4' />;
  }
  return <Droplets className='size-4' />;
}

function getSummaryDescription(label: string): string {
  const l = label.toLowerCase();
  if (l.includes('total throughput')) return 'Volume moved across trunk & branch lines';
  if (l.includes('plan attainment')) return 'Actual vs scheduled nomination target';
  if (l.includes('avg flow rate')) return 'Mean line pumping velocity';
  if (l.includes('cumulative mtd')) return 'Aggregated month-to-date throughput';
  if (l.includes('physical stock')) return 'Total depot inventory across tanks';
  if (l.includes('available ullage')) return 'Room to receive incoming batches';
  if (l.includes('net variance')) return 'Reconciled tolerance variance';
  if (l.includes('tanks in alarm')) return 'Tanks exceeding safe level thresholds';
  if (l.includes('system loss')) return 'Network unaccounted-for loss vs throughput';
  if (l.includes('revenue billed')) return 'Gross tariff billings to OMC customers';
  return 'Operational pipeline telemetry';
}

export function ReportSummaryRow({
  items,
  isLoading = false,
}: {
  items: ReportSummary[];
  isLoading?: boolean;
}) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 min-w-0 items-stretch gap-3'>
      {items.map((s, index) => {
        const { value, unit } = parseValueAndUnit(s.value);
        const deltaType = getDeltaType(s.delta);
        const color = COLOR_MAP[s.tone] || '#4361ee';
        const icon = getSummaryIcon(s.label);
        const description = getSummaryDescription(s.label);

        return (
          <div key={s.label} className='h-full min-w-0'>
            <FlowKpiCard
              title={s.label}
              value={value}
              unit={unit}
              delta={s.delta}
              deltaType={deltaType}
              description={description}
              color={color}
              icon={icon}
              delay={index * 0.08}
              isLoading={isLoading}
            />
          </div>
        );
      })}
    </div>
  );
}

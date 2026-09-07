import { FlowKpiCard } from '@/components/shared/FlowKpiCard';
import { formatMetricValue } from '@/lib/utils';
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
  let unit: string | undefined;
  let valStr = trimmed;

  if (trimmed.startsWith('KES')) {
    valStr = trimmed.replace('KES', '').trim();
    unit = 'KES';
  } else if (trimmed.endsWith('KES')) {
    valStr = trimmed.replace(/KES$/i, '').trim();
    unit = 'KES';
  } else if (trimmed.endsWith('%')) {
    valStr = trimmed.replace('%', '').trim();
    unit = '%';
  } else if (trimmed.includes('m³/h')) {
    valStr = trimmed.replace('m³/h', '').trim();
    unit = 'm³/h';
  } else if (trimmed.includes('m³')) {
    valStr = trimmed.replace('m³', '').trim();
    unit = 'm³';
  } else if (trimmed.includes('KL')) {
    valStr = trimmed.replace('KL', '').trim();
    unit = 'KL';
  }

  // Normalize negative formats like "60–" or "–60"
  if (valStr.endsWith('–') || valStr.endsWith('-')) {
    valStr = '-' + valStr.slice(0, -1).trim();
  } else if (valStr.startsWith('–')) {
    valStr = '-' + valStr.slice(1).trim();
  }

  // Normalize numbers with existing suffix (e.g. "108.550k" -> "108.55K", "71.450k" -> "71.45K")
  const suffixMatch = valStr.match(/^([+-]?\d+(?:\.\d+)?)\s*([kKmMbBtT])$/);
  if (suffixMatch) {
    const num = parseFloat(suffixMatch[1]);
    const suf = suffixMatch[2].toUpperCase();
    if (suffixMatch[1].includes('.')) {
      valStr = `${num.toFixed(2)}${suf}`;
    } else {
      valStr = `${num}${suf}`;
    }
  } else {
    // Format large raw numbers (e.g. 108,550 m³ -> 108.55K m³, 71,450 m³ -> 71.45K m³)
    const cleanNum = Number(valStr.replace(/,/g, ''));
    if (Number.isFinite(cleanNum) && !/[KkMmBbBtT]/.test(valStr)) {
      if (unit !== '%' && Math.abs(cleanNum) >= 1_000) {
        valStr = formatMetricValue(cleanNum, 2);
      }
    }
  }

  return { value: valStr, unit };
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

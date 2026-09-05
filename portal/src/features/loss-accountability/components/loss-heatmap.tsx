import { SectionCard } from '@/components/shared/SectionCard';
import { cn } from '@/lib/utils';
import { LOSS_HEATMAP } from '../data/dummy';

/** Map loss % 0–0.35+ to green→amber→red. */
function heatColor(v: number): string {
  const t = Math.min(1, Math.max(0, v / 0.35));
  if (t < 0.4) {
    return `oklch(${0.72 - t * 0.1} ${0.12 + t * 0.05} ${145 + t * 20})`;
  }
  if (t < 0.7) {
    return `oklch(${0.75 - (t - 0.4) * 0.15} 0.14 ${85 - (t - 0.4) * 40})`;
  }
  return `oklch(${0.62 - (t - 0.7) * 0.15} 0.18 ${25})`;
}

export function LossHeatmap() {
  const { segments, products, data } = LOSS_HEATMAP;

  return (
    <SectionCard
      title='Loss heatmap'
      tag='loss % by segment × product'
      caption='Greener is better, redder is worse. Find the problem leg in one glance.'
    >
      <div className='overflow-x-auto'>
        <div
          className='grid min-w-105 gap-1'
          style={{ gridTemplateColumns: `minmax(8.5rem,1.4fr) repeat(${products.length}, 1fr)` }}
        >
          <div />
          {products.map((p) => (
            <div
              key={p}
              className='text-muted-foreground py-1 text-center text-[10px] font-semibold tracking-wide uppercase'
            >
              {p}
            </div>
          ))}
          {segments.map((seg, i) => (
            <div key={seg} className='contents'>
              <div className='text-foreground flex items-center pr-2 text-[11px] font-medium'>
                {seg}
              </div>
              {data[i]!.map((v, j) => (
                <div
                  key={`${seg}-${products[j]}`}
                  title={`${v.toFixed(2)}%`}
                  className={cn(
                    'flex h-10 items-center justify-center rounded-md text-[11px] font-semibold tabular-nums text-white/95 shadow-sm',
                    'ring-1 ring-black/5 dark:ring-white/10'
                  )}
                  style={{ background: heatColor(v) }}
                >
                  {v.toFixed(2)}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className='text-muted-foreground mt-3 flex items-center gap-2 text-[10px]'>
          <span>0.00%</span>
          <div className='h-1.5 flex-1 rounded-full bg-linear-to-r from-emerald-400 via-amber-400 to-rose-500' />
          <span>0.35%+</span>
        </div>
      </div>
    </SectionCard>
  );
}

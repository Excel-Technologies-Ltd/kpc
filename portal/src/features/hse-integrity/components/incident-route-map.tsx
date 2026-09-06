import { SectionCard } from '@/components/shared/SectionCard';
import { useTheme } from '@/components/theme-provider';
import { ROUTE_INCIDENTS, ROUTE_STATIONS } from '../data/dummy';

export function IncidentRouteMap() {
  const { theme } = useTheme();
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  const line = isDark ? '#334155' : '#cbd5e1';
  const ink = isDark ? '#94a3b8' : '#64748b';
  const primary = isDark ? '#33c9b7' : '#0d9488';

  return (
    <SectionCard
      title='Incident map'
      tag='trunk line route'
      caption='Where events happened along Mombasa–Nairobi. Marker size scales with severity.'
    >
      <div className='space-y-4'>
        <svg viewBox='0 0 620 120' className='h-auto w-full' preserveAspectRatio='xMidYMid meet'>
          <line
            x1='40'
            y1='50'
            x2='580'
            y2='50'
            stroke={line}
            strokeWidth='7'
            strokeLinecap='round'
          />
          <line
            x1='40'
            y1='50'
            x2='580'
            y2='50'
            stroke={primary}
            strokeWidth='2.5'
            strokeLinecap='round'
            strokeDasharray='6 8'
          />
          {ROUTE_STATIONS.map((s) => (
            <g key={s.name}>
              <circle cx={s.x} cy='50' r='5' fill={primary} />
              <text
                x={s.x}
                y='78'
                textAnchor='middle'
                fill={ink}
                fontSize='10'
                fontFamily='inherit'
              >
                {s.name}
              </text>
            </g>
          ))}
          {ROUTE_INCIDENTS.map((inc, i) => (
            <g key={i}>
              <circle cx={inc.x} cy='50' r={inc.r} fill={inc.color} opacity='0.22' />
              <circle cx={inc.x} cy='50' r='4.5' fill={inc.color} />
            </g>
          ))}
        </svg>
        <div className='border-border/60 bg-card/80 flex items-center gap-4 rounded-xl border px-4 py-3'>
          <div className='text-foreground font-mono text-4xl font-black tracking-tight tabular-nums'>
            214
          </div>
          <div className='text-muted-foreground text-sm leading-snug'>
            days without a
            <br />
            lost-time injury
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

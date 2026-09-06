import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OIL_TANK_DOCTYPE, TANK_MEASUREMENT_DOCTYPE } from '@/constants/doctype.string';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { useMemo } from 'react';

interface OilTankDoc {
  name: string;
  tank_name?: string;
  tank_code?: string;
  terminal?: string;
  product?: string;
  current_state?: 'Active' | 'Maintenance' | 'Quarantine' | 'Decommissioned' | string;
  capacity_kl?: number;
  safe_fill_capacity_kl?: number;
  reference_height_mm?: number;
}

interface TankMeasurementDoc {
  name: string;
  tank: string;
  observed_level_mm?: number;
  observed_temperature_c?: number;
  net_standard_volume_kl?: number;
  measurement_datetime?: string;
}

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

function statusMeta(state: string): {
  color: string;
  label: string;
  variant: BadgeVariant;
} {
  const lower = state.toLowerCase();
  if (lower === 'active') {
    return { color: '#33C9B7', label: state, variant: 'default' };
  }
  if (lower.includes('maint')) {
    return { color: '#F0A83C', label: 'Maintenance', variant: 'outline' };
  }
  if (lower.includes('quarant')) {
    return { color: '#E5555C', label: 'Quarantined', variant: 'destructive' };
  }
  return { color: '#5A6D8C', label: state, variant: 'secondary' };
}

export function TankFarmSection() {
  const { data: tanks, isLoading: tanksLoading } = useFrappeGetDocList<OilTankDoc>(
    OIL_TANK_DOCTYPE,
    {
      fields: [
        'name',
        'tank_name',
        'tank_code',
        'terminal',
        'product',
        'current_state',
        'capacity_kl',
        'safe_fill_capacity_kl',
        'reference_height_mm',
      ],
      limit: 100,
    }
  );

  const { data: measurements, isLoading: measurementsLoading } =
    useFrappeGetDocList<TankMeasurementDoc>(TANK_MEASUREMENT_DOCTYPE, {
      fields: [
        'name',
        'tank',
        'observed_level_mm',
        'observed_temperature_c',
        'net_standard_volume_kl',
        'measurement_datetime',
      ],
      orderBy: {
        field: 'measurement_datetime',
        order: 'desc',
      },
      limit: 500,
    });

  const latestMeasurementMap = useMemo(() => {
    const map = new Map<string, TankMeasurementDoc>();
    if (measurements) {
      for (const m of measurements) {
        if (m.tank && !map.has(m.tank)) {
          map.set(m.tank, m);
        }
      }
    }
    return map;
  }, [measurements]);

  const isLoading = tanksLoading || measurementsLoading;

  return (
    <section id='tank-cards' className='scroll-mt-24 space-y-4'>
      <div>
        <h2 className='text-foreground text-lg font-medium'>Tank cards</h2>
        <p className='text-muted-foreground text-sm'>
          Live fill levels across Mombasa and Nairobi. A tank under Maintenance or Quarantine blocks
          any new measurement.
        </p>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className='animate-pulse opacity-60'>
              <CardContent className='flex gap-4 pt-2'>
                <div className='bg-muted h-24 w-14 rounded-md' />
                <div className='flex-1 space-y-2'>
                  <div className='bg-muted h-3.5 w-3/5 rounded' />
                  <div className='bg-muted h-2.5 w-2/5 rounded' />
                  <div className='bg-muted h-6 w-4/5 rounded' />
                </div>
              </CardContent>
            </Card>
          ))
        ) : !tanks || tanks.length === 0 ? (
          <Card className='sm:col-span-2 lg:col-span-4'>
            <CardContent className='text-muted-foreground py-8 text-center text-sm'>
              No tank records found in the system.
            </CardContent>
          </Card>
        ) : (
          tanks.map((tank) => {
            const measurement = latestMeasurementMap.get(tank.name);
            const state = tank.current_state || 'Active';

            let levelPercent = 0;
            if (measurement) {
              if (tank.reference_height_mm && measurement.observed_level_mm) {
                levelPercent = Math.min(
                  100,
                  Math.max(
                    0,
                    Math.round((measurement.observed_level_mm / tank.reference_height_mm) * 100)
                  )
                );
              } else if (tank.capacity_kl && measurement.net_standard_volume_kl) {
                levelPercent = Math.min(
                  100,
                  Math.max(
                    0,
                    Math.round((measurement.net_standard_volume_kl / tank.capacity_kl) * 100)
                  )
                );
              }
            }

            const tempDisplay =
              measurement?.observed_temperature_c !== undefined
                ? `${measurement.observed_temperature_c.toFixed(1)}°C`
                : '—';

            const meta = statusMeta(state);
            const fillHeight = Math.max(0, Math.round((levelPercent / 100) * 88));
            const fillY = 4 + (88 - fillHeight);
            const clipId = `clip-${tank.name.replace(/[^a-zA-Z0-9-_]/g, '')}`;

            return (
              <Card key={tank.name}>
                <CardHeader className='pb-0'>
                  <CardTitle className='truncate' title={tank.tank_name || tank.name}>
                    {tank.tank_name || tank.name}
                  </CardTitle>
                  <CardDescription>
                    {tank.terminal || 'Terminal'} · {tank.product || 'All Products'}
                  </CardDescription>
                </CardHeader>
                <CardContent className='flex items-end gap-4'>
                  <svg
                    viewBox='0 0 56 96'
                    width='56'
                    height='96'
                    className='text-border shrink-0'
                    aria-hidden
                  >
                    <rect
                      x='4'
                      y='4'
                      width='48'
                      height='88'
                      rx='6'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                    />
                    <clipPath id={clipId}>
                      <rect x='4' y='4' width='48' height='88' rx='6' />
                    </clipPath>
                    {fillHeight > 0 && (
                      <rect
                        x='4'
                        y={fillY}
                        width='48'
                        height={fillHeight}
                        fill={meta.color}
                        opacity='0.85'
                        clipPath={`url(#${clipId})`}
                      />
                    )}
                  </svg>
                  <div className='min-w-0 flex-1 space-y-2'>
                    <div className='text-muted-foreground flex gap-4 text-[10px] tracking-wide uppercase'>
                      <div>
                        Level{' '}
                        <b className='text-foreground ml-1 font-mono text-sm normal-case'>
                          {levelPercent}%
                        </b>
                      </div>
                      <div>
                        Temp{' '}
                        <b className='text-foreground ml-1 font-mono text-sm normal-case'>
                          {tempDisplay}
                        </b>
                      </div>
                    </div>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </section>
  );
}

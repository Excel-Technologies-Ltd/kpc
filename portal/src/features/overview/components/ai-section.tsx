import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTheme } from '@/components/theme-provider';
import { getChartTheme } from '@/lib/chart-theme';
import Chart from 'chart.js/auto';
import { useEffect, useRef } from 'react';

const ALERTS = [
  {
    id: 'overpressure',
    severity: 'high' as const,
    title: 'Overpressure — Movement MV-0091',
    time: '2m ago',
    desc: 'Pressure 18.4 bar against a 15.0 bar envelope on the Mombasa–Nairobi line. AI Prediction: 72% failure risk within 48h.',
    risk: 72,
    riskLabel: '72% risk',
    status: 'PENDING' as const,
  },
  {
    id: 'vibration',
    severity: 'med' as const,
    title: 'Vibration drift — Pump Station KP2',
    time: '41m ago',
    desc: 'Vibration reading 6.1 mm/s trending upward. Maintenance Work Order drafted, awaiting Approve/Reject.',
    risk: 38,
    riskLabel: '38% risk',
    status: 'PENDING' as const,
  },
  {
    id: 'flow',
    severity: 'med' as const,
    title: 'Flow anomaly — OT Telemetry ingest',
    time: '3h ago',
    desc: 'Flow rate breach on secure SCADA ingest channel OT-114. Resolved after valve recalibration.',
    risk: 100,
    riskLabel: 'Approved',
    status: 'APPROVED' as const,
  },
];

export function AISection() {
  const { theme } = useTheme();
  const reconCanvasRef = useRef<HTMLCanvasElement>(null);
  const lossDonutCanvasRef = useRef<HTMLCanvasElement>(null);
  const reconChartRef = useRef<Chart | null>(null);
  const lossDonutRef = useRef<Chart | null>(null);

  useEffect(() => {
    const theme = getChartTheme();

    if (reconCanvasRef.current) {
      reconChartRef.current?.destroy();
      reconChartRef.current = new Chart(reconCanvasRef.current, {
        data: {
          labels: ['JNY-034', 'JNY-036', 'JNY-038', 'JNY-040', 'JNY-042'],
          datasets: [
            {
              type: 'bar',
              label: 'Variance %',
              data: [0.22, 0.35, 0.51, 0.28, 0.31],
              backgroundColor: theme.chart1,
              borderRadius: 2,
              barThickness: 22,
            },
            {
              type: 'line',
              label: 'Tolerance',
              data: [0.42, 0.42, 0.42, 0.42, 0.42],
              borderColor: theme.chart2,
              borderDash: [4, 4],
              pointRadius: 0,
              borderWidth: 1.6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: theme.muted,
                font: { size: 10.5 },
                boxWidth: 10,
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: theme.muted,
                font: { size: 10 },
              },
            },
            y: {
              grid: { color: theme.border },
              ticks: {
                color: theme.muted,
                font: { size: 10 },
                callback: (v) => v + '%',
              },
            },
          },
        },
      });
    }

    if (lossDonutCanvasRef.current) {
      lossDonutRef.current?.destroy();
      lossDonutRef.current = new Chart(lossDonutCanvasRef.current, {
        type: 'doughnut',
        data: {
          labels: [
            'Measurement tolerance',
            'Evaporation',
            'Theft / unexplained',
          ],
          datasets: [
            {
              data: [54, 31, 15],
              backgroundColor: [theme.chart1, theme.chart2, theme.destructive],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '68%',
          plugins: { legend: { display: false }, tooltip: { enabled: true } },
        },
      });
    }

    return () => {
      reconChartRef.current?.destroy();
      lossDonutRef.current?.destroy();
    };
  }, [theme]);

  return (
    <section id='ai' className='scroll-mt-24 space-y-4'>
      <div>
        <h2 className='text-foreground text-lg font-medium'>
          Predictive maintenance &amp; reconciliation
        </h2>
        <p className='text-muted-foreground text-sm'>
          Deterministic anomaly scoring against a documented safe envelope — no
          recommendation executes without human approval.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <Card>
          <CardHeader className='border-border border-b'>
            <div className='flex items-center justify-between gap-2'>
              <CardTitle>AI alerts &amp; recommendations</CardTitle>
              <Badge variant='outline'>3 open</Badge>
            </div>
            <CardDescription>
              Human-in-the-loop approvals required
            </CardDescription>
          </CardHeader>
          <CardContent className='divide-border divide-y p-0'>
            {ALERTS.map((alert) => (
              <div
                key={alert.id}
                className='flex items-start gap-3 px-6 py-4'
              >
                <div
                  className={
                    alert.severity === 'high'
                      ? 'bg-destructive/10 text-destructive flex size-8 shrink-0 items-center justify-center rounded-md'
                      : 'bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md'
                  }
                >
                  {alert.severity === 'high' ? (
                    <svg
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      className='size-4'
                    >
                      <path d='M12 9v4M12 17h.01M10.3 3.9L2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z' />
                    </svg>
                  ) : (
                    <svg
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      className='size-4'
                    >
                      <circle cx='12' cy='12' r='9' />
                      <path d='M12 8v5M12 16h.01' />
                    </svg>
                  )}
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-baseline justify-between gap-2'>
                    <span className='text-foreground text-sm font-medium'>
                      {alert.title}
                    </span>
                    <span className='text-muted-foreground text-xs'>
                      {alert.time}
                    </span>
                  </div>
                  <p className='text-muted-foreground mt-1 text-xs leading-relaxed'>
                    {alert.desc}
                  </p>
                  <div className='mt-2 flex items-center gap-2'>
                    <div className='bg-muted h-1.5 flex-1 overflow-hidden rounded-full'>
                      <div
                        className={
                          alert.status === 'APPROVED'
                            ? 'bg-primary h-full rounded-full'
                            : alert.severity === 'high'
                              ? 'bg-destructive h-full rounded-full'
                              : 'bg-muted-foreground h-full rounded-full'
                        }
                        style={{ width: `${alert.risk}%` }}
                      />
                    </div>
                    <span className='text-muted-foreground shrink-0 text-xs'>
                      {alert.riskLabel}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={
                    alert.status === 'APPROVED' ? 'default' : 'secondary'
                  }
                >
                  {alert.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='border-border border-b'>
            <div className='flex items-center justify-between gap-2'>
              <CardTitle>Reconciliation variance</CardTitle>
              <Badge variant='outline'>tolerance 0.42%</Badge>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='h-[200px]'>
              <canvas ref={reconCanvasRef} />
            </div>
            <div className='flex items-center gap-4'>
              <div className='size-[110px] shrink-0'>
                <canvas ref={lossDonutCanvasRef} />
              </div>
              <div className='text-muted-foreground flex-1 space-y-2 text-xs'>
                <div className='flex items-center justify-between gap-2'>
                  <span className='flex items-center gap-2'>
                    <span className='bg-chart-1 size-2.5 rounded-sm' />
                    Measurement tolerance
                  </span>
                  <b className='text-foreground font-mono'>54%</b>
                </div>
                <div className='flex items-center justify-between gap-2'>
                  <span className='flex items-center gap-2'>
                    <span className='bg-chart-2 size-2.5 rounded-sm' />
                    Evaporation
                  </span>
                  <b className='text-foreground font-mono'>31%</b>
                </div>
                <div className='flex items-center justify-between gap-2'>
                  <span className='flex items-center gap-2'>
                    <span className='bg-destructive size-2.5 rounded-sm' />
                    Theft / unexplained
                  </span>
                  <b className='text-foreground font-mono'>15%</b>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

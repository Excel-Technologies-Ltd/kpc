import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTheme } from '@/components/theme-provider';
import { getChartTheme } from '@/lib/chart-theme';
import Chart from 'chart.js/auto';
import { useEffect, useRef } from 'react';

export function CommercialSection() {
  const { theme } = useTheme();
  const funnelCanvasRef = useRef<HTMLCanvasElement>(null);
  const revenueCanvasRef = useRef<HTMLCanvasElement>(null);
  const creditCanvasRef = useRef<HTMLCanvasElement>(null);
  const funnelRef = useRef<Chart | null>(null);
  const revenueRef = useRef<Chart | null>(null);
  const creditRef = useRef<Chart | null>(null);

  useEffect(() => {
    const theme = getChartTheme();

    if (funnelCanvasRef.current) {
      funnelRef.current?.destroy();
      funnelRef.current = new Chart(funnelCanvasRef.current, {
        type: 'bar',
        data: {
          labels: [
            'Submitted',
            'Credit + stock OK',
            'Batched',
            'Dispatched',
            'Invoiced',
          ],
          datasets: [
            {
              data: [46, 41, 37, 33, 30],
              backgroundColor: theme.chart1,
              borderRadius: 2,
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { color: theme.border },
              ticks: { color: theme.muted },
            },
            y: {
              grid: { display: false },
              ticks: { color: theme.foreground, font: { size: 11 } },
            },
          },
        },
      });
    }

    if (revenueCanvasRef.current) {
      revenueRef.current?.destroy();
      revenueRef.current = new Chart(revenueCanvasRef.current, {
        type: 'line',
        data: {
          labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          datasets: [
            {
              data: [420, 455, 470, 510, 560, 618],
              borderColor: theme.chart2,
              backgroundColor: theme.chart2,
              fill: false,
              tension: 0.35,
              pointRadius: 3,
              pointBackgroundColor: theme.chart2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: theme.muted } },
            y: { grid: { color: theme.border }, ticks: { color: theme.muted } },
          },
        },
      });
    }

    if (creditCanvasRef.current) {
      creditRef.current?.destroy();
      creditRef.current = new Chart(creditCanvasRef.current, {
        type: 'bar',
        data: {
          labels: [
            'Vivo Energy',
            'TotalEnergies',
            'Rubis',
            'Ola Energy',
            'Astrol',
          ],
          datasets: [
            {
              data: [82, 64, 49, 37, 22],
              backgroundColor: [
                theme.destructive,
                theme.chart2,
                theme.chart2,
                theme.chart1,
                theme.chart1,
              ],
              borderRadius: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: theme.foreground, font: { size: 10 } },
            },
            y: {
              grid: { color: theme.border },
              ticks: { color: theme.muted, callback: (v) => v + '%' },
            },
          },
        },
      });
    }

    return () => {
      funnelRef.current?.destroy();
      revenueRef.current?.destroy();
      creditRef.current?.destroy();
    };
  }, [theme]);

  return (
    <section id='commercial' className='scroll-mt-24 space-y-4'>
      <div>
        <h2 className='text-foreground text-lg font-medium'>
          Commercial &amp; finance
        </h2>
        <p className='text-muted-foreground text-sm'>
          From accepted Nomination through to Sales Invoice and GL posting,
          every figure carries its journey_ref.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>Nomination funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-[220px]'>
              <canvas ref={funnelCanvasRef} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue invoiced (KES M)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-[220px]'>
              <canvas ref={revenueCanvasRef} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Credit exposure by customer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-[220px]'>
              <canvas ref={creditCanvasRef} />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

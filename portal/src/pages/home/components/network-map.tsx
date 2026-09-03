import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Droplets, Gauge, Radio } from 'lucide-react';

export function NetworkMap() {
  // Kenya pipeline nodes coordinates stretched across full-width widescreen layout
  const nodes = [
    {
      id: 'mba',
      name: 'Mombasa Terminal',
      stock: '52.4k m³ · Kipevu Hub',
      x: 840,
      y: 190,
      isDepot: true,
      flow: '1,240 m³/h',
      pressure: '64.2 bar',
    },
    {
      id: 'mtito',
      name: 'Mtito Andei',
      stock: 'Pump Station 3 (PS3)',
      x: 680,
      y: 150,
      isDepot: false,
      flow: '1,210 m³/h',
      pressure: '58.0 bar',
    },
    {
      id: 'shamud',
      name: 'Sultan Hamud',
      stock: 'Pump Station 4 (PS4)',
      x: 530,
      y: 115,
      isDepot: false,
      flow: '1,195 m³/h',
      pressure: '52.4 bar',
    },
    {
      id: 'nbo',
      name: 'Nairobi Terminal',
      stock: '128.6k m³ · Industrial Area',
      x: 380,
      y: 85,
      isDepot: true,
      flow: '1,180 m³/h',
      pressure: '44.8 bar',
    },
    {
      id: 'nak',
      name: 'Nakuru Depot',
      stock: '31.2k m³ · Rift Valley Hub',
      x: 235,
      y: 65,
      isDepot: true,
      flow: '680 m³/h',
      pressure: '38.5 bar',
    },
    {
      id: 'eld',
      name: 'Eldoret Depot',
      stock: 'Line 3 Spur · 18.5k m³',
      x: 90,
      y: 40,
      isDepot: true,
      flow: 'Standby',
      pressure: '12.0 bar',
    },
    {
      id: 'kis',
      name: 'Kisumu Terminal',
      stock: '24.8k m³ · Lake Jetty',
      x: 90,
      y: 155,
      isDepot: true,
      flow: '490 m³/h',
      pressure: '32.1 bar',
    },
  ];

  const segments = [
    { from: 'mba', to: 'mtito', color: '#10b981', active: true, label: 'Line 5' },
    { from: 'mtito', to: 'shamud', color: '#10b981', active: true, label: 'Line 5' },
    { from: 'shamud', to: 'nbo', color: '#f43f5e', active: true, label: 'Alarm / Watch' },
    { from: 'nbo', to: 'nak', color: '#10b981', active: true, label: 'Line 4' },
    { from: 'nak', to: 'eld', color: '#f59e0b', active: false, label: 'Line 3 Standby' },
    { from: 'nak', to: 'kis', color: '#10b981', active: true, label: 'Line 6' },
  ];

  const getNode = (id: string) => nodes.find((n) => n.id === id);

  return (
    <Card className='w-full border-[#e6edf7] bg-white shadow-sm dark:border-[#233252] dark:bg-[#0f1728]'>
      <CardHeader className='flex flex-wrap items-center justify-between gap-3 border-b border-[#e6edf7] pb-3 dark:border-[#233252]'>
        <div>
          <div className='flex items-center gap-2'>
            <CardTitle className='text-base font-bold text-[#132038] dark:text-foreground'>
              Network Status
            </CardTitle>
            <Badge
              variant='outline'
              className='gap-1 border-blue-200 bg-blue-50 text-[#4361ee] dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300'
            >
              <Radio className='size-3 animate-pulse text-emerald-500' />
              Live SCADA Telemetry
            </Badge>
          </div>
          <p className='mt-0.5 text-xs text-[#5c6b85] dark:text-muted-foreground'>
            Active pipeline flow telemetry across trunk lines (Lines 1 to 6) from Mombasa Port to Western Terminals
          </p>
        </div>

        {/* Live Network Quick Stats */}
        <div className='flex flex-wrap items-center gap-2 text-xs'>
          <div className='flex items-center gap-1.5 rounded-lg border border-[#e6edf7] bg-slate-50 px-2.5 py-1 font-medium text-[#5c6b85] dark:border-[#233252] dark:bg-[#131d31] dark:text-slate-300'>
            <Droplets className='size-3.5 text-[#4361ee]' />
            Flow Rate: <b className='text-[#132038] dark:text-white'>1,240 m³/h</b>
          </div>
          <div className='flex items-center gap-1.5 rounded-lg border border-[#e6edf7] bg-slate-50 px-2.5 py-1 font-medium text-[#5c6b85] dark:border-[#233252] dark:bg-[#131d31] dark:text-slate-300'>
            <Gauge className='size-3.5 text-emerald-500' />
            Main Trunk Pressure: <b className='text-[#132038] dark:text-white'>64.2 bar</b>
          </div>
        </div>
      </CardHeader>

      <CardContent className='p-4'>
        <div className='relative h-[250px] w-full overflow-hidden rounded-xl bg-gradient-to-b from-[#f8fafc] to-[#eef3fb] p-2 dark:from-[#0a101d] dark:to-[#0f1728]'>
          <svg
            viewBox='0 0 960 250'
            className='size-full'
            preserveAspectRatio='xMidYMid meet'
          >
            {/* Draw segment flow lines */}
            {segments.map((seg, idx) => {
              const n1 = getNode(seg.from);
              const n2 = getNode(seg.to);
              if (!n1 || !n2) return null;

              return (
                <g key={idx}>
                  {/* Base pipeline track */}
                  <line
                    x1={n1.x}
                    y1={n1.y}
                    x2={n2.x}
                    y2={n2.y}
                    stroke={seg.color}
                    strokeWidth='6'
                    strokeLinecap='round'
                    opacity='0.25'
                  />
                  {/* Animated live flow pulses */}
                  {seg.active && (
                    <line
                      x1={n1.x}
                      y1={n1.y}
                      x2={n2.x}
                      y2={n2.y}
                      stroke={seg.color}
                      strokeWidth='2.8'
                      strokeLinecap='round'
                      strokeDasharray='6 10'
                      className='animate-[dash_1.5s_linear_infinite]'
                    />
                  )}
                </g>
              );
            })}

            {/* Draw terminal depots and pump station nodes */}
            {nodes.map((node) => (
              <g key={node.id}>
                {node.isDepot ? (
                  <>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r='10'
                      fill='#ffffff'
                      stroke='#4361ee'
                      strokeWidth='2.5'
                      className='filter drop-shadow-sm'
                    />
                    <circle cx={node.x} cy={node.y} r='4' fill='#4361ee' />
                    <text
                      x={node.x + 16}
                      y={node.y - 4}
                      className='fill-[#132038] text-[12.5px] font-bold dark:fill-white'
                    >
                      {node.name}
                    </text>
                    <text
                      x={node.x + 16}
                      y={node.y + 11}
                      className='fill-[#5c6b85] text-[10.5px] font-medium dark:fill-slate-400'
                    >
                      {node.stock}
                    </text>
                  </>
                ) : (
                  <>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r='6'
                      fill='#ffffff'
                      stroke='#93a2bd'
                      strokeWidth='2'
                    />
                    <circle cx={node.x} cy={node.y} r='2.5' fill='#93a2bd' />
                    <text
                      x={node.x + 12}
                      y={node.y - 2}
                      className='fill-[#475569] text-[11px] font-semibold dark:fill-slate-300'
                    >
                      {node.name}
                    </text>
                    <text
                      x={node.x + 12}
                      y={node.y + 10}
                      className='fill-[#93a2bd] text-[9.5px] font-medium'
                    >
                      {node.stock}
                    </text>
                  </>
                )}
              </g>
            ))}
          </svg>

          {/* Map legend */}
          <div className='absolute bottom-3 left-4 flex flex-wrap items-center gap-3.5 rounded-lg bg-white/85 px-3 py-1.5 text-[11px] font-medium text-[#5c6b85] shadow-xs backdrop-blur-sm dark:bg-black/65 dark:text-slate-300'>
            <span className='flex items-center gap-1.5'>
              <span className='size-2 rounded-full bg-emerald-500' /> Normal Flow (Line 1, 4, 5, 6)
            </span>
            <span className='flex items-center gap-1.5'>
              <span className='size-2 rounded-full bg-amber-500' /> Standby
            </span>
            <span className='flex items-center gap-1.5'>
              <span className='size-2 rounded-full bg-rose-500' /> Alarm / Loss Watch (Sultan Hamud–Nairobi)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

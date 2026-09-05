import { cn } from '@/lib/utils';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function AnimatedCounter({ value, duration = 1.2 }: { value: string; duration?: number }) {
  const numericString = value.replace(/[^0-9.]/g, '');
  const targetNumber = parseFloat(numericString);
  const suffix = value.replace(/[0-9.,]/g, '');
  const hasDecimals = value.includes('.');
  const decimalPlaces = hasDecimals ? (value.split('.')[1]?.length ?? 0) : 0;
  const hasCommas = value.includes(',');

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isNaN(targetNumber)) return;
    let startTime: number | null = null;
    let frameId: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(targetNumber * ease);
      if (progress < 1) frameId = requestAnimationFrame(step);
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [targetNumber, duration]);

  if (isNaN(targetNumber)) return <span>{value}</span>;

  let formatted = hasDecimals
    ? displayValue.toFixed(decimalPlaces)
    : Math.round(displayValue).toString();

  if (hasCommas) {
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    formatted = parts.join('.');
  }

  return (
    <span>
      {formatted}
      {suffix}
    </span>
  );
}

export type FlowKpiCardProps = {
  title: string;
  value: string;
  unit?: string;
  delta: string;
  deltaType: 'up' | 'down' | 'flat';
  description: string;
  color: string;
  delay?: number;
  icon?: React.ReactNode;
};

export function FlowKpiCard({
  title,
  value,
  unit,
  delta,
  deltaType,
  description,
  color,
  delay = 0,
  icon,
}: FlowKpiCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 280, damping: 22 });
  const mouseYSpring = useSpring(y, { stiffness: 280, damping: 22 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['12deg', '-12deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-12deg', '12deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const DeltaIcon = deltaType === 'up' ? TrendingUp : deltaType === 'down' ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className='perspective-distant h-full w-full pt-1 pl-1'
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          x.set(0);
          y.set(0);
        }}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          borderLeftColor: color,
          boxShadow: `
            -1.5px 2px 0 0 ${color},
            -3px 4px 0 0 ${color}99,
            -6px 8px 18px rgba(0,0,0,0.35)
          `,
        }}
        whileHover={{ scale: 1.03, y: -4 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className='group relative flex h-42 flex-col justify-between overflow-hidden rounded-2xl border border-white/15 border-l-2 bg-linear-to-b from-[#18233c] via-[#0f1728] to-[#080d16] p-4'
      >
        <div
          className='pointer-events-none absolute -top-10 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full opacity-30 blur-3xl'
          style={{ background: color }}
        />
        <div
          style={{ transform: 'translateZ(28px)' }}
          className='relative z-10 flex min-h-0 flex-1 flex-col space-y-2'
        >
          <div className='flex items-center justify-between gap-2'>
            <div className='flex min-w-0 items-center gap-2'>
              <span
                className='size-2.5 shrink-0 rounded-full ring-2 ring-white/25'
                style={{ backgroundColor: color }}
              />
              <span className='truncate text-[11px] font-bold tracking-wider text-white/85 uppercase'>
                {title}
              </span>
            </div>
            {icon ? (
              <span className='shrink-0 opacity-80' style={{ color }}>
                {icon}
              </span>
            ) : null}
          </div>
          <div className='flex items-baseline gap-1'>
            <span className='font-mono text-2xl font-black tracking-tight text-white xl:text-3xl'>
              <AnimatedCounter value={value} />
            </span>
            {unit ? <span className='text-sm font-semibold text-white/50'>{unit}</span> : null}
          </div>
          <p className='line-clamp-2 min-h-[2.2em] text-[11px] leading-snug text-white/45'>
            {description}
          </p>
        </div>
        <div
          style={{ transform: 'translateZ(20px)' }}
          className={cn(
            'relative z-10 mt-auto inline-flex w-fit shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
            deltaType === 'up' && 'bg-emerald-500/20 text-emerald-300',
            deltaType === 'down' && 'bg-rose-500/20 text-rose-300',
            deltaType === 'flat' && 'bg-white/10 text-white/70'
          )}
        >
          <DeltaIcon className='size-3' />
          {delta}
        </div>
      </motion.div>
    </motion.div>
  );
}

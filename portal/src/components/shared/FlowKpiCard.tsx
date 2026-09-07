import { cn } from '@/lib/utils';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Loader2, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

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
  icon?: ReactNode;
  isLoading?: boolean;
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
  isLoading = false,
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
      className='perspective-distant h-full w-full min-w-0 pt-1 pl-1'
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          x.set(0);
          y.set(0);
        }}
        style={
          {
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
            borderLeftColor: color,
            '--kpi-accent': color,
          } as CSSProperties
        }
        whileHover={{ scale: 1.03, y: -4 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className={cn(
          'group relative flex h-42 min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-l-2 p-3 sm:p-3.5',
          // Light: elevated card surface
          'border-border/80 bg-linear-to-b from-card via-card to-muted/50',
          'shadow-[calc(-1.5px)_2px_0_0_var(--kpi-accent),calc(-3px)_4px_0_0_color-mix(in_oklab,var(--kpi-accent)_55%,transparent),calc(-6px)_8px_18px_rgba(15,23,42,0.12)]',
          // Dark: petroleum navy slab
          'dark:border-white/15 dark:from-[#18233c] dark:via-[#0f1728] dark:to-[#080d16]',
          'dark:shadow-[calc(-1.5px)_2px_0_0_var(--kpi-accent),calc(-3px)_4px_0_0_color-mix(in_oklab,var(--kpi-accent)_60%,transparent),calc(-6px)_8px_18px_rgba(0,0,0,0.35)]'
        )}
      >
        <div
          className='pointer-events-none absolute -top-10 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full opacity-20 blur-3xl dark:opacity-30'
          style={{ background: color }}
        />
        <div
          style={{ transform: 'translateZ(28px)' }}
          className='relative z-10 flex min-h-0 min-w-0 flex-1 flex-col space-y-2'
        >
          <div className='flex min-w-0 items-center justify-between gap-2'>
            <div className='flex min-w-0 items-center gap-1.5'>
              <span
                className='size-2 shrink-0 rounded-full ring-2 ring-foreground/15 dark:ring-white/25'
                style={{ backgroundColor: color }}
              />
              <span className='text-foreground/80 dark:text-white/85 truncate text-[10.5px] font-bold tracking-wider uppercase'>
                {title}
              </span>
            </div>
            {icon ? (
              <span className='shrink-0 opacity-80' style={{ color }}>
                {icon}
              </span>
            ) : null}
          </div>
          <div className='flex min-w-0 items-baseline gap-1'>
            {isLoading ? (
              <div className='flex h-9 items-center gap-2'>
                <div className='bg-muted-foreground/20 dark:bg-white/20 h-7 w-20 animate-pulse rounded-md' />
                <Loader2 className='text-muted-foreground dark:text-white/50 size-3.5 animate-spin' />
              </div>
            ) : (
              <>
                <span className='text-foreground dark:text-white truncate font-mono text-xl font-black tracking-tight sm:text-2xl 2xl:text-3xl'>
                  <AnimatedCounter value={value} />
                </span>
                {unit ? (
                  <span className='text-muted-foreground dark:text-white/50 shrink-0 text-xs font-semibold'>
                    {unit}
                  </span>
                ) : null}
              </>
            )}
          </div>
          {isLoading ? (
            <div className='space-y-1 py-0.5'>
              <div className='bg-muted-foreground/15 dark:bg-white/15 h-2.5 w-3/4 animate-pulse rounded' />
              <div className='bg-muted-foreground/10 dark:bg-white/10 h-2.5 w-1/2 animate-pulse rounded' />
            </div>
          ) : (
            <p className='text-muted-foreground dark:text-white/45 line-clamp-2 min-h-[2.2em] text-[10.5px] leading-snug'>
              {description}
            </p>
          )}
        </div>
        {isLoading ? (
          <div className='bg-muted-foreground/15 dark:bg-white/15 h-5 w-20 animate-pulse rounded-full' />
        ) : (
          <div
            style={{ transform: 'translateZ(20px)' }}
            className={cn(
              'relative z-10 mt-auto inline-flex w-fit max-w-full shrink-0 items-center gap-1 overflow-hidden rounded-full px-2 py-0.5 text-[10.5px] font-semibold text-ellipsis whitespace-nowrap',
              deltaType === 'up' &&
                'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
              deltaType === 'down' &&
                'bg-rose-500/15 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
              deltaType === 'flat' &&
                'bg-muted text-muted-foreground dark:bg-white/10 dark:text-white/70'
            )}
          >
            <DeltaIcon className='size-3 shrink-0' />
            <span className='truncate'>{delta}</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

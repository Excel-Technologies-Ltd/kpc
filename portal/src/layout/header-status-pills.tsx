import { useEffect, useState } from 'react';

function formatClock(date: Date) {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function HeaderStatusPills() {
  const [clock, setClock] = useState(() => formatClock(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => {
      setClock(formatClock(new Date()));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className='hidden items-center gap-2 sm:flex'>
      <a
        href='/app'
        className='inline-flex items-center rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-muted hover:text-primary '
      >
        Home
      </a>
      <span className='inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-muted-foreground '>
        <span className='relative flex size-1.5'>
          <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75' />
          <span className='relative inline-flex size-1.5 rounded-full bg-emerald-500' />
        </span>
        Live · SCADA linked
      </span>
      <span className='hidden lg:inline-flex items-center rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-muted-foreground '>
        Kenya Pipeline Network
      </span>
      <span className='inline-flex items-center rounded-lg border border-border bg-muted/60 px-3 py-1.5 font-mono text-xs font-semibold tabular-nums text-foreground '>
        {clock}
      </span>
    </div>
  );
}

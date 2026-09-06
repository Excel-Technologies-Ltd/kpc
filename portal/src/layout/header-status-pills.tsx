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
        className='inline-flex items-center rounded-lg border border-[#e6edf7] bg-[#f6f9fe] px-3 py-1.5 text-xs font-medium text-[#4361ee] transition-colors hover:bg-[#eef3ff] hover:text-[#3451d1] dark:border-[#233252] dark:bg-[#141f35] dark:text-[#8eb0ff] dark:hover:bg-[#1a2740]'
      >
        Home
      </a>
      <span className='inline-flex items-center gap-1.5 rounded-lg border border-[#e6edf7] bg-[#f6f9fe] px-3 py-1.5 text-xs font-medium text-[#5c6b85] dark:border-[#233252] dark:bg-[#141f35] dark:text-[#8aa0c0]'>
        <span className='relative flex size-1.5'>
          <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75' />
          <span className='relative inline-flex size-1.5 rounded-full bg-emerald-500' />
        </span>
        Live · SCADA linked
      </span>
      <span className='hidden lg:inline-flex items-center rounded-lg border border-[#e6edf7] bg-[#f6f9fe] px-3 py-1.5 text-xs font-medium text-[#5c6b85] dark:border-[#233252] dark:bg-[#141f35] dark:text-[#8aa0c0]'>
        Kenya Pipeline Network
      </span>
      <span className='inline-flex items-center rounded-lg border border-[#e6edf7] bg-[#f6f9fe] px-3 py-1.5 font-mono text-xs font-semibold tabular-nums text-[#132038] dark:border-[#233252] dark:bg-[#141f35] dark:text-[#eaf1fa]'>
        {clock}
      </span>
    </div>
  );
}

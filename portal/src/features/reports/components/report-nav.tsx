import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';
import { REPORT_NAV } from '../data/dummy';

export function ReportNav() {
  return (
    <div className='border-border/70 bg-card/80 flex flex-wrap gap-1.5 rounded-xl border p-1.5 shadow-sm'>
      {REPORT_NAV.map((item) => (
        <NavLink
          key={item.key}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}

import { SectionCard } from '@/components/shared/SectionCard';
import { cn } from '@/lib/utils';
import { WORK_ORDER_KANBAN, type WorkOrderPriority } from '../data/dummy';

const PRIORITY_CLASS: Record<WorkOrderPriority, string> = {
  hi: 'border-l-rose-500',
  med: 'border-l-amber-500',
  lo: 'border-l-sky-500',
};

export function WorkOrdersKanban() {
  return (
    <SectionCard
      title='Work orders'
      tag='by stage'
      caption='Live maintenance queue. Cards move left to right as crews progress.'
      contentClassName='overflow-x-auto'
    >
      <div className='flex min-w-160 gap-3'>
        {WORK_ORDER_KANBAN.map((col) => (
          <div
            key={col.title}
            className='border-border/70 bg-card/80 flex min-w-0 flex-1 flex-col rounded-xl border p-2.5 shadow-sm'
          >
            <div className='mb-2 flex items-center justify-between px-1'>
              <span className='text-foreground text-[12px] font-semibold'>{col.title}</span>
              <span className='bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold'>
                {col.items.length}
              </span>
            </div>
            <div className='flex flex-col gap-2'>
              {col.items.map((wo) => (
                <div
                  key={wo.id}
                  className={cn(
                    'border-border/60 bg-background rounded-lg border border-l-[3px] p-2.5 shadow-sm',
                    PRIORITY_CLASS[wo.priority]
                  )}
                >
                  <div className='text-muted-foreground font-mono text-[10px] font-semibold tracking-wide'>
                    {wo.id}
                  </div>
                  <div className='text-foreground mt-0.5 text-[12px] leading-snug font-medium'>
                    {wo.title}
                  </div>
                  <div className='text-muted-foreground mt-1.5 flex justify-between text-[10px]'>
                    <span>{wo.location}</span>
                    <span className='font-semibold'>{wo.priorityLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

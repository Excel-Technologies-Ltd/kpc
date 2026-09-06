import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Bot,
  Columns3,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { ReportMeta, ReportTool } from '../data/dummy';
import { ReportSummaryRow } from './report-summary-row';

function toolIcon(id: string) {
  switch (id) {
    case 'ask':
      return MessageSquare;
    case 'cols':
      return Columns3;
    case 'excel':
      return FileSpreadsheet;
    case 'pdf':
      return FileText;
    case 'epra':
    case 'nema':
      return Download;
    default:
      return Download;
  }
}

function ToolButton({ tool, onClick }: { tool: ReportTool; onClick?: (id: string) => void }) {
  const Icon = toolIcon(tool.id);
  return (
    <Button
      type='button'
      size='sm'
      variant={tool.primary ? 'default' : 'outline'}
      className='h-8 gap-1.5 text-[11px] font-semibold'
      onClick={() => onClick?.(tool.id)}
    >
      <Icon className='size-3.5' />
      {tool.label}
    </Button>
  );
}

export function ReportSheet({ meta, children }: { meta: ReportMeta; children: ReactNode }) {
  return (
    <Card className='border-border/80 from-card via-sky-50/20 to-teal-50/10 overflow-hidden bg-linear-to-br shadow-[0_10px_40px_-24px_rgba(15,23,42,0.2)] dark:via-sky-950/15 dark:to-teal-950/10'>
      <CardContent className='space-y-4 p-4 md:p-5'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <h2 className='text-foreground text-[17px] font-bold tracking-tight'>{meta.title}</h2>
            <p className='text-muted-foreground mt-0.5 text-sm'>{meta.subtitle}</p>
            <div className='mt-2 flex flex-wrap items-center gap-2'>
              <span className='text-muted-foreground inline-flex items-center gap-1.5 text-[11px] font-medium'>
                <span
                  className={cn(
                    'size-1.5 rounded-full',
                    isLive ? 'bg-emerald-500 animate-pulse' : 'bg-sky-500'
                  )}
                />
                {meta.freshness}
              </span>
              {isLive ? (
                <span className='border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded px-1.5 py-0.2 text-[10px] font-semibold border'>
                  Live Frappe DB
                </span>
              ) : null}
              {onRefresh ? (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={onRefresh}
                  disabled={isLoading}
                  className='h-5 px-1.5 text-[10.5px] text-muted-foreground hover:text-foreground'
                >
                  <RefreshCw className={cn('size-3', isLoading && 'animate-spin')} />
                  Sync
                </Button>
              ) : null}
            </div>
          </div>
          <div className='flex flex-wrap gap-1.5'>
            {meta.tools.map((t) => (
              <ToolButton key={t.id} tool={t} onClick={onToolClick} />
            ))}
          </div>
        </div>

        <div className='border-border/70 bg-muted/40 flex gap-3 rounded-xl border px-3.5 py-3'>
          <div className='bg-primary/15 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg'>
            <Bot className='size-4' />
          </div>
          <p className='text-foreground text-[12.5px] leading-relaxed'>
            <b>Assistant note:</b> {meta.aiNote}
          </p>
        </div>

        <ReportSummaryRow items={meta.summaries} isLoading={isLoading} />

        <div className='relative'>
          {isLoading && (
            <div className='absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-xl bg-background/50 backdrop-blur-[1px] text-xs text-muted-foreground'>
              <Loader2 className='size-4 animate-spin text-primary' />
              <span>Loading operational metrics...</span>
            </div>
          )}
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

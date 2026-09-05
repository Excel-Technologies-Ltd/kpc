import { SectionCard } from '@/components/shared/SectionCard';
import { Button } from '@/components/ui/button';
import { MAINTENANCE_WORK_ORDER_DOCTYPE } from '@/constants/doctype.string';
import { cn } from '@/lib/utils';
import type { MaintenanceWorkOrder } from '@/types/PetroleumOperations/MaintenanceWorkOrder';
import {
  useFrappeGetDocList,
  useFrappePostCall,
  useFrappeUpdateDoc,
} from 'frappe-react-sdk';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Loader2,
  RefreshCw,
  User,
  Wrench,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

type ExecutionStatus = 'Not Started' | 'In Progress' | 'Completed';

interface StageConfig {
  id: ExecutionStatus;
  title: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  emptyText: string;
}

const STAGES: StageConfig[] = [
  {
    id: 'Not Started',
    title: 'Open',
    dotColor: 'bg-amber-500',
    badgeBg: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
    badgeText: 'text-amber-700 dark:text-amber-400',
    emptyText: 'No open work orders',
  },
  {
    id: 'In Progress',
    title: 'In progress',
    dotColor: 'bg-sky-500',
    badgeBg: 'bg-sky-500/15 text-sky-800 dark:text-sky-300',
    badgeText: 'text-sky-700 dark:text-sky-400',
    emptyText: 'No work orders currently in progress',
  },
  {
    id: 'Completed',
    title: 'Done',
    dotColor: 'bg-emerald-500',
    badgeBg: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
    badgeText: 'text-emerald-700 dark:text-emerald-400',
    emptyText: 'No completed work orders yet',
  },
];

function getPriorityMeta(type?: string) {
  switch (type) {
    case 'Emergency Repair':
      return {
        borderClass: 'border-l-rose-500',
        badgeClass: 'bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
        label: 'Emergency',
      };
    case 'Corrective Maintenance':
      return {
        borderClass: 'border-l-amber-500',
        badgeClass: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
        label: 'Corrective',
      };
    case 'Preventive Maintenance':
      return {
        borderClass: 'border-l-sky-500',
        badgeClass: 'bg-sky-500/10 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
        label: 'Preventive',
      };
    case 'Inspection':
    default:
      return {
        borderClass: 'border-l-emerald-500',
        badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
        label: 'Inspection',
      };
  }
}

export function WorkOrdersKanban() {
  const {
    data: remoteWorkOrders,
    isLoading,
    error,
    mutate,
  } = useFrappeGetDocList<MaintenanceWorkOrder>(MAINTENANCE_WORK_ORDER_DOCTYPE, {
    fields: [
      'name',
      'description',
      'asset',
      'work_order_type',
      'execution_status',
      'scheduled_date',
      'assigned_employee',
      'docstatus',
      'modified',
    ],
    filters: [['docstatus', '!=', 2]],
    orderBy: { field: 'modified', order: 'desc' },
    limit: 100,
  });

  const { call: setValueCall } = useFrappePostCall('frappe.client.set_value');
  const { updateDoc } = useFrappeUpdateDoc();

  // Optimistic overrides for instantaneous drag-and-drop & button feedback (React 19 compliant)
  const [optimisticStatusMap, setOptimisticStatusMap] = useState<Record<string, ExecutionStatus>>({});
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<ExecutionStatus | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Derive work orders combining remote data with active optimistic updates
  const workOrders = useMemo(() => {
    if (!remoteWorkOrders) return [];
    return remoteWorkOrders.map((wo) => {
      const override = optimisticStatusMap[wo.name];
      return override ? { ...wo, execution_status: override } : wo;
    });
  }, [remoteWorkOrders, optimisticStatusMap]);

  // Group work orders by stage
  const groupedOrders = useMemo(() => {
    const map: Record<ExecutionStatus, MaintenanceWorkOrder[]> = {
      'Not Started': [],
      'In Progress': [],
      'Completed': [],
    };

    workOrders.forEach((wo) => {
      const status: ExecutionStatus =
        wo.execution_status && ['Not Started', 'In Progress', 'Completed'].includes(wo.execution_status)
          ? wo.execution_status
          : 'Not Started';
      map[status].push(wo);
    });

    return map;
  }, [workOrders]);

  // Handle stage transition (via Drag & Drop or Action Buttons)
  const handleStatusChange = async (woName: string, targetStatus: ExecutionStatus) => {
    const currentWo = workOrders.find((w) => w.name === woName);
    if (!currentWo || currentWo.execution_status === targetStatus) return;

    setActionError(null);
    setUpdatingIds((prev) => new Set(prev).add(woName));

    // 1. Optimistically apply status override
    setOptimisticStatusMap((prev) => ({ ...prev, [woName]: targetStatus }));

    try {
      // 2. Persist to Frappe backend: use frappe.client.set_value (works on both draft & submitted docs)
      try {
        await setValueCall({
          doctype: MAINTENANCE_WORK_ORDER_DOCTYPE,
          name: woName,
          fieldname: 'execution_status',
          value: targetStatus,
        });
      } catch {
        // Fallback to REST updateDoc if RPC endpoint is unreachable
        await updateDoc(MAINTENANCE_WORK_ORDER_DOCTYPE, woName, {
          execution_status: targetStatus,
        });
      }

      // 3. Re-sync with SWR cache and clear override
      await mutate();
      setOptimisticStatusMap((prev) => {
        const next = { ...prev };
        delete next[woName];
        return next;
      });
    } catch (err: unknown) {
      // Rollback override on failure
      setOptimisticStatusMap((prev) => {
        const next = { ...prev };
        delete next[woName];
        return next;
      });
      const errMsg =
        err instanceof Error
          ? err.message
          : 'Failed to update work order execution status in Frappe.';
      setActionError(errMsg);
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(woName);
        return next;
      });
    }
  };

  // Drag event handlers
  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedId(id);
  };

  const onDragEnd = () => {
    setDraggedId(null);
    setDragOverStage(null);
  };

  const onDragOver = (e: React.DragEvent, stageId: ExecutionStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const onDrop = (e: React.DragEvent, stageId: ExecutionStatus) => {
    e.preventDefault();
    setDragOverStage(null);
    const id = e.dataTransfer.getData('text/plain') || draggedId;
    if (id) {
      handleStatusChange(id, stageId);
    }
  };

  return (
    <SectionCard
      title='Work orders'
      tag='live board'
      caption='Live maintenance queue linked to Frappe. Drag cards or click action buttons to progress stages.'
      className='h-full flex flex-col'
      contentClassName='overflow-x-auto min-w-0 flex-1 flex flex-col justify-between'
    >
      <div className='flex items-center justify-between pb-3'>
        <div className='flex items-center gap-2'>
          <span className='text-xs text-muted-foreground'>
            Total: <strong className='font-mono text-foreground'>{workOrders.length}</strong> active orders
          </span>
          {actionError ? (
            <span className='inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-xs text-rose-600 dark:text-rose-400'>
              <AlertCircle className='size-3' />
              {actionError}
            </span>
          ) : null}
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={() => mutate()}
          disabled={isLoading}
          className='h-7 text-xs gap-1.5'
        >
          <RefreshCw className={cn('size-3', isLoading && 'animate-spin')} />
          Sync
        </Button>
      </div>

      {isLoading && workOrders.length === 0 ? (
        <div className='flex h-48 items-center justify-center gap-2 text-sm text-muted-foreground'>
          <Loader2 className='size-5 animate-spin text-primary' />
          <span>Loading work orders from Frappe API...</span>
        </div>
      ) : error ? (
        <div className='rounded-xl border border-rose-200 bg-rose-50/50 p-4 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300'>
          <p className='font-semibold'>Failed to load work orders from Frappe API</p>
          <p className='mt-1 text-muted-foreground'>{error.message}</p>
        </div>
      ) : (
        <div className='flex min-w-[780px] gap-3.5 pb-2'>
          {STAGES.map((stage) => {
            const items = groupedOrders[stage.id] || [];
            const isTarget = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                onDragOver={(e) => onDragOver(e, stage.id)}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDragOverStage(null);
                  }
                }}
                onDrop={(e) => onDrop(e, stage.id)}
                className={cn(
                  'flex min-w-0 flex-1 flex-col rounded-xl border border-border/70 bg-card/80 p-3 shadow-xs transition-colors duration-150',
                  isTarget && 'border-primary/80 bg-primary/5 ring-2 ring-primary/30'
                )}
              >
                {/* Stage Header */}
                <div className='mb-2.5 flex items-center justify-between px-1'>
                  <div className='flex items-center gap-2'>
                    <span className={cn('size-2 rounded-full', stage.dotColor)} />
                    <span className='text-[13px] font-semibold text-foreground'>{stage.title}</span>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 font-mono text-[10.5px] font-semibold',
                      stage.badgeBg
                    )}
                  >
                    {items.length}
                  </span>
                </div>

                {/* Card List - Y-Axis scrollable with bounded height */}
                <div className='flex flex-1 flex-col gap-2 max-h-[310px] overflow-y-auto overflow-x-hidden pr-1'>
                  {items.length === 0 ? (
                    <div
                      className={cn(
                        'flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border/80 p-4 text-center transition-colors',
                        isTarget && 'border-primary/50 bg-primary/5'
                      )}
                    >
                      <p className='text-xs font-medium text-muted-foreground'>{stage.emptyText}</p>
                      <p className='mt-0.5 text-[10.5px] text-muted-foreground/75'>
                        Drag orders here to update stage
                      </p>
                    </div>
                  ) : (
                    items.map((wo) => {
                      const priority = getPriorityMeta(wo.work_order_type);
                      const isUpdating = updatingIds.has(wo.name);
                      const isBeingDragged = draggedId === wo.name;

                      return (
                        <div
                          key={wo.name}
                          draggable={!isUpdating}
                          onDragStart={(e) => onDragStart(e, wo.name)}
                          onDragEnd={onDragEnd}
                          className={cn(
                            'group relative rounded-lg border border-border/60 bg-background p-2.5 shadow-xs transition-all duration-150',
                            priority.borderClass,
                            'border-l-[3.5px]',
                            isBeingDragged && 'opacity-40 scale-98',
                            isUpdating && 'pointer-events-none opacity-60'
                          )}
                        >
                          {/* Top Row: Name / Tag & Priority Badge */}
                          <div className='flex items-center justify-between gap-1.5'>
                            <div className='flex items-center gap-1 shrink-0'>
                              <GripVertical className='size-3.5 text-muted-foreground/40 cursor-grab active:cursor-grabbing shrink-0' />
                              <span className='font-mono text-[11px] font-bold tracking-tight text-foreground whitespace-nowrap'>
                                {wo.name}
                              </span>
                            </div>
                            <span
                              className={cn(
                                'rounded px-1.5 py-0.5 text-[9px] font-semibold shrink-0 uppercase tracking-wider',
                                priority.badgeClass
                              )}
                            >
                              {priority.label}
                            </span>
                          </div>

                          {/* Description */}
                          <p className='mt-1.5 text-[12px] leading-snug font-medium text-foreground line-clamp-2'>
                            {wo.description || 'No description provided'}
                          </p>

                          {/* Asset Tag & Assignee info */}
                          <div className='mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-muted-foreground'>
                            {wo.asset ? (
                              <span className='inline-flex items-center gap-1 font-mono font-medium text-foreground/80'>
                                <Wrench className='size-3 text-muted-foreground/70 shrink-0' />
                                {wo.asset}
                              </span>
                            ) : null}

                            {wo.assigned_employee ? (
                              <span className='inline-flex items-center gap-1'>
                                <User className='size-3 text-muted-foreground/70 shrink-0' />
                                {wo.assigned_employee}
                              </span>
                            ) : null}

                            {wo.scheduled_date ? (
                              <span className='inline-flex items-center gap-1 font-mono text-muted-foreground'>
                                <Calendar className='size-3 text-muted-foreground/70 shrink-0' />
                                {wo.scheduled_date}
                              </span>
                            ) : null}
                          </div>

                          {/* Card Stage Controls (Clickable action buttons) */}
                          <div className='mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[10.5px]'>
                            {/* Left action (back) */}
                            {stage.id === 'In Progress' ? (
                              <button
                                type='button'
                                onClick={() => handleStatusChange(wo.name, 'Not Started')}
                                disabled={isUpdating}
                                className='inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
                                title='Move back to Open'
                              >
                                <ChevronLeft className='size-3' />
                                Open
                              </button>
                            ) : stage.id === 'Completed' ? (
                              <button
                                type='button'
                                onClick={() => handleStatusChange(wo.name, 'In Progress')}
                                disabled={isUpdating}
                                className='inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
                                title='Move back to In Progress'
                              >
                                <ChevronLeft className='size-3' />
                                Reopen
                              </button>
                            ) : (
                              <span />
                            )}

                            {/* Center updating indicator */}
                            {isUpdating ? (
                              <span className='inline-flex items-center gap-1 text-[10px] text-primary font-medium'>
                                <Loader2 className='size-3 animate-spin' />
                                Updating...
                              </span>
                            ) : null}

                            {/* Right action (forward) */}
                            {stage.id === 'Not Started' ? (
                              <button
                                type='button'
                                onClick={() => handleStatusChange(wo.name, 'In Progress')}
                                disabled={isUpdating}
                                className='inline-flex items-center gap-0.5 rounded bg-sky-500/10 px-2 py-0.5 font-medium text-sky-700 hover:bg-sky-500/20 dark:bg-sky-500/20 dark:text-sky-300 transition-colors'
                                title='Move to In Progress'
                              >
                                Start
                                <ChevronRight className='size-3' />
                              </button>
                            ) : stage.id === 'In Progress' ? (
                              <button
                                type='button'
                                onClick={() => handleStatusChange(wo.name, 'Completed')}
                                disabled={isUpdating}
                                className='inline-flex items-center gap-0.5 rounded bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-700 hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-300 transition-colors'
                                title='Mark as Completed'
                              >
                                <CheckCircle2 className='size-3' />
                                Complete
                              </button>
                            ) : (
                              <span className='inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold'>
                                <CheckCircle2 className='size-3' />
                                Done
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

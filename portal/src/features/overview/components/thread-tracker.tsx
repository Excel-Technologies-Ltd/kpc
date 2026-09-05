import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { useMemo, useState } from 'react';

interface JourneyDoc {
  name: string;
  status: string;
  current_step?: string;
  origin_shipment?: string;
  product?: string;
  customer?: string;
  remarks?: string;
}

interface OilShipmentDoc {
  name: string;
  journey_ref?: string;
  vessel_name?: string;
  product?: string;
  terminal?: string;
  planned_quantity_kl?: number;
  supplier?: string;
  workflow_state?: string;
}

interface AIAlertDoc {
  name: string;
  journey_ref?: string;
  movement?: string;
  status?: string;
  severity?: string;
  anomaly_score?: number;
  parameter_breached?: string;
  description?: string;
}

const STEP_DEFINITIONS = [
  { num: '01', label: 'Shipment' },
  { num: '02', label: 'Receipt' },
  { num: '03', label: 'Quality Result' },
  { num: '04', label: 'Inventory Position' },
  { num: '05', label: 'Nomination' },
  { num: '06', label: 'Pipeline Batch' },
  { num: '07', label: 'Movement + AI' },
  { num: '08', label: 'Terminal Receipt' },
  { num: '09', label: 'Reconciliation' },
  { num: '10', label: 'Allocation' },
  { num: '11', label: 'Dispatch' },
  { num: '12', label: 'Invoice' },
  { num: '13', label: 'Financial Posting' },
];

export function ThreadTracker() {
  const { data: journeys, isLoading: journeysLoading } = useFrappeGetDocList<JourneyDoc>(
    'Journey',
    {
      fields: [
        'name',
        'status',
        'current_step',
        'origin_shipment',
        'product',
        'customer',
        'remarks',
      ],
      orderBy: { field: 'creation', order: 'desc' },
      limit: 50,
    }
  );

  const { data: shipments } = useFrappeGetDocList<OilShipmentDoc>('Oil Shipment', {
    fields: [
      'name',
      'journey_ref',
      'vessel_name',
      'product',
      'terminal',
      'planned_quantity_kl',
      'supplier',
      'workflow_state',
    ],
    limit: 100,
  });

  const { data: alerts } = useFrappeGetDocList<AIAlertDoc>('AI Alert', {
    fields: [
      'name',
      'journey_ref',
      'movement',
      'status',
      'severity',
      'anomaly_score',
      'parameter_breached',
      'description',
    ],
    filters: [['status', '=', 'Open']],
    limit: 50,
  });

  const [selectedJourneyId, setSelectedJourneyId] = useState<string>('');

  const shipmentMap = useMemo(() => {
    const map = new Map<string, OilShipmentDoc>();
    if (shipments) {
      for (const s of shipments) {
        if (s.journey_ref) map.set(s.journey_ref, s);
        if (s.name) map.set(s.name, s);
      }
    }
    return map;
  }, [shipments]);

  const alertMap = useMemo(() => {
    const map = new Map<string, AIAlertDoc>();
    if (alerts) {
      for (const a of alerts) {
        if (a.journey_ref && !map.has(a.journey_ref)) {
          map.set(a.journey_ref, a);
        }
      }
    }
    return map;
  }, [alerts]);

  const selectedJourney = useMemo(() => {
    if (!journeys || journeys.length === 0) return null;
    if (selectedJourneyId) {
      const found = journeys.find((j) => j.name === selectedJourneyId);
      if (found) return found;
    }
    const inProgress = journeys.find(
      (j) => j.status === 'Active' && j.current_step && !j.current_step.startsWith('13')
    );
    return inProgress || journeys[0];
  }, [journeys, selectedJourneyId]);

  const currentShipment = useMemo(() => {
    if (!selectedJourney) return null;
    return (
      shipmentMap.get(selectedJourney.name) ||
      (selectedJourney.origin_shipment ? shipmentMap.get(selectedJourney.origin_shipment) : null)
    );
  }, [selectedJourney, shipmentMap]);

  const currentAlert = useMemo(() => {
    if (!selectedJourney) return null;
    return alertMap.get(selectedJourney.name);
  }, [selectedJourney, alertMap]);

  const currentStepNum = useMemo(() => {
    if (!selectedJourney?.current_step) return 1;
    const match = selectedJourney.current_step.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  }, [selectedJourney]);

  const fillWidthPercent = useMemo(() => {
    if (currentStepNum <= 1) return 0;
    return Math.min(100, Math.max(0, ((currentStepNum - 1) / 12) * 100));
  }, [currentStepNum]);

  if (journeysLoading) {
    return (
      <section id='thread' className='scroll-mt-24 mb-12'>
        <div className='mb-5'>
          <h2 className='text-foreground text-lg font-semibold tracking-tight'>
            Golden Thread tracker
          </h2>
          <p className='text-muted-foreground mt-1 text-sm'>
            One journey_ref, thirteen enforced steps — loading active journeys…
          </p>
        </div>
        <Card className='h-64 animate-pulse opacity-60' />
      </section>
    );
  }

  if (!selectedJourney) {
    return (
      <section id='thread' className='scroll-mt-24 mb-12'>
        <div className='mb-5'>
          <h2 className='text-foreground text-lg font-semibold tracking-tight'>
            Golden Thread tracker
          </h2>
          <p className='text-muted-foreground mt-1 text-sm'>
            One journey_ref, thirteen enforced steps — every arrow below is a system-checked gate.
          </p>
        </div>
        <Card>
          <CardContent className='text-muted-foreground py-8 text-center'>
            No active Journey records found in the database.
          </CardContent>
        </Card>
      </section>
    );
  }

  const vesselDisplay = currentShipment?.vessel_name || 'MT Marine Vessel';
  const productDisplay = selectedJourney.product || currentShipment?.product || 'AGO';
  const routeDisplay = currentShipment?.terminal
    ? `${currentShipment.terminal} → Nairobi Terminal`
    : 'Mombasa → Nairobi';
  const quantityDisplay = currentShipment?.planned_quantity_kl
    ? `${currentShipment.planned_quantity_kl.toLocaleString()} KL`
    : '8,400 KL';
  const customerDisplay =
    selectedJourney.customer || currentShipment?.supplier || 'Commercial Partner';

  return (
    <section id='thread' className='scroll-mt-24 mb-12'>
      <div className='mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h2 className='text-foreground text-lg font-semibold tracking-tight'>
            Golden Thread tracker
          </h2>
          <p className='text-muted-foreground mt-1 text-sm'>
            One journey_ref, thirteen enforced steps — every arrow below is a system-checked gate,
            not a convention.
          </p>
        </div>

        {journeys && journeys.length > 1 ? (
          <div className='flex items-center gap-2.5'>
            <span className='text-muted-foreground font-mono text-[11px] tracking-wide uppercase'>
              Switch journey:
            </span>
            <select
              value={selectedJourney.name}
              onChange={(e) => setSelectedJourneyId(e.target.value)}
              className='border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 rounded-md border px-3 py-1.5 font-mono text-xs outline-none focus-visible:ring-3'
            >
              {journeys.map((j) => (
                <option key={j.name} value={j.name}>
                  {j.name} ({j.current_step || j.status})
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <Card>
        <CardHeader className='border-border gap-4 border-b sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <CardTitle className='font-mono text-sm'>{selectedJourney.name}</CardTitle>
            <CardDescription className='mt-1'>
              {vesselDisplay} · {productDisplay}
            </CardDescription>
          </div>
          <div className='grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:grid-cols-4'>
            <div>
              <p className='text-muted-foreground tracking-wide uppercase'>Route</p>
              <p className='text-foreground mt-0.5 font-medium'>{routeDisplay}</p>
            </div>
            <div>
              <p className='text-muted-foreground tracking-wide uppercase'>Quantity</p>
              <p className='text-foreground mt-0.5 font-medium'>{quantityDisplay}</p>
            </div>
            <div>
              <p className='text-muted-foreground tracking-wide uppercase'>Customer</p>
              <p className='text-foreground mt-0.5 font-medium'>{customerDisplay}</p>
            </div>
            <div>
              <p className='text-muted-foreground tracking-wide uppercase'>Current step</p>
              <p className='text-foreground mt-0.5 font-medium'>
                {selectedJourney.current_step || '1. Shipment'}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className='pt-6'>
          <div className='relative'>
            <div className='bg-border absolute top-3 right-0 left-0 h-0.5' />
            <div
              className='bg-primary absolute top-3 left-0 h-0.5 transition-all'
              style={{ width: `${fillWidthPercent}%` }}
            />
            <div className='relative flex gap-4 overflow-x-auto pb-2'>
              {STEP_DEFINITIONS.map((step, idx) => {
                const stepIndex = idx + 1;
                const done = stepIndex < currentStepNum;
                const active = stepIndex === currentStepNum;

                return (
                  <div key={step.num} className='flex min-w-[4.5rem] flex-col items-center gap-2'>
                    <div
                      className={cn(
                        'size-3 shrink-0 rounded-full',
                        done && 'bg-primary',
                        active &&
                          'bg-primary ring-ring ring-4 ring-offset-2 ring-offset-background',
                        !done && !active && 'bg-muted'
                      )}
                    />
                    <span className='text-muted-foreground font-mono text-[10px]'>{step.num}</span>
                    <span
                      className={cn(
                        'text-center text-[11px] leading-tight',
                        active || done ? 'text-foreground font-medium' : 'text-muted-foreground'
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>

        <CardFooter className='border-border flex flex-col items-stretch gap-4 border-t sm:flex-row sm:items-center sm:justify-between'>
          <div className='text-muted-foreground flex items-start gap-2 text-sm'>
            {currentAlert ? (
              <>
                <svg
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  className='text-destructive mt-0.5 size-3.5 shrink-0'
                >
                  <path d='M12 9v4M12 17h.01M10.3 3.9L2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z' />
                </svg>
                <span>
                  <Badge variant='outline' className='mr-2'>
                    AI Alert ({currentAlert.severity})
                  </Badge>
                  {currentAlert.description || currentAlert.parameter_breached}
                </span>
              </>
            ) : (
              <>
                <svg
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  className='text-foreground mt-0.5 size-3.5 shrink-0'
                >
                  <path d='M20 6L9 17l-5-5' />
                </svg>
                <span>
                  All pipeline telemetry, gate checks, and mass balances nominal for this journey.
                </span>
              </>
            )}
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm'>
              View journey_ref log
            </Button>
            <Button size='sm'>{currentAlert ? 'Acknowledge Alert' : 'Open Step Details'}</Button>
          </div>
        </CardFooter>
      </Card>
    </section>
  );
}

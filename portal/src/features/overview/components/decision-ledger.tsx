import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const LEDGER_ROWS = [
  {
    ts: '09:41:02',
    journey: 'JNY-00042',
    decision:
      'AI Recommendation approved — Maintenance Work Order raised for Pump Station KP2',
    decidedBy: 'D. Kiptoo (Maintenance Mgr)',
    source: 'AI-assisted' as const,
  },
  {
    ts: '09:12:47',
    journey: 'JNY-00038',
    decision:
      'Reconciliation variance 0.51% accepted with written justification',
    decidedBy: 'A. Njoroge (Finance Officer)',
    source: 'Override' as const,
  },
  {
    ts: '08:57:19',
    journey: 'JNY-00040',
    decision: 'Quality Result accepted — AGO parcel released for nomination',
    decidedBy: 'S. Wanjiru (Quality Manager)',
    source: 'Human' as const,
  },
  {
    ts: '08:30:05',
    journey: 'JNY-00035',
    decision: 'Variance classified as Evaporation and approved',
    decidedBy: 'P. Mutua (Ops Controller)',
    source: 'Human' as const,
  },
  {
    ts: '07:58:33',
    journey: 'JNY-00042',
    decision: 'AI Alert raised — overpressure breach on Movement MV-0091',
    decidedBy: 'System (OT ingest)',
    source: 'AI-assisted' as const,
  },
];

function sourceBadge(source: (typeof LEDGER_ROWS)[number]['source']) {
  if (source === 'Override') {
    return <Badge variant='destructive'>{source}</Badge>;
  }
  if (source === 'AI-assisted') {
    return <Badge variant='secondary'>{source}</Badge>;
  }
  return <Badge variant='outline'>{source}</Badge>;
}

export function DecisionLedger() {
  return (
    <section id='ledger' className='scroll-mt-24 mb-12'>
      <div className='mb-5'>
        <h2 className='text-foreground text-lg font-semibold tracking-tight'>
          Decision ledger
        </h2>
        <p className='text-muted-foreground mt-1 text-sm'>
          Append-only. Every AI-assisted decision and manual override, immutable
          the moment it&apos;s written.
        </p>
      </div>

      <Card>
        <CardContent className='px-0 pt-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='text-muted-foreground pl-6'>
                  Timestamp
                </TableHead>
                <TableHead className='text-muted-foreground'>Journey</TableHead>
                <TableHead className='text-muted-foreground'>Decision</TableHead>
                <TableHead className='text-muted-foreground'>
                  Decided by
                </TableHead>
                <TableHead className='text-muted-foreground pr-6'>
                  Source
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LEDGER_ROWS.map((row) => (
                <TableRow key={`${row.ts}-${row.journey}`}>
                  <TableCell className='text-muted-foreground pl-6 font-mono text-xs'>
                    {row.ts}
                  </TableCell>
                  <TableCell className='text-foreground font-mono text-xs font-medium'>
                    {row.journey}
                  </TableCell>
                  <TableCell className='text-foreground max-w-md whitespace-normal text-sm'>
                    {row.decision}
                  </TableCell>
                  <TableCell className='text-muted-foreground text-sm'>
                    {row.decidedBy}
                  </TableCell>
                  <TableCell className='pr-6'>
                    {sourceBadge(row.source)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}

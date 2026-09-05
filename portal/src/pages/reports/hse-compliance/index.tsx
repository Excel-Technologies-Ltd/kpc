import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  COMPLIANCE_ROWS,
  HSE_REPORT,
  ReportNav,
  ReportSheet,
  ReportTable,
  ReportTd,
} from '@/features/reports';
import { INCIDENT_ROWS } from '@/features/hse-integrity/data/dummy';
import { TableRow } from '@/components/ui/table';

export default function HseComplianceReport() {
  return (
    <div className='mx-auto container space-y-4'>
      <AnimatedSection>
        <PageHeader
          title='Reports'
          subtitle='Live, self-service, regulator-ready. Export or ask the assistant about any of them.'
          chips={[{ label: 'Format', value: 'KES · m³' }]}
        />
      </AnimatedSection>
      <ReportNav />
      <AnimatedSection delay={0.08}>
        <ReportSheet meta={HSE_REPORT}>
          <div className='space-y-4'>
            <div>
              <h3 className='text-foreground mb-2 text-[13px] font-semibold tracking-tight'>
                Incident log
              </h3>
              <ReportTable
                headers={[
                  'Ref',
                  'Date',
                  'Location',
                  'Type',
                  'Severity',
                  'Volume lost',
                  'Corrective action',
                  'Status',
                ]}
              >
                {INCIDENT_ROWS.map((r) => (
                  <TableRow key={r.ref}>
                    <ReportTd mono className='font-semibold'>
                      {r.ref}
                    </ReportTd>
                    <ReportTd>{r.date}</ReportTd>
                    <ReportTd>{r.location}</ReportTd>
                    <ReportTd>{r.type}</ReportTd>
                    <ReportTd>
                      <StatusBadge label={r.severity} tone={r.severityTone} />
                    </ReportTd>
                    <ReportTd mono>{r.volumeLost}</ReportTd>
                    <ReportTd className='text-muted-foreground'>{r.action}</ReportTd>
                    <ReportTd>
                      <StatusBadge label={r.status} tone={r.statusTone} />
                    </ReportTd>
                  </TableRow>
                ))}
              </ReportTable>
            </div>

            <div>
              <h3 className='text-foreground mb-2 text-[13px] font-semibold tracking-tight'>
                Compliance checklist
              </h3>
              <ReportTable headers={['Requirement', 'Owner', 'Due', 'Status']}>
                {COMPLIANCE_ROWS.map((r) => (
                  <TableRow key={r.requirement}>
                    <ReportTd className='font-semibold'>{r.requirement}</ReportTd>
                    <ReportTd>{r.owner}</ReportTd>
                    <ReportTd>{r.due}</ReportTd>
                    <ReportTd>
                      <StatusBadge label={r.status} tone={r.tone} />
                    </ReportTd>
                  </TableRow>
                ))}
              </ReportTable>
            </div>
          </div>
        </ReportSheet>
      </AnimatedSection>
    </div>
  );
}

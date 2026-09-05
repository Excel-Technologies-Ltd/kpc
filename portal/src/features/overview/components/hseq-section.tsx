import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function HSEQSection() {
  return (
    <section id='hseq' className='scroll-mt-24 mb-12'>
      <div className='mb-5'>
        <h2 className='text-foreground text-lg font-semibold tracking-tight'>
          HSEQ &amp; certification gate
        </h2>
        <p className='text-muted-foreground mt-1 text-sm'>
          Freshness is recomputed against today&apos;s date on every check — a lapsed certification
          is never trusted from a cached status field.
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Employee certifications</CardTitle>
            <Badge variant='secondary'>2 flagged</Badge>
          </CardHeader>
          <CardContent className='gap-4'>
            <div className='border-border flex gap-3 border-b pb-4'>
              <Avatar>
                <AvatarFallback>JM</AvatarFallback>
              </Avatar>
              <div className='min-w-0 flex-1'>
                <p className='text-foreground font-medium'>James Mwangi</p>
                <p className='text-muted-foreground text-xs'>Field Technician · Pump Station KP2</p>
                <div className='mt-2 flex flex-wrap gap-1.5'>
                  <Badge variant='outline'>Pipeline Operations</Badge>
                  <Badge variant='outline'>Confined Space Entry</Badge>
                  <Badge variant='outline'>General HSEQ</Badge>
                </div>
              </div>
            </div>

            <div className='flex gap-3 pt-1'>
              <Avatar>
                <AvatarFallback>PO</AvatarFallback>
              </Avatar>
              <div className='min-w-0 flex-1'>
                <p className='text-foreground font-medium'>Peter Otieno</p>
                <p className='text-muted-foreground text-xs'>Field Technician · Mombasa Terminal</p>
                <div className='mt-2 flex flex-wrap gap-1.5'>
                  <Badge variant='destructive'>Confined Space Entry — expired</Badge>
                  <Badge variant='outline'>General HSEQ</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Permit to Work</CardTitle>
            <Badge>Live</Badge>
          </CardHeader>
          <CardContent className='gap-0'>
            <div className='border-border flex items-center justify-between gap-3 border-b py-3'>
              <div>
                <p className='text-foreground font-mono text-sm font-medium'>PTW-2026-0117</p>
                <p className='text-muted-foreground text-xs'>Hot Work — Pump Station KP2</p>
              </div>
              <Badge variant='secondary'>Issued</Badge>
            </div>
            <div className='border-border flex items-center justify-between gap-3 border-b py-3'>
              <div>
                <p className='text-foreground font-mono text-sm font-medium'>PTW-2026-0116</p>
                <p className='text-muted-foreground text-xs'>Confined Space Entry — Tank MB-03</p>
              </div>
              <Badge variant='outline'>Closed</Badge>
            </div>
            <div className='flex items-center justify-between gap-3 py-3'>
              <div>
                <p className='text-foreground font-mono text-sm font-medium'>PTW-2026-0115</p>
                <p className='text-muted-foreground text-xs'>
                  Electrical Isolation — Nairobi Terminal
                </p>
              </div>
              <Badge variant='outline'>Closed</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

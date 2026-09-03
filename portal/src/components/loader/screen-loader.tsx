import { Spinner } from '@/components/ui/spinner';

export default function ScreenLoader() {
  return (
    <div className='bg-background flex min-h-svh w-full items-center justify-center'>
      <div className='text-muted-foreground flex flex-col items-center gap-3'>
        <Spinner className='size-8' />
        <p className='text-sm'>Checking session…</p>
      </div>
    </div>
  );
}

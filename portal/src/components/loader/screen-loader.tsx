import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

interface ScreenLoaderProps {
  message?: string;
  className?: string;
}

export default function ScreenLoader({
  message = 'Checking session…',
  className,
}: ScreenLoaderProps = {}) {
  return (
    <div
      className={cn('bg-background flex min-h-svh w-full items-center justify-center', className)}
    >
      <div className='text-muted-foreground flex flex-col items-center gap-3'>
        <Spinner className='size-8 text-primary' />
        <p className='text-sm'>{message}</p>
      </div>
    </div>
  );
}

import { EmptyDescription, EmptyHeader, Empty as EmptyRoot, EmptyTitle } from '@/components/ui/empty';
import { Inbox } from 'lucide-react';

type EmptyProps = {
  description?: string;
  title?: string;
  className?: string;
};

export default function Empty({
  description = 'No data found',
  title = 'Nothing here',
  className,
}: EmptyProps) {
  return (
    <EmptyRoot className={className}>
      <EmptyHeader>
        <div className='bg-muted text-muted-foreground mb-1 flex size-10 items-center justify-center rounded-lg'>
          <Inbox className='size-5' />
        </div>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </EmptyRoot>
  );
}

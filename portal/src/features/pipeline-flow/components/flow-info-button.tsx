import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { INFO_GUIDES, type InfoGuideKey } from '../data/dummy';

export function FlowInfoButton({ guideKey }: { guideKey: InfoGuideKey }) {
  const guide = INFO_GUIDES[guideKey];

  return (
    <Dialog>
      <DialogTrigger
        className='border-border bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground inline-flex size-5 items-center justify-center rounded-full border text-[11px] font-bold transition-transform hover:scale-110'
        aria-label={`About ${guide.title}`}
      >
        i
      </DialogTrigger>
      <DialogContent className='max-h-[82vh] overflow-auto sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{guide.title}</DialogTitle>
          <DialogDescription>Data guide for this section</DialogDescription>
        </DialogHeader>
        <div className='space-y-0'>
          {guide.items.map((item) => (
            <div key={item.term} className='border-border border-b py-3 last:border-0'>
              <p className='text-foreground text-sm font-semibold'>{item.term}</p>
              <p className='text-muted-foreground mt-1 text-xs leading-relaxed'>
                {item.definition}
              </p>
              <p className='text-primary mt-1 text-[11px] font-semibold'>{item.source}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

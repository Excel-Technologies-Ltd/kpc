export function FlowPageHeader() {
  return (
    <div className='flex flex-wrap items-end justify-between gap-3'>
      <div>
        <h1 className='text-foreground text-[23px] font-bold tracking-tight'>Pipeline Flow</h1>
        <p className='text-muted-foreground mt-1 text-sm'>
          Throughput, line fill and batch movement across the trunk line
        </p>
      </div>
      <div className='flex flex-wrap gap-2'>
        <span className='border-border bg-card text-muted-foreground inline-flex items-center rounded-lg border px-3 py-1.5 text-[11.5px] font-medium'>
          Line <b className='text-foreground ml-1'>1 + 5</b>
        </span>
        <span className='border-border bg-card text-muted-foreground inline-flex items-center rounded-lg border px-3 py-1.5 text-[11.5px] font-medium'>
          Updated <b className='text-foreground ml-1'>12s ago</b>
        </span>
      </div>
    </div>
  );
}

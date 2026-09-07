import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { NAV_GROUPS } from '@/constants/nav';
import { cn } from '@/lib/utils';
import { NavLink, useLocation } from 'react-router-dom';

export function AppSidebar() {
  const { pathname } = useLocation();

  return (
    <Sidebar
      collapsible='icon'
      className='border-r border-border bg-card '
    >
      <SidebarHeader className='flex h-(--header-height) items-center justify-center border-b border-border px-3.5 '>
        <div className='flex w-full items-center gap-2.5 overflow-hidden'>
          <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-[#0d9488] to-[#06b6d4] text-xs font-bold text-white shadow-sm'>
            KPC
          </div>
          <div className='min-w-0 group-data-[collapsible=icon]:hidden'>
            <p className='truncate text-sm font-bold text-primary'>KPC Dashboard</p>
            <p className='truncate text-xs text-muted-foreground'>Operations</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className='gap-3 px-2 py-2'>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.title} className='p-0'>
            <SidebarGroupLabel className='px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[1.3px] text-muted-foreground group-data-[collapsible=icon]:hidden'>
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className='gap-1'>
                {group.items.map((item) => {
                  const isActive = item.to === '/' ? pathname === '/' : pathname === item.to;

                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        tooltip={item.label}
                        isActive={isActive}
                        className={cn(
                          'h-9.5 w-full rounded-[11px] px-3 py-2 text-[13.5px] font-medium transition-all duration-150',
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30 hover:bg-primary hover:text-primary-foreground data-active:bg-primary data-active:text-primary-foreground [&>svg]:text-primary-foreground'
                            : 'text-primary hover:bg-primary/10 hover:text-primary [&>svg]:text-primary/75 hover:[&>svg]:text-primary'
                        )}
                        render={<NavLink to={item.to} end={item.to === '/'} />}
                      >
                        <item.icon
                          className={cn(
                            'size-4.5 shrink-0 transition-colors',
                            isActive ? 'text-primary-foreground' : 'text-primary/75'
                          )}
                        />
                        <span
                          className={cn(
                            'truncate',
                            isActive
                              ? 'font-medium text-primary-foreground'
                              : 'text-primary font-medium'
                          )}
                        >
                          {item.label}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

import { NAV_ITEMS } from '@/constants/nav';
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
import { NavLink, useLocation } from 'react-router-dom';

export function AppSidebar() {
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='border-b border-sidebar-border px-3 py-3'>
        <div className='flex items-center gap-2 overflow-hidden'>
          <div className='bg-sidebar-primary text-sidebar-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-bold'>
            KPC
          </div>
          <div className='min-w-0 group-data-[collapsible=icon]:hidden'>
            <p className='truncate text-sm font-semibold text-sidebar-foreground'>KPC Portal</p>
            <p className='text-muted-foreground truncate text-xs'>Operations</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.to;
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      tooltip={item.label}
                      isActive={isActive}
                      render={<NavLink to={item.to} end />}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

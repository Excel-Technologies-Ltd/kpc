import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './app-sidebar';
import { SiteHeader } from './site-header';

export default function MainLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className='bg-transparent min-w-0 overflow-x-hidden'>
        <SiteHeader />
        <div className='flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 md:p-6'>
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './app-sidebar';
import { SiteHeader } from './site-header';

export default function MainLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className='bg-background flex-1 overflow-auto p-4 md:p-6'>
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

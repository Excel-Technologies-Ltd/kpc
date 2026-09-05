import { ModeToggle } from '@/components/mode-toggle';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { HeaderStatusPills } from '@/layout/header-status-pills';
import { FRAPPE_LOGIN } from '@/router/routes.url';
import { useFrappeAuth } from 'frappe-react-sdk';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

function initialsFromUser(user: string) {
  const local = user.includes('@') ? user.split('@')[0] : user;
  const parts = local.split(/[._\s-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export function SiteHeader() {
  const { currentUser, logout } = useFrappeAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      // still leave the SPA so Frappe session can be cleared
    } finally {
      window.location.href = FRAPPE_LOGIN;
    }
  };

  return (
    <header className='sticky top-0 z-20 flex h-(--header-height) shrink-0 items-center justify-between border-b border-[#e6edf7] bg-white px-4 shadow-[0_2px_12px_-8px_rgba(38,64,120,0.2)] dark:border-[#233252] dark:bg-[#0f1728] dark:shadow-none'>
      <div className='flex items-center gap-2'>
        <SidebarTrigger className='-ml-1 text-[#5c6b85] hover:text-[#132038]' />
        {/* <Separator orientation='vertical' className='mr-2 h-4 bg-[#e6edf7] dark:bg-[#233252]' />
        <div>
          <p className='text-sm font-semibold text-[#132038] dark:text-foreground'>
            Petroleum Operations
          </p>
          <p className='text-xs text-[#93a2bd]'>Overview control room</p>
        </div> */}
      </div>
      <div className='flex items-center gap-2'>
        <HeaderStatusPills />
        <ModeToggle />
        {currentUser && currentUser !== 'Guest' ? (
          <Avatar size='sm'>
            <AvatarFallback className='bg-blue-50 text-xs font-semibold text-[#4361ee]'>
              {initialsFromUser(currentUser)}
            </AvatarFallback>
          </Avatar>
        ) : null}
        <Button
          variant='ghost'
          size='icon'
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-label='Log out'
          className='text-[#5c6b85] hover:bg-[#f6f9fe] hover:text-[#132038]'
        >
          <LogOut className='size-4' />
        </Button>
      </div>
    </header>
  );
}

import { ModeToggle } from '@/components/mode-toggle';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
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
    <header className='bg-background sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border px-4'>
      <SidebarTrigger className='-ml-1' />
      <Separator orientation='vertical' className='mr-2 h-4' />
      <div className='flex flex-1 items-center justify-between gap-2'>
        <div>
          <p className='text-sm font-medium text-foreground'>Petroleum Operations</p>
          <p className='text-muted-foreground text-xs'>Overview control room</p>
        </div>
        <div className='flex items-center gap-2'>
          <ModeToggle />
          {currentUser && currentUser !== 'Guest' ? (
            <Avatar size='sm'>
              <AvatarFallback className='text-xs'>{initialsFromUser(currentUser)}</AvatarFallback>
            </Avatar>
          ) : null}
          <Button
            variant='ghost'
            size='icon'
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label='Log out'
          >
            <LogOut className='size-4' />
          </Button>
        </div>
      </div>
    </header>
  );
}

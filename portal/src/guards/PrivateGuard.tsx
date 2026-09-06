import ScreenLoader from '@/components/loader/screen-loader';
import { FRAPPE_LOGIN } from '@/router/routes.url';
import { useFrappeAuth } from 'frappe-react-sdk';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

function isAuthenticated(currentUser: string | null | undefined) {
  return Boolean(currentUser && currentUser !== 'Guest');
}

export default function PrivateGuard() {
  const { currentUser, isLoading } = useFrappeAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated(currentUser)) {
      window.location.href = FRAPPE_LOGIN;
    }
  }, [currentUser, isLoading]);

  if (isLoading) {
    return <ScreenLoader />;
  }

  if (!isAuthenticated(currentUser)) {
    return <ScreenLoader />;
  }

  return <Outlet />;
}

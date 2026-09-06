import ScreenLoader from '@/components/loader/screen-loader';
import { isAuthenticated } from '@/lib/auth';
import { URLOverview } from '@/router/routes.url';
import { useFrappeAuth } from 'frappe-react-sdk';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Logged-in users cannot stay on public routes (e.g. /login).
 */
export default function PublicGuard() {
  const { currentUser, isLoading } = useFrappeAuth();

  if (isLoading) {
    return <ScreenLoader />;
  }

  if (isAuthenticated(currentUser)) {
    return <Navigate to={URLOverview()} replace />;
  }

  return <Outlet />;
}

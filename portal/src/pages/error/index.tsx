import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  ArrowLeft,
  Home,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';

type ErrorPageProps = {
  title?: string;
  description?: string;
  statusCode?: string | number;
};

export default function ErrorPage({
  title,
  description,
  statusCode,
}: ErrorPageProps) {
  const navigate = useNavigate();
  const error = useRouteError();

  let resolvedStatus = statusCode || '404';
  let resolvedTitle = title || 'Page Not Found';
  let resolvedDescription =
    description ||
    'The requested telemetry view, report, or route could not be located in the KPC Operations Portal.';
  let errorMessage: string | null = null;

  if (isRouteErrorResponse(error)) {
    resolvedStatus = error.status;
    resolvedTitle = error.statusText || 'Navigation Error';
    resolvedDescription =
      error.data?.message ||
      'An unexpected routing error occurred while accessing this view.';
  } else if (error instanceof Error) {
    resolvedStatus = '500';
    resolvedTitle = 'System Error';
    resolvedDescription =
      'An unexpected application exception occurred. Our telemetry logs have captured this incident.';
    errorMessage = error.message;
  }

  return (
    <div className='relative flex min-h-[80vh] w-full flex-col items-center justify-center overflow-hidden px-4 py-12 text-center'>
      {/* Background glow accents */}
      <div className='pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#4361ee]/15 via-[#06b6d4]/15 to-transparent blur-3xl' />
      <div className='pointer-events-none absolute bottom-0 right-1/4 -z-10 h-80 w-80 rounded-full bg-gradient-to-br from-[#f59e0b]/10 to-transparent blur-3xl' />

      <div className='mx-auto max-w-lg space-y-6'>
        {/* Status code badge */}
        <div className='inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50/80 px-4 py-1.5 text-xs font-semibold text-[#4361ee] shadow-sm backdrop-blur-md'>
          <ShieldAlert className='size-4' />
          <span>Status Code {resolvedStatus}</span>
        </div>

        {/* Hero error display */}
        <div className='space-y-2'>
          <h1 className='bg-gradient-to-r from-[#132038] via-[#4361ee] to-[#06b6d4] bg-clip-text text-7xl font-extrabold tracking-tight text-transparent sm:text-8xl'>
            {resolvedStatus}
          </h1>
          <h2 className='text-2xl font-bold tracking-tight text-[#132038] sm:text-3xl'>
            {resolvedTitle}
          </h2>
          <p className='mx-auto max-w-md text-sm text-[#5c6b85] sm:text-base'>
            {resolvedDescription}
          </p>
        </div>

        {/* Technical trace for exceptions */}
        {errorMessage && (
          <div className='rounded-xl border border-red-200/80 bg-red-50/60 p-3.5 text-left text-xs font-mono text-red-700 shadow-sm'>
            <div className='flex items-center gap-1.5 font-semibold'>
              <AlertTriangle className='size-3.5' /> Exception Details:
            </div>
            <p className='mt-1 break-all'>{errorMessage}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className='flex flex-wrap items-center justify-center gap-3 pt-2'>
          <Button
            onClick={() => navigate('/')}
            className='h-10 rounded-xl bg-gradient-to-r from-[#4361ee] to-[#6a8bff] px-5 text-sm font-medium text-white shadow-[0_8px_18px_-8px_rgba(67,97,238,0.7)] transition-all hover:scale-[1.02] hover:brightness-105 active:scale-[0.98]'
          >
            <Home className='mr-2 size-4' />
            Executive Command
          </Button>

          <Button
            variant='outline'
            onClick={() => navigate(-1)}
            className='h-10 rounded-xl border-[#e6edf7] bg-white px-4 text-sm font-medium text-[#132038] shadow-sm hover:bg-[#f6f9fe]'
          >
            <ArrowLeft className='mr-2 size-4' />
            Go Back
          </Button>

          <Button
            variant='ghost'
            onClick={() => window.location.reload()}
            className='h-10 rounded-xl px-3 text-sm text-[#5c6b85] hover:bg-[#f6f9fe] hover:text-[#132038]'
          >
            <RefreshCw className='mr-1.5 size-3.5' />
            Reload
          </Button>
        </div>

        {/* Operational Footer Notice */}
        <div className='border-t border-[#e6edf7] pt-6'>
          <p className='text-xs text-[#93a2bd]'>
            Kenya Pipeline Operations SCADA & ERP System · All network activities monitored
          </p>
        </div>
      </div>
    </div>
  );
}

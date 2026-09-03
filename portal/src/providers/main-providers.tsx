import { FrappeProvider } from 'frappe-react-sdk';
import { ThemeProvider } from '../components/theme-provider';
import { TooltipProvider } from '../components/ui/tooltip';

const { VITE_FRAPPE_URL, VITE_FRAPPE_SITE_NAME, VITE_FRAPPE_TOKEN } = import.meta.env;

const MainProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <FrappeProvider
      enableSocket={false}
      {...(VITE_FRAPPE_URL && VITE_FRAPPE_TOKEN
        ? {
            url: VITE_FRAPPE_URL,
            siteName: VITE_FRAPPE_SITE_NAME,
            tokenParams: {
              // Token auth is dev-only; production portal uses password login + sid socket.
              useToken: import.meta.env.DEV,
              type: 'token',
              token: () => VITE_FRAPPE_TOKEN,
            },
          }
        : VITE_FRAPPE_URL && VITE_FRAPPE_SITE_NAME
          ? {
              url: VITE_FRAPPE_URL,
              siteName: VITE_FRAPPE_SITE_NAME,
            }
          : {})}
      swrConfig={{
        shouldRetryOnError: false,
        revalidateOnFocus: false,
      }}
    >
      <ThemeProvider defaultTheme='system' storageKey='kpc-theme'>
        <TooltipProvider>{children}</TooltipProvider>
      </ThemeProvider>
    </FrappeProvider>
  );
};

export default MainProviders;

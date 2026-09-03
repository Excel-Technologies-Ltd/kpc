import { FrappeProvider } from 'frappe-react-sdk';
import { ThemeProvider } from '../components/theme-provider';
import { TooltipProvider } from '../components/ui/tooltip';

const MainProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <FrappeProvider
      enableSocket={false}
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

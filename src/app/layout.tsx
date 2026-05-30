import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';
import { TRPCProvider } from '@/components/providers';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { OfflineBanner } from '@/components/offline-banner';

const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-sans', display: 'swap' });
const lora  = Lora({ subsets: ['latin'], variable: '--font-lora', display: 'swap', weight: ['400', '600', '700'] });

export const metadata: Metadata = {
  title: 'Pantry Pilot',
  description: 'Turn your pantry ingredients into delicious recipes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${lora.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TRPCProvider>
            <OfflineBanner />
            {children}
            <Toaster richColors position="bottom-right" />
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

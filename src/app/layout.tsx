import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TRPCProvider } from '@/components/providers';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Pantry Pilot',
  description: 'Turn your pantry ingredients into delicious recipes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TRPCProvider>
            {children}
            <Toaster richColors position="bottom-right" />
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

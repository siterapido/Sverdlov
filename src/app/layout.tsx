import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'Sverdlov | Unidade Popular',
  description: 'Plataforma de filiação e gestão financeira da UP',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} ${inter.variable} antialiased`}>
        <ThemeProvider defaultTheme="system" storageKey="sverdlov-theme">
          <main className="min-h-screen bg-background text-foreground">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}

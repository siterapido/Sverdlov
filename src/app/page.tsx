import { PageTransition } from '@/components/ui/page-transition';
import Link from 'next/link';

export default function HomePage() {
  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <h1 className="text-4xl font-bold mb-4 tracking-tight">Sverdlov</h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-md">
          Plataforma de gestão de filiação, finanças e nucleação da Unidade Popular.
        </p>
        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-sm font-medium hover:opacity-90 transition-opacity"
          >
            Dashboard
          </Link>
          <Link
            href="/filie-se"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-sm font-medium hover:bg-accent transition-colors"
          >
            Filie-se
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}

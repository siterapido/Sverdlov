import { MemberForm } from '@/components/members/member-form';
import { PageTransition } from '@/components/ui/page-transition';

export default function MembersPage() {
    return (
        <PageTransition>
            <div className="container mx-auto py-12 px-8 max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-fg-primary">Gestão de Membros</h1>
                    <p className="text-fg-secondary">Gerencie o registro e informações políticas dos membros.</p>
                </div>

                <MemberForm />
            </div>
        </PageTransition>
    );
}

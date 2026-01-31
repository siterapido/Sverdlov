import { FinanceDashboard } from '@/components/finance/FinanceDashboard';

export const metadata = {
    title: 'Dashboard Financeiro',
    description: 'Visualize métricas financeiras e indicadores de arrecadação',
};

export default function FinancesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-black mb-2">Dashboard Financeiro</h1>
                <p className="text-gray-600">Acompanhe arrecadação, inadimplência e projeções financeiras</p>
            </div>

            <FinanceDashboard />
        </div>
    );
}

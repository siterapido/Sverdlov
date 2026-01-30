import { getEscolaData } from '@/app/actions/escola';
import { EscolaContainer } from '@/components/escola/EscolaContainer';

export default async function EscolaPage() {
    const data = await getEscolaData();

    return <EscolaContainer initialData={data} />;
}

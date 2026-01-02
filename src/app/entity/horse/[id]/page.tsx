import { Metadata } from 'next';
import Script from 'next/script';
import EntityProfileShell from '@/components/entity/EntityProfileShell';
import EntityHeader from '@/components/entity/EntityHeader';
import StatsGrid from '@/components/entity/StatsGrid';
import RecentRacesTable from '@/components/entity/RecentRacesTable';
import ProGate from '@/components/shared/ProGate';
import { buildEntityProfileVM } from '@/lib/view-models/entityVM';
import { getDummyRaces } from '@/lib/api-helpers/dummy';
import { Race } from '@/types';
import { sanitizeUrlParam, safeJsonStringify } from '@/lib/utils/sanitize';

interface Props {
  params: { id: string };
}

const role = 'horse' as const;
const roleLabel = '말 프로필';

const fetchRaces = async (): Promise<Race[]> => {
  return [...getDummyRaces('horse'), ...getDummyRaces('cycle'), ...getDummyRaces('boat')];
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = sanitizeUrlParam(params.id);
  return {
    title: `${name} ${roleLabel} - RaceLab`,
    description: `${name} 최근 출주 기록, 통계, 성적 요약`,
  };
}

export default async function HorseEntityPage({ params }: Props) {
  const name = sanitizeUrlParam(params.id);
  const races = await fetchRaces();
  const profile = buildEntityProfileVM(role, name, races);

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Thing',
    name,
    description: `${name}의 출주 기록과 통계`,
  };

  return (
    <EntityProfileShell>
      <Script id="entity-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonStringify(personSchema) }} />
      <EntityHeader profile={profile} />
      <StatsGrid profile={profile} />
      <ProGate feature="history" />
      <RecentRacesTable races={profile.recentRaces} />
    </EntityProfileShell>
  );
}

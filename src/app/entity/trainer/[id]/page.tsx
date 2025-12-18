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

interface Props {
  params: { id: string };
}

const role = 'trainer' as const;

const fetchRaces = async (): Promise<Race[]> => {
  return [...getDummyRaces('horse'), ...getDummyRaces('cycle'), ...getDummyRaces('boat')];
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = decodeURIComponent(params.id);
  return {
    title: `${name} 조교사/감독 프로필 - RaceLab`,
    description: `${name} 최근 출전 말/선수 관리 기록`,
  };
}

export default async function TrainerEntityPage({ params }: Props) {
  const name = decodeURIComponent(params.id);
  const races = await fetchRaces();
  const profile = buildEntityProfileVM(role, name, races);

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    jobTitle: 'Trainer',
    description: `${name} 조교사/감독 기록`,
  };

  return (
    <EntityProfileShell>
      <Script id="trainer-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <EntityHeader profile={profile} />
      <StatsGrid profile={profile} />
      <ProGate feature="csv" />
      <RecentRacesTable races={profile.recentRaces} />
    </EntityProfileShell>
  );
}

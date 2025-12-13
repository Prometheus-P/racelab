import { EntityProfileVM } from '@/lib/view-models/entityVM';
import DataFreshnessBadge from '@/components/shared/DataFreshnessBadge';
import AdSlot from '@/components/shared/AdSlot';

interface EntityHeaderProps {
  profile: EntityProfileVM;
}

const roleLabel: Record<EntityProfileVM['role'], string> = {
  horse: '마필',
  jockey: '기수',
  trainer: '조교사',
};

const EntityHeader = ({ profile }: EntityHeaderProps) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{roleLabel[profile.role]}</p>
          <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
        </div>
        <DataFreshnessBadge freshness={profile.freshness} updatedAt={profile.updatedAt} />
      </div>
      <AdSlot id={`${profile.role}-${profile.id}-header`} position="entity-header" />
    </div>
  );
};

export default EntityHeader;

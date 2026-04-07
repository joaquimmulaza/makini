import { Edit3, Loader2, Save, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PROFILE_WORKSPACE_COPY } from '@/data/profileWorkspaceData';

export interface ProfileWorkspaceHeaderProps {
  readonly isEditing: boolean;
  readonly isDirty: boolean;
  readonly saving: boolean;
  readonly onStartEditing: () => void;
  readonly onCancelEditing: () => void;
  readonly onSaveProfile: () => void;
}

export default function ProfileWorkspaceHeader({
  isEditing,
  isDirty,
  saving,
  onStartEditing,
  onCancelEditing,
  onSaveProfile,
}: Readonly<ProfileWorkspaceHeaderProps>) {
  return (
    <header className="rounded-xl bg-white px-6 py-5 shadow-sm ring-1 ring-makini-clay/10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold tracking-tight text-makini-earth">
            {PROFILE_WORKSPACE_COPY.pageTitle}
          </h1>
          <p className="mt-1 text-sm text-makini-clay">{PROFILE_WORKSPACE_COPY.subtitle}</p>
        </div>

        {!isEditing ? (
          <Button
            className="h-10 gap-2 rounded-lg bg-makini-green px-4 text-white hover:bg-makini-green/90"
            onClick={onStartEditing}
            type="button"
          >
            <Edit3 className="h-4 w-4" />
            {PROFILE_WORKSPACE_COPY.secondaryAction}
          </Button>
        ) : (
          <div className="flex flex-wrap items-center gap-2" role="group">
            <Button
              className="h-10 rounded-lg"
              onClick={onCancelEditing}
              type="button"
              variant="outline"
            >
              <X className="h-4 w-4" />
              {PROFILE_WORKSPACE_COPY.tertiaryAction}
            </Button>
            <Button
              className="h-10 gap-2 rounded-lg bg-makini-green px-4 text-white hover:bg-makini-green/90"
              disabled={!isDirty || saving}
              onClick={onSaveProfile}
              type="button"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {PROFILE_WORKSPACE_COPY.primaryAction}
            </Button>
            <span aria-live="polite" className="sr-only">
              {saving ? 'Salvando alteracoes...' : ''}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

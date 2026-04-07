import { Lock, Map } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PROFILE_WORKSPACE_COPY } from '@/data/profileWorkspaceData';
import { getProfileDisplayName } from '@/lib/profileDomain';
import { toReadableField } from '@/pages/dashboard/profile/profileUtils.ts';
import type { ProfileFormData, ProfileRecord } from '@/pages/dashboard/profile/types';

export interface ProfileWorkspaceAccountPanelProps {
  readonly isEditing: boolean;
  readonly profile: ProfileRecord;
  readonly userEmail?: string;
  readonly formData: ProfileFormData;
  readonly setField: (field: keyof ProfileFormData, value: string) => void;
}

function FieldLabel({ children }: Readonly<{ children: string }>) {
  return (
    <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-makini-clay">{children}</label>
  );
}

function FieldValue({ children }: Readonly<{ children: string }>) {
  return <p className="pt-2 text-3xl font-heading font-semibold text-makini-earth">{children}</p>;
}

export default function ProfileWorkspaceAccountPanel({
  isEditing,
  profile,
  userEmail,
  formData,
  setField,
}: Readonly<ProfileWorkspaceAccountPanelProps>) {
  const displayName = getProfileDisplayName(profile, '');

  return (
    <Card className="rounded-xl border-0 bg-white py-0 shadow-sm ring-1 ring-makini-clay/10">
      <CardHeader className="px-8 pb-0 pt-8">
        <CardTitle className="text-4xl font-heading font-bold text-makini-earth">
          {PROFILE_WORKSPACE_COPY.accountTitle}
        </CardTitle>
        <div className="mt-3 h-1.5 w-14 rounded-full bg-makini-lightGreen" />
      </CardHeader>

      <CardContent className="space-y-8 px-8 pb-8 pt-7">
        <div className="space-y-2">
          <FieldLabel>{PROFILE_WORKSPACE_COPY.verifiedEmailLabel}</FieldLabel>
          <div className="flex h-14 items-center gap-2 rounded-lg bg-makini-sand px-4">
            <Lock className="h-4 w-4 text-makini-clay" />
            <span className="text-sm font-medium text-makini-clay">{toReadableField(userEmail, '-')}</span>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>{PROFILE_WORKSPACE_COPY.fullNameLabel}</FieldLabel>
            {isEditing ? (
              <Input
                autoComplete="name"
                className="h-12 border-0 border-b-2 border-makini-clay/25 rounded-none bg-transparent p-0 text-2xl font-heading font-semibold text-makini-earth focus-visible:border-makini-green"
                name="nome"
                onChange={(event) => setField('nome', event.target.value)}
                value={formData.nome}
              />
            ) : (
              <FieldValue>{toReadableField(displayName, '-')}</FieldValue>
            )}
          </div>

          <div className="space-y-2">
            <FieldLabel>{PROFILE_WORKSPACE_COPY.phoneLabel}</FieldLabel>
            {isEditing ? (
              <Input
                autoComplete="tel"
                className="h-12 border-0 border-b-2 border-makini-clay/25 rounded-none bg-transparent p-0 text-2xl font-heading font-semibold text-makini-earth focus-visible:border-makini-green"
                inputMode="tel"
                name="telefone"
                onChange={(event) => setField('telefone', event.target.value)}
                type="tel"
                value={formData.telefone}
              />
            ) : (
              <FieldValue>{toReadableField(profile.telefone)}</FieldValue>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel>{PROFILE_WORKSPACE_COPY.locationLabel}</FieldLabel>
          {isEditing ? (
            <div className="relative">
              <Input
                autoComplete="address-level1"
                className="h-12 border-0 border-b-2 border-makini-clay/25 rounded-none bg-transparent p-0 pr-8 text-2xl font-heading font-semibold text-makini-earth focus-visible:border-makini-green"
                name="localizacao"
                onChange={(event) => setField('localizacao', event.target.value)}
                value={formData.localizacao}
              />
              <Map className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-makini-clay" />
            </div>
          ) : (
            <FieldValue>{toReadableField(profile.localizacao)}</FieldValue>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

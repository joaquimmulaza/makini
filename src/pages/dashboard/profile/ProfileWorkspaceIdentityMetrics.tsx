import { Loader2, MapPin } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { PROFILE_WORKSPACE_COPY } from '@/data/profileWorkspaceData';
import { getProfileDisplayName } from '@/lib/profileDomain';
import { getInitials, toReadableField } from '@/pages/dashboard/profile/profileUtils.ts';
import type { ProfileRecord, ProfileStats, UserRole } from '@/pages/dashboard/profile/types';

export interface ProfileWorkspaceIdentityMetricsProps {
  readonly profile: ProfileRecord;
  readonly completion: number;
  readonly stats: ProfileStats;
  readonly roleLabel: string;
  readonly role: UserRole;
  readonly statsLoading: boolean;
}

function CompletionRing({ completion }: Readonly<{ completion: number }>) {
  const circumference = 2 * Math.PI * 28;
  const strokeOffset = circumference - (completion / 100) * circumference;

  return (
    <div className="text-center">
      <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-makini-sand">
        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
          <circle
            className="text-makini-lightGreen/40"
            cx="32"
            cy="32"
            fill="none"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
          />
          <circle
            className="text-makini-green"
            cx="32"
            cy="32"
            fill="none"
            r="28"
            stroke="currentColor"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            strokeWidth="4"
          />
        </svg>
        <span className="absolute text-xs font-bold text-makini-earth">{completion}%</span>
      </div>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-makini-clay">
        {PROFILE_WORKSPACE_COPY.profileComplete}
      </p>
    </div>
  );
}

export default function ProfileWorkspaceIdentityMetrics({
  profile,
  completion,
  stats,
  roleLabel,
  role,
  statsLoading,
}: Readonly<ProfileWorkspaceIdentityMetricsProps>) {
  const displayName = getProfileDisplayName(profile, '');

  return (
    <div className="grid gap-5 xl:grid-cols-[1.45fr,1fr]">
      <Card className="rounded-xl border-0 bg-white py-0 shadow-sm ring-1 ring-makini-clay/10">
        <CardContent className="flex items-center justify-between gap-4 px-6 py-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-20 border-4 border-makini-sand">
              <AvatarImage alt={toReadableField(displayName, 'Utilizador')} src="" />
              <AvatarFallback className="bg-makini-earth/10 text-lg font-heading font-bold text-makini-earth">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>

            <div>
              <h2 className="text-4xl font-heading font-bold tracking-tight text-makini-earth">
                {toReadableField(displayName, 'Utilizador Makini')}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge className="rounded-full bg-makini-lightGreen text-[10px] font-bold uppercase tracking-wide text-makini-earth hover:bg-makini-lightGreen">
                  {roleLabel}
                </Badge>
                <span className="inline-flex items-center gap-1 text-sm text-makini-clay">
                  <MapPin className="h-3.5 w-3.5" />
                  {toReadableField(profile.localizacao)}
                </span>
              </div>
            </div>
          </div>

          <CompletionRing completion={completion} />
        </CardContent>
      </Card>

      <Card className="rounded-xl border-0 bg-white py-0 shadow-sm ring-1 ring-makini-clay/10">
        <CardContent className="h-full px-6 py-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-makini-clay">
            {PROFILE_WORKSPACE_COPY.operationalTitle}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div>
              <p className="text-5xl font-heading font-extrabold leading-none text-makini-green">
                {statsLoading ? <Loader2 className="h-7 w-7 animate-spin" /> : stats.reservas}
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-makini-clay">
                {role === 'fornecedor' ? 'Reservas Recebidas' : PROFILE_WORKSPACE_COPY.reservationsDone}
              </p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-heading font-extrabold leading-none text-makini-clay">
                {statsLoading ? <Loader2 className="ml-auto h-7 w-7 animate-spin" /> : (role === 'fornecedor' ? stats.listings : 0)}
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-makini-clay">
                {PROFILE_WORKSPACE_COPY.listingsActive}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

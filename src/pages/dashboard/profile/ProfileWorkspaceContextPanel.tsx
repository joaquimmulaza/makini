import { ArrowRight, History, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { ProfileStats, RoleMeta, TimelineEntry, UserRole } from '@/pages/dashboard/profile/types';

export interface ProfileWorkspaceContextPanelProps {
  readonly roleMeta: RoleMeta;
  readonly role: UserRole;
  readonly stats: ProfileStats;
  readonly timeline: TimelineEntry[];
}

function getRoleInsight(role: UserRole, stats: ProfileStats): string {
  if (role === 'fornecedor') {
    return `${stats.pendentes} pedido(s) pendente(s), ${stats.aprovadas} pedido(s) aprovado(s).`;
  }

  return `${stats.pendentes} pedido(s) em analise, ${stats.aprovadas} pedido(s) aprovado(s).`;
}

export default function ProfileWorkspaceContextPanel({
  roleMeta,
  role,
  stats,
  timeline,
}: Readonly<ProfileWorkspaceContextPanelProps>) {
  return (
    <section className="space-y-6">
      <article className="rounded-xl bg-white p-7 shadow-sm ring-1 ring-makini-clay/10">
        <h4 className="text-3xl font-heading font-bold text-makini-earth">{roleMeta.title}</h4>
        <p className="mt-4 text-base leading-relaxed text-makini-clay">{roleMeta.description}</p>
        <p className="mt-3 text-sm font-medium text-makini-earth">{getRoleInsight(role, stats)}</p>

        <Link
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-makini-green hover:text-makini-earth"
          to={roleMeta.ctaTo}
        >
          {roleMeta.ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </article>

      <article className="rounded-xl bg-transparent px-2 py-1">
        {timeline.length === 0 ? (
          <div className="rounded-lg bg-white p-5 text-sm text-makini-clay ring-1 ring-makini-clay/10">
            Nenhuma atividade recente encontrada para este perfil.
          </div>
        ) : (
          timeline.map((entry, index) => (
            <div className="flex gap-4" key={entry.id}>
              <div className="flex flex-col items-center">
                <div className={`h-3 w-3 rounded-full ${entry.done ? 'bg-makini-green' : 'bg-makini-lightGreen'}`} />
                {index < timeline.length - 1 ? (
                  <div className="h-16 w-px bg-makini-clay/30" />
                ) : null}
              </div>

              <div className="pb-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-makini-clay">
                  {entry.label}
                </p>
                <p className="text-2xl font-heading font-semibold text-makini-earth">{entry.title}</p>
                <p className="mt-1 text-sm text-makini-clay">{entry.detail}</p>
              </div>
            </div>
          ))
        )}
      </article>

      <div className="rounded-xl bg-makini-sand p-4 text-makini-clay">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest">
          {role === 'fornecedor' ? <History className="h-4 w-4 text-makini-green" /> : <Sprout className="h-4 w-4 text-makini-green" />}
          {role === 'fornecedor' ? 'Workspace Comercial' : 'Workspace Agricola'}
        </div>
      </div>
    </section>
  );
}

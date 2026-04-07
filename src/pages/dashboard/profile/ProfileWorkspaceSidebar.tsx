import { CalendarCheck2, LayoutDashboard, LogOut, ShoppingBag, User } from 'lucide-react';

import { Button } from '@/components/ui/button';

export interface ProfileWorkspaceSidebarProps {
  readonly userName: string;
  readonly roleLabel: string;
  readonly dashboardLabel: string;
  readonly onGoToProfile: () => void;
  readonly onGoToMarketplace: () => void;
  readonly onGoToDashboard: () => void;
  readonly onSignOut: () => void;
}

export default function ProfileWorkspaceSidebar({
  userName,
  roleLabel,
  dashboardLabel,
  onGoToProfile,
  onGoToMarketplace,
  onGoToDashboard,
  onSignOut,
}: Readonly<ProfileWorkspaceSidebarProps>) {
  return (
    <aside className="hidden h-full rounded-xl bg-makini-sand p-6 lg:flex lg:flex-col">
      <div className="mb-8">
        <p className="text-lg font-heading font-bold text-makini-earth">{userName}</p>
        <p className="text-[11px] uppercase tracking-wide text-makini-clay">{roleLabel}</p>
      </div>

      <nav className="space-y-2">
        <button
          className="flex w-full items-center gap-3 rounded-lg bg-white px-4 py-3 text-left text-sm font-medium text-makini-green shadow-sm"
          onClick={onGoToProfile}
          type="button"
        >
          <User className="h-4 w-4" />
          Perfil
        </button>

        <button
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-makini-clay transition hover:bg-white/70 hover:text-makini-earth"
          onClick={onGoToMarketplace}
          type="button"
        >
          <ShoppingBag className="h-4 w-4" />
          Marketplace
        </button>

        <button
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-makini-clay transition hover:bg-white/70 hover:text-makini-earth"
          onClick={onGoToDashboard}
          type="button"
        >
          <LayoutDashboard className="h-4 w-4" />
          {dashboardLabel}
        </button>
      </nav>

      <Button
        className="mt-auto h-10 rounded-lg bg-makini-green text-xs font-semibold uppercase tracking-wider text-white hover:bg-makini-green/90"
        onClick={onGoToDashboard}
        type="button"
      >
        <CalendarCheck2 className="mr-2 h-4 w-4" />
        Ver atividade
      </Button>

      <div className="mt-6 space-y-2 border-t border-makini-clay/20 pt-4">
        <button
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-makini-clay hover:bg-white/70"
          onClick={onSignOut}
          type="button"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair
        </button>
      </div>
    </aside>
  );
}

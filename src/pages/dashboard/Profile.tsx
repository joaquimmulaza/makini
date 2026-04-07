import { Loader2 } from 'lucide-react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { useProfileWorkspace } from '@/hooks/useProfileWorkspace';
import { getProfileDisplayName } from '@/lib/profileDomain';
import ProfileWorkspaceAccountPanel from '@/pages/dashboard/profile/ProfileWorkspaceAccountPanel';
import ProfileWorkspaceContextPanel from '@/pages/dashboard/profile/ProfileWorkspaceContextPanel';
import ProfileWorkspaceHeader from '@/pages/dashboard/profile/ProfileWorkspaceHeader';
import ProfileWorkspaceIdentityMetrics from '@/pages/dashboard/profile/ProfileWorkspaceIdentityMetrics';
import ProfileWorkspaceSidebar from '@/pages/dashboard/profile/ProfileWorkspaceSidebar';

export default function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const workspace = useProfileWorkspace({
    userId: user?.id,
    userEmail: user?.email,
    profile,
    onProfileUpdated: refreshProfile,
  });

  const dashboardRoute = workspace.role === 'fornecedor' ? '/dashboard' : '/minhas-reservas';
  const dashboardLabel = workspace.role === 'fornecedor' ? 'Painel' : 'Minhas Reservas';

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/login');
  }, [navigate, signOut]);

  if (workspace.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-makini-sand">
        <Loader2 className="h-8 w-8 animate-spin text-makini-green" />
      </div>
    );
  }

  if (!workspace.activeProfile || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-makini-sand px-4">
        <p className="max-w-md text-center text-sm text-makini-clay">
          Nao foi possivel carregar seu perfil agora. Tente novamente em alguns instantes.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-makini-sand px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <ProfileWorkspaceHeader
          isDirty={workspace.isDirty}
          isEditing={workspace.isEditing}
          onCancelEditing={workspace.cancelEditing}
          onSaveProfile={workspace.saveProfile}
          onStartEditing={workspace.startEditing}
          saving={workspace.saving}
        />

        <div className="grid gap-6 lg:grid-cols-[240px,1fr]">
          <ProfileWorkspaceSidebar
            dashboardLabel={dashboardLabel}
            onGoToDashboard={() => navigate(dashboardRoute)}
            onGoToMarketplace={() => navigate('/buscar')}
            onGoToProfile={() => navigate('/perfil')}
            onSignOut={handleSignOut}
            roleLabel={workspace.roleMeta.badge}
            userName={getProfileDisplayName(workspace.activeProfile, 'Utilizador')}
          />

          <main className="space-y-6">
            <ProfileWorkspaceIdentityMetrics
              completion={workspace.completion}
              profile={workspace.activeProfile}
              role={workspace.role}
              roleLabel={workspace.roleMeta.badge}
              stats={workspace.stats}
              statsLoading={workspace.statsLoading}
            />

            <div className="grid gap-6 xl:grid-cols-[1.65fr,0.9fr]">
              <ProfileWorkspaceAccountPanel
                formData={workspace.formData}
                isEditing={workspace.isEditing}
                profile={workspace.activeProfile}
                setField={workspace.setField}
                userEmail={user.email}
              />

              <ProfileWorkspaceContextPanel
                role={workspace.role}
                roleMeta={workspace.roleMeta}
                stats={workspace.stats}
                timeline={workspace.timeline}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import {
  DEFAULT_PROFILE_STATS,
  buildProfileFormData,
  buildProfileUpdatePayload,
  fetchProfileByUserId,
  fetchProfileStats,
  fetchProfileTimeline,
  resolveUserRole,
  updateProfileByUserId,
} from '@/lib/profileDomain';
import { getRoleMeta, profileCompletion } from '@/pages/dashboard/profile/profileUtils.ts';
import type { ProfileFormData, ProfileRecord, ProfileStats, TimelineEntry, UserRole } from '@/pages/dashboard/profile/types';

const EMPTY_FORM: ProfileFormData = {
  nome: '',
  telefone: '',
  localizacao: '',
};

interface UseProfileWorkspaceParams {
  userId?: string;
  userEmail?: string;
  profile?: ProfileRecord | null;
  onProfileUpdated?: (nextProfile: ProfileRecord) => Promise<void> | void;
}

export interface UseProfileWorkspaceResult {
  loading: boolean;
  saving: boolean;
  statsLoading: boolean;
  isEditing: boolean;
  isDirty: boolean;
  formData: ProfileFormData;
  stats: ProfileStats;
  timeline: TimelineEntry[];
  activeProfile: ProfileRecord | null;
  completion: number;
  role: UserRole;
  roleMeta: ReturnType<typeof getRoleMeta>;
  setField: (field: keyof ProfileFormData, value: string) => void;
  startEditing: () => void;
  cancelEditing: () => void;
  saveProfile: () => Promise<void>;
}

export function useProfileWorkspace({
  userId,
  userEmail,
  profile,
  onProfileUpdated,
}: Readonly<UseProfileWorkspaceParams>): UseProfileWorkspaceResult {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [localProfile, setLocalProfile] = useState<ProfileRecord | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>(EMPTY_FORM);
  const [stats, setStats] = useState<ProfileStats>(DEFAULT_PROFILE_STATS);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);

  const activeProfile = localProfile || profile || null;
  const role = resolveUserRole(activeProfile);
  const roleMeta = useMemo(() => getRoleMeta(role), [role]);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!userId) {
        setLocalProfile(null);
        setFormData(EMPTY_FORM);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const remoteProfile = await fetchProfileByUserId(userId);
        const nextProfile = remoteProfile || profile || null;
        if (cancelled) return;

        setLocalProfile(nextProfile);
        setFormData(buildProfileFormData(nextProfile));
      } catch (error) {
        console.error('Error loading profile workspace data:', error);

        if (cancelled) return;
        const fallbackProfile = profile || null;
        setLocalProfile(fallbackProfile);
        setFormData(buildProfileFormData(fallbackProfile));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [profile, userId]);

  const fetchInsights = useCallback(async () => {
    if (!userId || !activeProfile) {
      setStats(DEFAULT_PROFILE_STATS);
      setTimeline([]);
      return;
    }

    const currentRole = resolveUserRole(activeProfile);
    setStatsLoading(true);

    try {
      const [nextStats, nextTimeline] = await Promise.all([
        fetchProfileStats(userId, currentRole),
        fetchProfileTimeline(userId, currentRole),
      ]);

      setStats(nextStats);
      setTimeline(nextTimeline);
    } catch (error) {
      console.error('Error loading profile workspace insights:', error);
      setStats(DEFAULT_PROFILE_STATS);
      setTimeline([]);
    } finally {
      setStatsLoading(false);
    }
  }, [activeProfile, userId]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const baseFormData = useMemo(() => buildProfileFormData(activeProfile), [activeProfile]);

  const isDirty = useMemo(() => {
    if (!activeProfile) return false;

    return (
      formData.nome.trim() !== baseFormData.nome.trim() ||
      formData.telefone.trim() !== baseFormData.telefone.trim() ||
      formData.localizacao.trim() !== baseFormData.localizacao.trim()
    );
  }, [activeProfile, baseFormData.localizacao, baseFormData.nome, baseFormData.telefone, formData.localizacao, formData.nome, formData.telefone]);

  const completion = useMemo(
    () => profileCompletion(activeProfile, userEmail),
    [activeProfile, userEmail]
  );

  const setField = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const startEditing = () => setIsEditing(true);

  const cancelEditing = () => {
    setFormData(baseFormData);
    setIsEditing(false);
  };

  const saveProfile = async () => {
    if (!userId || !activeProfile || !isDirty) return;

    const payload = buildProfileUpdatePayload(activeProfile, formData);
    if (Object.keys(payload).length === 0) {
      toast.error('Nao foi possivel identificar campos editaveis neste perfil.');
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      const updatedProfile = await updateProfileByUserId(userId, payload);
      const nextProfile = (updatedProfile || { ...activeProfile, ...payload }) as ProfileRecord;

      setLocalProfile(nextProfile);
      setFormData(buildProfileFormData(nextProfile));
      setIsEditing(false);

      if (onProfileUpdated) {
        await onProfileUpdated(nextProfile);
      }

      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil.');
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    statsLoading,
    isEditing,
    isDirty,
    formData,
    stats,
    timeline,
    activeProfile,
    completion,
    role,
    roleMeta,
    setField,
    startEditing,
    cancelEditing,
    saveProfile,
  };
}

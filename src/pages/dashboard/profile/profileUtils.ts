import { PROFILE_ROLE_META } from '../../../data/profileWorkspaceData';
import type { ProfileRecord, RoleMeta } from './types';

export function getRoleMeta(role: string | undefined): RoleMeta {
  if (!role) return PROFILE_ROLE_META.agricultor;
  return PROFILE_ROLE_META[role] || PROFILE_ROLE_META.agricultor;
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function profileCompletion(record: ProfileRecord | null, email?: string): number {
  const checks = [record?.nome || record?.nome_completo, record?.telefone, record?.localizacao, email];
  const filled = checks.filter((value) => Boolean(String(value || '').trim())).length;
  return Math.max(25, Math.round((filled / checks.length) * 100));
}

export function toEditableField(value: string | null | undefined): string {
  return value ? value : '';
}

export function toReadableField(value: string | null | undefined, fallback = 'Nao informado'): string {
  return value && value.trim() ? value : fallback;
}

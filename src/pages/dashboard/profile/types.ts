export type UserRole = 'agricultor' | 'fornecedor' | string;

export interface ProfileStats {
  reservas: number;
  listings: number;
  pendentes: number;
  aprovadas: number;
}

export interface ProfileFormData {
  nome: string;
  telefone: string;
  localizacao: string;
}

export interface ProfileRecord {
  role?: UserRole;
  nome?: string | null;
  nome_completo?: string | null;
  telefone?: string | null;
  localizacao?: string | null;
  [key: string]: unknown;
}

export interface RoleMeta {
  badge: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaTo: string;
}

export interface TimelineEntry {
  id: string;
  label: string;
  title: string;
  detail: string;
  done: boolean;
  timestamp?: string;
}

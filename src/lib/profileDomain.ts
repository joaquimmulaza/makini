import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

import { supabase } from '@/lib/supabase';
import type { ProfileFormData, ProfileRecord, ProfileStats, TimelineEntry, UserRole } from '@/pages/dashboard/profile/types';

const DEFAULT_ROLE: UserRole = 'agricultor';

export const DEFAULT_PROFILE_STATS: ProfileStats = {
  reservas: 0,
  listings: 0,
  pendentes: 0,
  aprovadas: 0,
};

function hasOwnField(profile: ProfileRecord | null | undefined, field: string): boolean {
  if (!profile) return false;
  return Object.prototype.hasOwnProperty.call(profile, field);
}

function sanitizeInput(value: string, maxLength: number): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function formatEventDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return format(parsed, "dd MMM yyyy 'as' HH:mm", { locale: pt });
}

function statusLabel(status: string | null | undefined): string {
  if (status === 'aprovada') return 'Aprovada';
  if (status === 'rejeitada') return 'Rejeitada';
  if (status === 'cancelada') return 'Cancelada';
  return 'Pendente';
}

export function resolveUserRole(profile: ProfileRecord | null | undefined): UserRole {
  if (profile?.role === 'fornecedor') return 'fornecedor';
  return DEFAULT_ROLE;
}

export function getProfileDisplayName(profile: ProfileRecord | null | undefined, fallback = ''): string {
  const raw = profile?.nome || profile?.nome_completo || fallback;
  return sanitizeInput(String(raw || fallback), 120) || fallback;
}

export function buildProfileFormData(profile: ProfileRecord | null | undefined): ProfileFormData {
  return {
    nome: getProfileDisplayName(profile, ''),
    telefone: sanitizeInput(String(profile?.telefone || ''), 32),
    localizacao: sanitizeInput(String(profile?.localizacao || ''), 120),
  };
}

export function buildProfileUpdatePayload(profile: ProfileRecord, formData: ProfileFormData): Record<string, string> {
  const payload: Record<string, string> = {};
  const safeName = sanitizeInput(formData.nome, 120);
  const safePhone = sanitizeInput(formData.telefone, 32);
  const safeLocation = sanitizeInput(formData.localizacao, 120);

  if (hasOwnField(profile, 'nome')) payload.nome = safeName;
  if (hasOwnField(profile, 'nome_completo')) payload.nome_completo = safeName;
  if (hasOwnField(profile, 'telefone')) payload.telefone = safePhone;
  if (hasOwnField(profile, 'localizacao')) payload.localizacao = safeLocation;

  return payload;
}

export async function fetchProfileByUserId(userId: string): Promise<ProfileRecord | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw error;
  }

  return (data as ProfileRecord) || null;
}

export async function updateProfileByUserId(
  userId: string,
  payload: Record<string, string>
): Promise<ProfileRecord | null> {
  if (Object.keys(payload).length === 0) return null;

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return (data as ProfileRecord) || null;
}

export async function fetchProfileStats(userId: string, role: UserRole): Promise<ProfileStats> {
  if (!userId) return DEFAULT_PROFILE_STATS;

  const countReservasTotal = supabase
    .from('reservas')
    .select('*', { count: 'exact', head: true });

  const countReservasPendentes = supabase
    .from('reservas')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pendente');

  const countReservasAprovadas = supabase
    .from('reservas')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'aprovada');

  if (role === 'fornecedor') {
    const [totalReservas, pendentes, aprovadas, listings] = await Promise.all([
      countReservasTotal.eq('fornecedor_id', userId),
      countReservasPendentes.eq('fornecedor_id', userId),
      countReservasAprovadas.eq('fornecedor_id', userId),
      supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('fornecedor_id', userId),
    ]);

    if (totalReservas.error) throw totalReservas.error;
    if (pendentes.error) throw pendentes.error;
    if (aprovadas.error) throw aprovadas.error;
    if (listings.error) throw listings.error;

    return {
      reservas: totalReservas.count || 0,
      listings: listings.count || 0,
      pendentes: pendentes.count || 0,
      aprovadas: aprovadas.count || 0,
    };
  }

  const [totalReservas, pendentes, aprovadas] = await Promise.all([
    countReservasTotal.eq('agricultor_id', userId),
    countReservasPendentes.eq('agricultor_id', userId),
    countReservasAprovadas.eq('agricultor_id', userId),
  ]);

  if (totalReservas.error) throw totalReservas.error;
  if (pendentes.error) throw pendentes.error;
  if (aprovadas.error) throw aprovadas.error;

  return {
    reservas: totalReservas.count || 0,
    listings: 0,
    pendentes: pendentes.count || 0,
    aprovadas: aprovadas.count || 0,
  };
}

export async function fetchProfileTimeline(userId: string, role: UserRole): Promise<TimelineEntry[]> {
  if (!userId) return [];

  const baseReservationQuery = supabase
    .from('reservas')
    .select(`
      id,
      status,
      created_at,
      dias_solicitados,
      listings (titulo, nome_empresa)
    `)
    .order('created_at', { ascending: false })
    .limit(3);

  const reservationsPromise =
    role === 'fornecedor'
      ? baseReservationQuery.eq('fornecedor_id', userId)
      : baseReservationQuery.eq('agricultor_id', userId);

  const listingsPromise =
    role === 'fornecedor'
      ? supabase
          .from('listings')
          .select('id, titulo, created_at')
          .eq('fornecedor_id', userId)
          .order('created_at', { ascending: false })
          .limit(2)
      : Promise.resolve({ data: [], error: null });

  const [reservationsResult, listingsResult] = await Promise.all([reservationsPromise, listingsPromise]);
  if (reservationsResult.error) throw reservationsResult.error;
  if (listingsResult.error) throw listingsResult.error;

  const reservationEvents: TimelineEntry[] = (reservationsResult.data || []).map((item: any) => {
    const listingTitle = item?.listings?.titulo || 'Recurso';
    const providerName = item?.listings?.nome_empresa ? ` - ${item.listings.nome_empresa}` : '';

    return {
      id: `reserva-${item.id}`,
      label: role === 'fornecedor' ? 'Pedido Recebido' : 'Reserva',
      title:
        role === 'fornecedor'
          ? `Pedido para ${listingTitle}`
          : `Reserva de ${listingTitle}`,
      detail: `${statusLabel(item.status)} - ${formatEventDate(item.created_at)}${providerName}`,
      done: item.status === 'aprovada',
      timestamp: item.created_at,
    };
  });

  const listingEvents: TimelineEntry[] = ((listingsResult.data as any[]) || []).map((item) => ({
    id: `listing-${item.id}`,
    label: 'Anuncio',
    title: `Anuncio ativo: ${item.titulo || 'Recurso'}`,
    detail: `Publicado em ${formatEventDate(item.created_at)}`,
    done: true,
    timestamp: item.created_at,
  }));

  return [...reservationEvents, ...listingEvents]
    .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
    .slice(0, 3);
}

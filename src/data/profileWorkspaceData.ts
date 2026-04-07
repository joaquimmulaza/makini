import type { RoleMeta } from '../pages/dashboard/profile/types';

export const PROFILE_WORKSPACE_COPY = {
  pageTitle: 'Meu Perfil',
  subtitle: 'Gerencie sua identidade digital e preferencias no ecossistema Makini.',
  primaryAction: 'Salvar Alteracoes',
  secondaryAction: 'Editar',
  tertiaryAction: 'Cancelar',
  operationalTitle: 'Estatisticas Operacionais',
  accountTitle: 'Dados da Conta',
  verifiedEmailLabel: 'Endereco de E-mail (Verificado)',
  fullNameLabel: 'Nome Completo',
  phoneLabel: 'Telefone de Contacto',
  locationLabel: 'Localizacao Principal',
  profileComplete: 'Perfil Completo',
  reservationsDone: 'Reservas Efetuadas',
  listingsActive: 'Anuncios Ativos',
};

export const PROFILE_ROLE_META: Readonly<Record<string, RoleMeta>> = {
  agricultor: {
    badge: 'AGRICULTOR',
    title: 'Perfil de Agricultor',
    description:
      'Como agricultor no ecossistema Makini, acompanhe reservas solicitadas, aprovacoes e progresso do seu perfil.',
    ctaLabel: 'EXPLORAR MARKETPLACE',
    ctaTo: '/buscar',
  },
  fornecedor: {
    badge: 'FORNECEDOR',
    title: 'Perfil de Fornecedor',
    description:
      'Como fornecedor no ecossistema Makini, acompanhe anuncios ativos, reservas recebidas e estado operacional da sua conta.',
    ctaLabel: 'ABRIR PAINEL',
    ctaTo: '/dashboard',
  },
};

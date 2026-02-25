import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Calendar, CheckCircle2, XCircle, Clock, Loader2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog.jsx';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function DashboardFornecedor() {
    const [activeTab, setActiveTab] = useState('reservas'); // 'reservas' | 'anuncios'
    const [reservas, setReservas] = useState([]);
    const [myListings, setMyListings] = useState([]);
    const [loading, setLoading] = useState(true);

    // New Listing State
    const [showNewListingDialog, setShowNewListingDialog] = useState(false);
    const [isSubmittingListing, setIsSubmittingListing] = useState(false);
    const [newListingData, setNewListingData] = useState({
        tipo: 'equipamento',
        categoria: '',
        titulo: '',
        capacidade_especificacao: '',
        preco: '',
        unidade_preco: 'kz / dia',
        disponibilidade: 'imediata',
        localizacao: ''
    });

    const { user, profile } = useAuth();

    useEffect(() => {
        const fetchReservas = async () => {
            if (!user) return;
            setLoading(true);

            // Fetch reservas where this user is the fornecedor. 
            // We join with listings to get the equipment details and profiles to get the agricultor name.
            const { data, error } = await supabase
                .from('reservas')
                .select(`
                    id,
                    dias_solicitados,
                    contexto,
                    status,
                    created_at,
                    listings (titulo),
                    profiles!reservas_agricultor_id_fkey (nome_completo)
                `)
                .eq('fornecedor_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching reservas:', error);
            } else if (data) {
                setReservas(data);
            }
            setLoading(false);
        };

        const fetchMyListings = async () => {
            if (!user) return;
            setLoading(true);

            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('fornecedor_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setMyListings(data);
            }
            setLoading(false);
        };

        if (activeTab === 'reservas') {
            fetchReservas();
        } else {
            fetchMyListings();
        }
    }, [user, activeTab]);

    const handleAprovar = async (id) => {
        const { error } = await supabase
            .from('reservas')
            .update({ status: 'aprovada' })
            .eq('id', id);

        if (!error) {
            setReservas(prev => prev.map(r => r.id === id ? { ...r, status: 'aprovada' } : r));
        } else {
            alert("Erro ao aprovar a reserva.");
        }
    };

    const handleRejeitar = async (id) => {
        const { error } = await supabase
            .from('reservas')
            .update({ status: 'rejeitada' })
            .eq('id', id);

        if (!error) {
            setReservas(prev => prev.map(r => r.id === id ? { ...r, status: 'rejeitada' } : r));
        } else {
            alert("Erro ao rejeitar a reserva.");
        }
    };

    const handleDeleteListing = async (id) => {
        if (!window.confirm("Tem a certeza que deseja apagar este anúncio?")) return;

        const { error } = await supabase
            .from('listings')
            .delete()
            .eq('id', id);

        if (!error) {
            setMyListings(prev => prev.filter(l => l.id !== id));
        } else {
            alert("Erro ao apagar o anúncio.");
        }
    };

    const handleCreateListing = async (e) => {
        e.preventDefault();
        setIsSubmittingListing(true);

        const { data, error } = await supabase
            .from('listings')
            .insert([{
                fornecedor_id: user.id,
                nome_empresa: profile?.nome_completo || 'Empresa Fornecedora',
                ...newListingData
            }])
            .select();

        if (error) {
            console.error("Erro a criar anúncio:", error);
            alert("Ocorreu um erro ao criar o anúncio.");
        } else if (data) {
            setMyListings(prev => [data[0], ...prev]);
            setShowNewListingDialog(false);
            setNewListingData({
                tipo: 'equipamento', categoria: '', titulo: '', capacidade_especificacao: '', preco: '', unidade_preco: 'kz / dia', disponibilidade: 'imediata', localizacao: ''
            });
            alert("Anúncio criado com sucesso!");
        }
        setIsSubmittingListing(false);
    };

    return (
        <div className="min-h-screen bg-makini-sand py-12 px-4">
            <div className="container mx-auto max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-heading font-bold text-makini-earth mb-2">Painel do Fornecedor</h1>
                    <p className="text-makini-clay">Faça a gestão dos seus anúncios e pedidos de reserva.</p>
                </div>

                <div className="mb-10 flex gap-4 border-b border-makini-clay/20 pb-4">
                    <Button
                        variant="ghost"
                        onClick={() => setActiveTab('reservas')}
                        className={`font-semibold rounded-none px-0 ${activeTab === 'reservas' ? 'text-makini-green border-b-2 border-makini-green' : 'text-makini-clay hover:text-makini-earth'}`}
                    >
                        Gestão de Reservas
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setActiveTab('anuncios')}
                        className={`font-semibold rounded-none px-0 ${activeTab === 'anuncios' ? 'text-makini-green border-b-2 border-makini-green' : 'text-makini-clay hover:text-makini-earth'}`}
                    >
                        Meus Anúncios
                    </Button>
                </div>

                {activeTab === 'reservas' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-heading font-semibold text-makini-earth flex items-center gap-2">
                            <Clock className="w-5 h-5" /> Pedidos Recentes
                        </h2>

                        {loading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-8 h-8 animate-spin text-makini-green" />
                            </div>
                        ) : reservas.length === 0 ? (
                            <Card className="bg-white border-makini-clay/20 border-dashed">
                                <CardContent className="p-10 text-center">
                                    <p className="text-makini-clay text-lg">Ainda não tem pedidos de reserva pendentes.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            reservas.map((reserva) => (
                                <Card key={reserva.id} className="bg-white border-makini-clay/20">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row justify-between gap-6">
                                            <div className="space-y-3 flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-bold text-lg text-makini-earth">{reserva.listings?.titulo || 'Equipamento'}</h3>
                                                    <Badge variant={reserva.status === 'pendente' ? 'outline' : reserva.status === 'aprovada' ? 'success' : 'destructive'}>
                                                        {reserva.status === 'pendente' ? 'Aguardando Aprovação' : reserva.status === 'aprovada' ? 'Aprovada' : 'Rejeitada'}
                                                    </Badge>
                                                </div>
                                                <div className="text-sm text-makini-clay">
                                                    <p><strong className="text-makini-black">Solicitado por:</strong> {reserva.profiles?.nome_completo || 'Utilizador'}</p>
                                                    <p className="flex items-center gap-1 mt-1"><Calendar className="w-4 h-4" /> <strong>Datas Solicitadas:</strong> {reserva.dias_solicitados}</p>
                                                    <p className="text-xs text-makini-clay/70 mt-1">Submetido a {format(new Date(reserva.created_at), "dd 'de' MMMM, HH:mm", { locale: pt })}</p>
                                                </div>
                                                <div className="bg-makini-sand p-3 rounded-md border border-makini-clay/10 mt-2">
                                                    <p className="text-sm text-makini-black italic">"{reserva.contexto || 'Sem contexto adicional'}"</p>
                                                </div>
                                            </div>

                                            {reserva.status === 'pendente' && (
                                                <div className="flex flex-row md:flex-col gap-3 justify-center min-w-[140px]">
                                                    <Button onClick={() => handleAprovar(reserva.id)} className="bg-makini-green hover:bg-makini-green/90 w-full flex items-center justify-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4" /> Aprovar
                                                    </Button>
                                                    <Button onClick={() => handleRejeitar(reserva.id)} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 w-full flex items-center justify-center gap-2">
                                                        <XCircle className="w-4 h-4" /> Rejeitar
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'anuncios' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-heading font-semibold text-makini-earth">Os Meus Recursos</h2>
                            <Dialog open={showNewListingDialog} onOpenChange={setShowNewListingDialog}>
                                <DialogTrigger asChild>
                                    <Button className="bg-makini-earth hover:bg-makini-clay flex items-center gap-2">
                                        <Plus className="w-4 h-4" /> Novo Anúncio
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle>Criar Novo Anúncio</DialogTitle>
                                        <DialogDescription>
                                            Adicione um equipamento, transporte ou serviço para ser descoberto pelos agricultores.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <form onSubmit={handleCreateListing} className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">Tipo</label>
                                                <select
                                                    className="w-full p-2 border border-makini-clay/30 rounded-md"
                                                    value={newListingData.tipo}
                                                    onChange={e => setNewListingData({ ...newListingData, tipo: e.target.value })}
                                                    required
                                                >
                                                    <option value="equipamento">Equipamento</option>
                                                    <option value="transporte">Transporte</option>
                                                    <option value="servico">Serviço</option>
                                                </select>
                                            </div>
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">Categoria</label>
                                                <input
                                                    className="w-full p-2 border border-makini-clay/30 rounded-md"
                                                    placeholder="Ex: Preparação do Solo"
                                                    value={newListingData.categoria}
                                                    onChange={e => setNewListingData({ ...newListingData, categoria: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Título do Anúncio</label>
                                            <input
                                                className="w-full p-2 border border-makini-clay/30 rounded-md"
                                                placeholder="Ex: Tractor Agrícola 4x4"
                                                value={newListingData.titulo}
                                                onChange={e => setNewListingData({ ...newListingData, titulo: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Capacidade / Especificação</label>
                                            <input
                                                className="w-full p-2 border border-makini-clay/30 rounded-md"
                                                placeholder="Ex: 75–120 HP"
                                                value={newListingData.capacidade_especificacao}
                                                onChange={e => setNewListingData({ ...newListingData, capacidade_especificacao: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">Preço</label>
                                                <input
                                                    type="number"
                                                    className="w-full p-2 border border-makini-clay/30 rounded-md"
                                                    placeholder="Ex: 50000"
                                                    value={newListingData.preco}
                                                    onChange={e => setNewListingData({ ...newListingData, preco: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">Unidade</label>
                                                <input
                                                    className="w-full p-2 border border-makini-clay/30 rounded-md"
                                                    placeholder="Ex: kz / dia"
                                                    value={newListingData.unidade_preco}
                                                    onChange={e => setNewListingData({ ...newListingData, unidade_preco: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Localização (Província, Município)</label>
                                            <input
                                                className="w-full p-2 border border-makini-clay/30 rounded-md"
                                                placeholder="Ex: Benguela, Lobito"
                                                value={newListingData.localizacao}
                                                onChange={e => setNewListingData({ ...newListingData, localizacao: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <DialogFooter className="mt-4">
                                            <Button type="button" variant="outline" onClick={() => setShowNewListingDialog(false)}>
                                                Cancelar
                                            </Button>
                                            <Button type="submit" className="bg-makini-green hover:bg-makini-green/90" disabled={isSubmittingListing}>
                                                {isSubmittingListing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Publicar Anúncio'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-8 h-8 animate-spin text-makini-green" />
                            </div>
                        ) : myListings.length === 0 ? (
                            <Card className="bg-white border-makini-clay/20 border-dashed">
                                <CardContent className="p-10 text-center flex flex-col items-center gap-4">
                                    <p className="text-makini-clay text-lg">Ainda não tem nenhum anúncio publicado.</p>
                                    <Button className="bg-makini-green hover:bg-makini-green/90">Criar o Primeiro Anúncio</Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {myListings.map(lst => (
                                    <Card key={lst.id} className="bg-white hover:border-makini-green transition-colors">
                                        <CardContent className="p-4 flex flex-col h-full">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg text-makini-earth">{lst.titulo}</h3>
                                                <Badge variant="outline">{lst.categoria}</Badge>
                                            </div>
                                            <p className="text-sm text-makini-clay mb-4">{lst.capacidade_especificacao}</p>
                                            <div className="mt-auto pt-4 border-t border-makini-sand flex justify-between items-center">
                                                <span className="font-semibold text-makini-green">{Number(lst.preco).toLocaleString()} {lst.unidade_preco}</span>
                                                <Button variant="link" onClick={() => handleDeleteListing(lst.id)} className="text-red-500 hover:text-red-700 px-0">Apagar</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

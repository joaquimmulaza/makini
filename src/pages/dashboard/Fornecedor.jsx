import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Calendar, CheckCircle2, XCircle, Clock, Loader2, Plus, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog.jsx';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CATEGORIAS_NOMES } from '../../lib/categorias';


export default function DashboardFornecedor() {
    const [activeTab, setActiveTab] = useState('reservas'); // 'reservas' | 'ads'
    const [reservas, setReservas] = useState([]);
    const [myListings, setMyListings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit Listing State
    const [editingListing, setEditingListing] = useState(null);
    const [showEditListingDialog, setShowEditListingDialog] = useState(false);
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
    const [imagemEditArquivo, setImagemEditArquivo] = useState(null);

    // New Listing State
    const [showNewListingDialog, setShowNewListingDialog] = useState(false);
    const [isSubmittingListing, setIsSubmittingListing] = useState(false);
    const [imagemArquivo, setImagemArquivo] = useState(null);
    const [newListingData, setNewListingData] = useState({
        tipo: 'equipamento',
        categoria: CATEGORIAS_NOMES[0],
        titulo: '',
        capacidade_especificacao: '',
        preco: '',
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
            toast.success('Reserva aprovada com sucesso!');
        } else {
            toast.error('Erro ao aprovar a reserva.');
        }
    };

    const handleRejeitar = async (id) => {
        const { error } = await supabase
            .from('reservas')
            .update({ status: 'rejeitada' })
            .eq('id', id);

        if (!error) {
            setReservas(prev => prev.map(r => r.id === id ? { ...r, status: 'rejeitada' } : r));
            toast('Reserva rejeitada.', { icon: '🚫' });
        } else {
            toast.error('Erro ao rejeitar a reserva.');
        }
    };

    const handleDeleteListing = (id) => {
        toast(
            (t) => (
                <span className="flex flex-col gap-2">
                    <span className="font-medium">Apagar este anúncio?</span>
                    <span className="text-sm text-gray-500">Esta ação não pode ser desfeita.</span>
                    <div className="flex gap-2 mt-1">
                        <button
                            onClick={async () => {
                                toast.dismiss(t.id);
                                const { error } = await supabase
                                    .from('listings')
                                    .delete()
                                    .eq('id', id);
                                if (!error) {
                                    setMyListings(prev => prev.filter(l => l.id !== id));
                                    toast.success('Anúncio apagado.');
                                } else {
                                    toast.error('Erro ao apagar o anúncio.');
                                }
                            }}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                            Apagar
                        </button>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                        >
                            Cancelar
                        </button>
                    </div>
                </span>
            ),
            { duration: Infinity }
        );
    };


    const uploadImage = async (file) => {
        if (file.size > 5 * 1024 * 1024) {
            toast.error('A imagem é demasiado grande. Máximo permitido: 5MB.');
            return { error: new Error('File too large') };
        }

        const fileExt = file.name.split('.').pop().toLowerCase();
        const fileName = `listing-${user.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('listings')
            .upload(fileName, file, { upsert: true });

        if (uploadError) {
            console.error('Erro ao fazer upload da imagem:', uploadError);
            toast.error(`Erro no upload: ${uploadError.message}`);
            return { error: uploadError };
        }

        const { data: { publicUrl } } = supabase.storage
            .from('listings')
            .getPublicUrl(fileName);

        return { url: publicUrl };
    };

    const handleCreateListing = async (e) => {
        e.preventDefault();
        setIsSubmittingListing(true);

        let imagem_url = null;

        // Upload image to Supabase Storage if a file was selected
        if (imagemArquivo) {
            const { url, error } = await uploadImage(imagemArquivo);
            if (error) {
                setIsSubmittingListing(false);
                return;
            }
            imagem_url = url;
        }

        const { data, error } = await supabase
            .from('listings')
            .insert([{
                fornecedor_id: user.id,
                nome_empresa: profile?.nome_completo || 'Empresa Fornecedora',
                imagem_url,
                ...newListingData
            }])
            .select();

        if (error) {
            console.error("Erro a criar anúncio:", error);
            toast.error('Ocorreu um erro ao criar o anúncio.');
        } else if (data) {
            setMyListings(prev => [data[0], ...prev]);
            setShowNewListingDialog(false);
            setImagemArquivo(null);
            setNewListingData({
                tipo: 'equipamento',
                categoria: CATEGORIAS_NOMES[0],
                titulo: '',
                capacidade_especificacao: '',
                preco: '',
                disponibilidade: 'imediata',
                localizacao: ''
            });
            toast.success('Anúncio criado com sucesso!');
        }
        setIsSubmittingListing(false);
    };

    const handleOpenEdit = (lst) => {
        setEditingListing(lst);
        setImagemEditArquivo(null);
        setShowEditListingDialog(true);
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        setIsSubmittingEdit(true);

        let imagem_url = editingListing.imagem_url;

        // Upload new image if selected
        if (imagemEditArquivo) {
            const { url, error } = await uploadImage(imagemEditArquivo);
            if (error) {
                setIsSubmittingEdit(false);
                return;
            }
            imagem_url = url;
        }

        const { data, error } = await supabase
            .from('listings')
            .update({
                tipo: editingListing.tipo,
                categoria: editingListing.categoria,
                titulo: editingListing.titulo,
                capacidade_especificacao: editingListing.capacidade_especificacao,
                preco: editingListing.preco,
                disponibilidade: editingListing.disponibilidade,
                localizacao: editingListing.localizacao,
                imagem_url
            })
            .eq('id', editingListing.id)
            .select();

        if (error) {
            console.error("Erro a atualizar anúncio:", error);
            toast.error('Ocorreu um erro ao atualizar o anúncio.');
        } else if (data) {
            setMyListings(prev => prev.map(l => l.id === editingListing.id ? data[0] : l));
            setShowEditListingDialog(false);
            setEditingListing(null);
            setImagemEditArquivo(null);
            toast.success('Anúncio atualizado com sucesso!');
        }
        setIsSubmittingEdit(false);
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
                                                    {reserva.dias_solicitados?.includes(' até ') ? (
                                                        <div className="flex flex-col gap-1 mt-1">
                                                            <p className="flex items-center gap-1"><Calendar className="w-4 h-4" /> <strong>Data de Início:</strong> {reserva.dias_solicitados.split(' até ')[0]}</p>
                                                            <p className="flex items-center gap-1"><Calendar className="w-4 h-4" /> <strong>Data de Fim:</strong> {reserva.dias_solicitados.split(' até ')[1]}</p>
                                                        </div>
                                                    ) : (
                                                        <p className="flex items-center gap-1 mt-1"><Calendar className="w-4 h-4" /> <strong>Datas Solicitadas:</strong> {reserva.dias_solicitados}</p>
                                                    )}
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
                                                <select
                                                    className="w-full p-2 border border-makini-clay/30 rounded-md bg-white"
                                                    value={newListingData.categoria}
                                                    onChange={e => setNewListingData({ ...newListingData, categoria: e.target.value })}
                                                    required
                                                >
                                                    {CATEGORIAS_NOMES.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
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
                                                <label className="text-sm font-medium">Preço (kz)</label>
                                                <input
                                                    type="number"
                                                    className="w-full p-2 border border-makini-clay/30 rounded-md"
                                                    placeholder="Ex: 50000"
                                                    value={newListingData.preco}
                                                    onChange={e => setNewListingData({ ...newListingData, preco: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Imagem do Anúncio</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="w-full p-2 border border-makini-clay/30 rounded-md text-sm text-makini-clay file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-makini-sand file:text-makini-earth hover:file:bg-makini-clay/20 cursor-pointer"
                                                onChange={e => setImagemArquivo(e.target.files?.[0] || null)}
                                            />
                                            {imagemArquivo && (
                                                <p className="text-xs text-makini-green">✓ {imagemArquivo.name}</p>
                                            )}
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

                            <Dialog open={showEditListingDialog} onOpenChange={setShowEditListingDialog}>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle>Editar Anúncio</DialogTitle>
                                        <DialogDescription>
                                            Atualize as informações do seu anúncio.
                                        </DialogDescription>
                                    </DialogHeader>

                                    {editingListing && (
                                        <form onSubmit={handleSubmitEdit} className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-medium">Tipo</label>
                                                    <select
                                                        className="w-full p-2 border border-makini-clay/30 rounded-md bg-white"
                                                        value={editingListing.tipo}
                                                        onChange={e => setEditingListing({ ...editingListing, tipo: e.target.value })}
                                                        required
                                                    >
                                                        <option value="equipamento">Equipamento</option>
                                                        <option value="transporte">Transporte</option>
                                                        <option value="servico">Serviço</option>
                                                    </select>
                                                </div>
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-medium">Categoria</label>
                                                    <select
                                                        className="w-full p-2 border border-makini-clay/30 rounded-md bg-white"
                                                        value={editingListing.categoria}
                                                        onChange={e => setEditingListing({ ...editingListing, categoria: e.target.value })}
                                                        required
                                                    >
                                                        {CATEGORIAS_NOMES.map(cat => (
                                                            <option key={cat} value={cat}>{cat}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">Título do Anúncio</label>
                                                <input
                                                    className="w-full p-2 border border-makini-clay/30 rounded-md bg-white"
                                                    value={editingListing.titulo}
                                                    onChange={e => setEditingListing({ ...editingListing, titulo: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">Capacidade / Especificação</label>
                                                <input
                                                    className="w-full p-2 border border-makini-clay/30 rounded-md bg-white"
                                                    value={editingListing.capacidade_especificacao}
                                                    onChange={e => setEditingListing({ ...editingListing, capacidade_especificacao: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-medium">Preço (kz)</label>
                                                    <input
                                                        type="number"
                                                        className="w-full p-2 border border-makini-clay/30 rounded-md bg-white"
                                                        value={editingListing.preco}
                                                        onChange={e => setEditingListing({ ...editingListing, preco: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-medium">Disponibilidade</label>
                                                    <select
                                                        className="w-full p-2 border border-makini-clay/30 rounded-md bg-white"
                                                        value={editingListing.disponibilidade}
                                                        onChange={e => setEditingListing({ ...editingListing, disponibilidade: e.target.value })}
                                                        required
                                                    >
                                                        <option value="imediata">Imediata</option>
                                                        <option value="amanha">Amanhã</option>
                                                        <option value="indisponivel">Indisponível</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">Nova Imagem (opcional)</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="w-full p-2 border border-makini-clay/30 rounded-md text-sm text-makini-clay file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-makini-sand file:text-makini-earth hover:file:bg-makini-clay/20 cursor-pointer"
                                                    onChange={e => setImagemEditArquivo(e.target.files?.[0] || null)}
                                                />
                                                {imagemEditArquivo && (
                                                    <p className="text-xs text-makini-green">✓ {imagemEditArquivo.name} será enviada</p>
                                                )}
                                                {!imagemEditArquivo && editingListing.imagem_url && (
                                                    <p className="text-xs text-gray-500">A imagem atual será mantida.</p>
                                                )}
                                            </div>

                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">Localização</label>
                                                <input
                                                    className="w-full p-2 border border-makini-clay/30 rounded-md bg-white"
                                                    value={editingListing.localizacao}
                                                    onChange={e => setEditingListing({ ...editingListing, localizacao: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <DialogFooter className="mt-4">
                                                <Button type="button" variant="outline" onClick={() => setShowEditListingDialog(false)}>
                                                    Cancelar
                                                </Button>
                                                <Button type="submit" className="bg-makini-green hover:bg-makini-green/90" disabled={isSubmittingEdit}>
                                                    {isSubmittingEdit ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Guardar Alterações'}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    )}
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
                                            {lst.imagem_url ? (
                                                <img src={lst.imagem_url} alt={lst.titulo} className="w-full h-32 object-cover rounded-md mb-2" />
                                            ) : (
                                                <div className="w-full h-20 bg-makini-sand/50 rounded-md flex items-center justify-center mb-2">
                                                    <span className="text-xs text-makini-clay/60">Sem imagem</span>
                                                </div>
                                            )}
                                            <p className="text-sm text-makini-clay mb-4">{lst.capacidade_especificacao}</p>
                                            <div className="mt-auto pt-4 border-t border-makini-sand flex justify-between items-center">
                                                <span className="font-semibold text-makini-green">{Number(lst.preco).toLocaleString()} kz</span>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(lst)} className="text-makini-earth hover:bg-makini-sand/50 h-8 px-2">
                                                        <Pencil className="w-4 h-4 mr-1" /> Editar
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteListing(lst.id)} className="text-red-500 hover:bg-red-50 hover:text-red-700 h-8 px-2">
                                                        Apagar
                                                    </Button>
                                                </div>
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

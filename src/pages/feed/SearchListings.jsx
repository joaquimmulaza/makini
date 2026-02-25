import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog.jsx';
import { MapPin, Calendar, Banknote, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function SearchListings() {
    const [searchParams] = useSearchParams();
    const initialCategory = searchParams.get('categoria') || 'All';

    const [filter, setFilter] = useState(initialCategory);
    const [isSearchingContext, setIsSearchingContext] = useState(false);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedListing, setSelectedListing] = useState(null);
    const [reservationDates, setReservationDates] = useState('');
    const [reservationContext, setReservationContext] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user, profile } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);

            let query = supabase.from('listings').select('*');

            // Standard UI filters map to category or type if they aren't 'All'
            if (filter !== 'All') {
                if (filter === 'Transporte') {
                    query = query.ilike('categoria', '%Transporte%');
                } else if (filter === 'Prestação de Serviços') {
                    query = query.eq('categoria', 'Prestação de Serviços');
                } else {
                    query = query.ilike('categoria', `%${filter}%`);
                }
            }

            const { data, error } = await query;

            if (!error && data) {
                setListings(data);
            } else {
                console.error("Error fetching listings:", error);
            }
            setLoading(false);
        };

        fetchListings();
    }, [filter]);

    // Simulated Gemini Call
    const simulateGeminiRecommendation = () => {
        setIsSearchingContext(true);
        setTimeout(() => {
            setFilter('Preparação'); // mock simulation
            setIsSearchingContext(false);
        }, 1500);
    };

    const handleReservationSubmit = async (e) => {
        e.preventDefault();

        if (!user || profile?.role !== 'agricultor') {
            alert('Apenas agricultores registados podem efetuar reservas.');
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('reservas')
                .insert([
                    {
                        agricultor_id: user.id,
                        fornecedor_id: selectedListing.fornecedor_id,
                        anuncio_id: selectedListing.id,
                        dias_solicitados: reservationDates,
                        contexto: reservationContext,
                        status: 'pendente'
                    }
                ]);

            if (error) throw error;

            alert(`Reserva solicitada com sucesso para: ${selectedListing?.titulo}\nFique atento ao seu e-mail para confirmação do fornecedor.`);
            setSelectedListing(null);
            setReservationDates('');
            setReservationContext('');
        } catch (err) {
            console.error("Reservation Error:", err);
            alert("Ocorreu um erro ao solicitar a reserva. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-makini-sand py-12 px-4">
            <div className="container mx-auto">

                {/* Header and Filters */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-makini-earth mb-4">
                            Encontrar Equipamentos e Serviços
                        </h1>
                        <div className="flex flex-wrap gap-2">
                            {['All', 'Preparação', 'Plantio', 'Colheita', 'Transporte', 'Prestação de Serviços'].map(f => (
                                <Button
                                    key={f}
                                    variant={filter === f ? 'default' : 'outline'}
                                    onClick={() => setFilter(f)}
                                    className="rounded-full"
                                >
                                    {f === 'All' ? 'Todos' : f}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={simulateGeminiRecommendation}
                        disabled={isSearchingContext}
                        className="bg-makini-earth hover:bg-makini-clay text-white max-w-xs whitespace-normal h-auto py-3 px-4 flex items-center gap-2"
                    >
                        <Sparkles className="w-5 h-5 text-makini-lightGreen" />
                        {isSearchingContext ? 'Mapeando contexto...' : 'Recomendação Inteligente'}
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-makini-green" />
                    </div>
                ) : (
                    <>
                        {/* Listings Grid */}
                        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {listings.map((eq) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                        key={eq.id}
                                    >
                                        <Card className="bg-white hover:border-makini-green transition-colors overflow-hidden flex flex-col group h-full">
                                            <div className="h-48 bg-makini-clay/20 flex items-center justify-center relative overflow-hidden">
                                                <motion.div
                                                    className="absolute inset-0 bg-makini-earth/10"
                                                    whileHover={{ scale: 1.1 }}
                                                    transition={{ duration: 0.4 }}
                                                />
                                                <span className="text-makini-clay/50 font-heading tracking-widest text-xl uppercase z-10 relative group-hover:scale-110 transition-transform duration-300">Sem Imagem</span>
                                                <Badge className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white border-0 z-10">
                                                    {eq.categoria}
                                                </Badge>
                                            </div>
                                            <CardContent className="p-6 flex flex-col flex-grow relative z-20 bg-white">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-heading font-bold text-lg text-makini-earth truncate pr-2 group-hover:text-makini-green transition-colors">{eq.titulo}</h3>
                                                    <Badge variant={eq.disponibilidade === 'imediata' ? 'success' : 'outline'} className="whitespace-nowrap">
                                                        {eq.disponibilidade}
                                                    </Badge>
                                                </div>

                                                <p className="text-sm font-medium text-makini-black mb-4">{eq.capacidade_especificacao}</p>

                                                <div className="space-y-2 mt-auto">
                                                    <div className="flex items-center text-sm text-makini-clay">
                                                        <MapPin className="w-4 h-4 mr-2" /> {eq.localizacao} • {eq.nome_empresa}
                                                    </div>
                                                    <div className="flex justify-between items-end mt-4 pt-4 border-t border-makini-sand relative">
                                                        <div className="flex items-center text-lg font-bold text-makini-green">
                                                            <Banknote className="w-5 h-5 mr-1" />
                                                            {Number(eq.preco).toLocaleString()} {eq.unidade_preco || 'kz'}
                                                        </div>
                                                        {user && profile?.role === 'agricultor' ? (
                                                            <Dialog open={selectedListing?.id === eq.id} onOpenChange={(open) => {
                                                                if (!open) setSelectedListing(null);
                                                            }}>
                                                                <DialogTrigger asChild>
                                                                    <Button size="sm" onClick={() => setSelectedListing(eq)}>Reservar</Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="sm:max-w-[425px]">
                                                                    <DialogHeader>
                                                                        <DialogTitle>Solicitar Reserva</DialogTitle>
                                                                        <DialogDescription>
                                                                            Preencha os detalhes para agendar o uso deste recurso com {eq.nome_empresa}.
                                                                        </DialogDescription>
                                                                    </DialogHeader>
                                                                    <form onSubmit={handleReservationSubmit} className="grid gap-4 py-4">
                                                                        <div className="flex flex-col gap-2 p-3 bg-makini-sand rounded-md mb-2">
                                                                            <span className="font-bold text-makini-earth">{eq.titulo}</span>
                                                                            <span className="text-sm text-makini-clay flex items-center gap-1"><MapPin className="w-3 h-3" /> {eq.localizacao}</span>
                                                                            <span className="text-sm text-makini-green font-semibold">{Number(eq.preco).toLocaleString()} {eq.unidade_preco || 'kz'}</span>
                                                                        </div>
                                                                        <div className="grid gap-2">
                                                                            <label htmlFor="dates" className="text-sm font-medium text-makini-earth">
                                                                                Período de Uso (Ex: 10 a 12 de Maio)
                                                                            </label>
                                                                            <input
                                                                                id="dates"
                                                                                required
                                                                                value={reservationDates}
                                                                                onChange={(e) => setReservationDates(e.target.value)}
                                                                                className="w-full p-2 border border-makini-clay/30 rounded-md focus:outline-none focus:border-makini-green"
                                                                                placeholder="Insira as datas desejadas..."
                                                                            />
                                                                        </div>
                                                                        <div className="grid gap-2">
                                                                            <label htmlFor="context" className="text-sm font-medium text-makini-earth">
                                                                                Finalidade do Uso (Opcional)
                                                                            </label>
                                                                            <textarea
                                                                                id="context"
                                                                                rows={3}
                                                                                value={reservationContext}
                                                                                onChange={(e) => setReservationContext(e.target.value)}
                                                                                className="w-full p-2 border border-makini-clay/30 rounded-md focus:outline-none focus:border-makini-green text-sm"
                                                                                placeholder="Ex: Preciso de preparar 3 hectares de terra dura..."
                                                                            />
                                                                        </div>
                                                                        <DialogFooter>
                                                                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                                                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirmar Pedido de Reserva'}
                                                                            </Button>
                                                                        </DialogFooter>
                                                                    </form>
                                                                </DialogContent>
                                                            </Dialog>
                                                        ) : user ? (
                                                            <Button size="sm" variant="outline" disabled title="Apenas agricultores podem reservar">Reservar</Button>
                                                        ) : (
                                                            <Button size="sm" onClick={() => navigate('/login')}>Reservar</Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {listings.length === 0 && (
                            <div className="text-center py-20">
                                <p className="text-makini-clay text-lg">Nenhum equipamento encontrado nesta categoria.</p>
                            </div>
                        )}
                    </>
                )}

            </div>
        </div>
    );
}

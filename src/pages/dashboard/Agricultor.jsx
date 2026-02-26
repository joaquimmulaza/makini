import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Calendar, Loader2, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function DashboardAgricultor() {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchReservas = async () => {
            if (!user) return;
            setLoading(true);

            // Fetch reservas where this user is the agricultor. 
            const { data, error } = await supabase
                .from('reservas')
                .select(`
                    id,
                    dias_solicitados,
                    contexto,
                    status,
                    created_at,
                    listings (titulo, nome_empresa)
                `)
                .eq('agricultor_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching reservas:', error);
            } else if (data) {
                setReservas(data);
            }
            setLoading(false);
        };

        fetchReservas();
    }, [user]);

    return (
        <div className="min-h-screen bg-makini-sand py-12 px-4">
            <div className="container mx-auto max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-heading font-bold text-makini-earth mb-2">Painel do Agricultor</h1>
                    <p className="text-makini-clay">Acompanhe o estado dos recursos que solicitou.</p>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-heading font-semibold text-makini-earth flex items-center gap-2">
                        <Clock className="w-5 h-5" /> Os Meus Pedidos
                    </h2>

                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="w-8 h-8 animate-spin text-makini-green" />
                        </div>
                    ) : reservas.length === 0 ? (
                        <Card className="bg-white border-makini-clay/20 border-dashed">
                            <CardContent className="p-10 text-center">
                                <p className="text-makini-clay text-lg">Ainda não solicitou nenhuma reserva de equipamento, transporte ou serviço.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        reservas.map(reserva => (
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
                                                <p><strong className="text-makini-black">Fornecedor:</strong> {reserva.listings?.nome_empresa || 'Empresa'}</p>
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
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

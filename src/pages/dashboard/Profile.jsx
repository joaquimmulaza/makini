import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import { Separator } from '../../components/ui/separator';
import { Mail, Phone, MapPin, User, Loader2, Edit3, Save, X, CalendarCheck, Package, Layers } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function Profile() {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState({ reservas: 0, listings: 0 });
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        nome: '',
        telefone: '',
        localizacao: '',
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                nome: profile.nome || '',
                telefone: profile.telefone || '',
                localizacao: profile.localizacao || '',
            });
            fetchStats();
        }
    }, [profile]);

    const fetchStats = async () => {
        if (!user || !profile) return;
        setLoading(true);

        try {
            if (profile.role === 'agricultor') {
                const { count } = await supabase
                    .from('reservas')
                    .select('*', { count: 'exact', head: true })
                    .eq('agricultor_id', user.id);
                setStats(prev => ({ ...prev, reservas: count || 0 }));
            } else if (profile.role === 'fornecedor') {
                const { count: listingsCount } = await supabase
                    .from('listings')
                    .select('*', { count: 'exact', head: true })
                    .eq('fornecedor_id', user.id);

                const { count: reservasCount } = await supabase
                    .from('reservas')
                    .select('listings!inner(fornecedor_id)', { count: 'exact', head: true })
                    .eq('listings.fornecedor_id', user.id);

                setStats({ listings: listingsCount || 0, reservas: reservasCount || 0 });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    nome: formData.nome,
                    telefone: formData.telefone,
                    localizacao: formData.localizacao
                })
                .eq('id', user.id);

            if (error) throw error;
            toast.success('Perfil atualizado com sucesso!');
            setIsEditing(false);
            // Reload window to update AuthContext profile (or better, context should provide a refresh method)
            window.location.reload();
        } catch (error) {
            toast.error('Erro ao atualizar perfil.');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    if (loading && !profile) {
        return (
            <div className="min-h-screen bg-makini-sand flex justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-makini-green" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-makini-sand py-12 px-4">
            <div className="container mx-auto max-w-4xl space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-makini-earth">Meu Perfil</h1>
                        <p className="text-makini-clay">Gerencie suas informações pessoais e visualize seu histórico.</p>
                    </div>
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} className="bg-makini-green hover:bg-makini-green/90 text-white gap-2 rounded-xl">
                            <Edit3 className="w-4 h-4" />
                            Editar Perfil
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl border-makini-clay/30">
                                <X className="w-4 h-4 mr-2" />
                                Cancelar
                            </Button>
                            <Button onClick={handleSave} disabled={saving} className="bg-makini-green hover:bg-makini-green/90 text-white rounded-xl">
                                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Salvar Alterações
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Left Column: Avatar & Basic Info */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
                            <div className="h-24 bg-gradient-to-br from-[#0d631b] to-[#2e7d32]"></div>
                            <CardContent className="pt-0 relative px-6 pb-6 text-center">
                                <Avatar className="w-24 h-24 border-4 border-white absolute -top-12 left-1/2 -translate-x-1/2 shadow-sm">
                                    <AvatarImage src="" alt={profile?.nome} />
                                    <AvatarFallback className="bg-makini-sand text-makini-earth font-heading text-xl">
                                        {getInitials(profile?.nome)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="mt-14 space-y-1">
                                    <h2 className="text-xl font-heading font-bold text-makini-black">
                                        {profile?.nome || 'Utilizador'}
                                    </h2>
                                    <div className="flex justify-center">
                                        <Badge variant="secondary" className="bg-makini-green/10 text-makini-green hover:bg-makini-green/20 uppercase tracking-wide text-xs">
                                            {profile?.role || 'Agricultor'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-makini-clay flex items-center justify-center gap-1 mt-2">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {profile?.localizacao || 'Angola'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stats Card */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-heading font-medium text-makini-clay uppercase tracking-wider">Estatísticas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-makini-sand text-makini-earth">
                                        <CalendarCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-makini-black">{stats.reservas}</p>
                                        <p className="text-xs text-makini-clay">
                                            {profile?.role === 'fornecedor' ? 'Reservas Recebidas' : 'Reservas Solicitadas'}
                                        </p>
                                    </div>
                                </div>
                                {profile?.role === 'fornecedor' && (
                                    <>
                                        <Separator className="bg-makini-sand" />
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-full bg-makini-sand text-makini-earth">
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-makini-black">{stats.listings}</p>
                                                <p className="text-xs text-makini-clay">Anúncios Ativos</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Details */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="border-none shadow-sm bg-white rounded-2xl h-full">
                            <CardHeader>
                                <CardTitle className="font-heading text-lg text-makini-earth">Informações de Contato</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                <div className="space-y-4">
                                    {/* Name Field */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-makini-clay flex items-center gap-2">
                                            <User className="w-4 h-4" /> Nome Completo
                                        </label>
                                        {isEditing ? (
                                            <Input
                                                value={formData.nome}
                                                onChange={e => setFormData({...formData, nome: e.target.value})}
                                                className="bg-makini-sand/50 border-makini-clay/20 focus-visible:ring-makini-green"
                                            />
                                        ) : (
                                            <p className="text-makini-black font-medium">{profile?.nome || '-'}</p>
                                        )}
                                    </div>

                                    <Separator className="bg-makini-sand" />

                                    {/* Email Field (Non-editable generally via UI in supabase without extra auth steps) */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-makini-clay flex items-center gap-2">
                                            <Mail className="w-4 h-4" /> Email
                                        </label>
                                        <p className="text-makini-black font-medium">{user?.email || '-'}</p>
                                        {isEditing && <p className="text-xs text-makini-clay italic">O email não pode ser alterado por aqui.</p>}
                                    </div>

                                    <Separator className="bg-makini-sand" />

                                    {/* Phone Field */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-makini-clay flex items-center gap-2">
                                            <Phone className="w-4 h-4" /> Número de Telefone
                                        </label>
                                        {isEditing ? (
                                            <Input
                                                value={formData.telefone}
                                                onChange={e => setFormData({...formData, telefone: e.target.value})}
                                                className="bg-makini-sand/50 border-makini-clay/20 focus-visible:ring-makini-green"
                                                placeholder="+244 900 000 000"
                                            />
                                        ) : (
                                            <p className="text-makini-black font-medium">{profile?.telefone || 'Não informado'}</p>
                                        )}
                                    </div>

                                    <Separator className="bg-makini-sand" />

                                    {/* Location Field */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-makini-clay flex items-center gap-2">
                                            <MapPin className="w-4 h-4" /> Província / Localização
                                        </label>
                                        {isEditing ? (
                                            <Input
                                                value={formData.localizacao}
                                                onChange={e => setFormData({...formData, localizacao: e.target.value})}
                                                className="bg-makini-sand/50 border-makini-clay/20 focus-visible:ring-makini-green"
                                                placeholder="Ex: Huambo"
                                            />
                                        ) : (
                                            <p className="text-makini-black font-medium">{profile?.localizacao || 'Não informado'}</p>
                                        )}
                                    </div>
                                </div>

                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}

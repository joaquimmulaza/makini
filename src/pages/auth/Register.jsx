import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tractor, Plane } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent } from '../../components/ui/card.jsx';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function Register() {
    const [role, setRole] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nif, setNif] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user, profile, loading: authLoading } = useAuth();

    useEffect(() => {
        // Don't redirect while auth state is loading (e.g., during signOut)
        if (authLoading) return;
        if (user && profile) {
            if (profile.role === 'fornecedor') {
                navigate('/dashboard');
            } else {
                navigate('/buscar');
            }
        }
    }, [user, profile, authLoading, navigate]);

    const handleSelectRole = (selectedRole) => {
        setRole(selectedRole);
        // Em um cenário real guardaríamos isso no state management ou avançaríamos para a form proper
    };

    if (!role) {
        return (
            <div className="min-h-screen pt-20 pb-12 flex flex-col items-center bg-makini-sand px-4">
                <div className="max-w-3xl w-full text-center mb-12">
                    <h1 className="text-4xl font-heading font-bold text-makini-earth mb-4">Como quer usar o Makini?</h1>
                    <p className="text-lg text-makini-clay">Selecione o seu perfil para personalizarmos a sua experiência na plataforma.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                    {/* Agricultor */}
                    <Card
                        className="cursor-pointer transition-all hover:border-makini-green hover:shadow-xl group bg-white"
                        onClick={() => handleSelectRole('agricultor')}
                    >
                        <CardContent className="p-8 flex flex-col items-center text-center h-full">
                            <div className="w-20 h-20 rounded-full bg-makini-lightGreen/20 flex items-center justify-center mb-6 text-makini-green group-hover:scale-110 transition-transform">
                                <SproutIcon className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-heading font-bold text-makini-earth mb-4">Sou Agricultor</h2>
                            <p className="text-makini-clay flex-grow">
                                Quero alugar equipamentos, tractores, ou contratar serviços para a minha produção.
                            </p>
                            <ul className="text-sm text-left text-makini-clay mt-6 space-y-2 w-full">
                                <li className="flex items-center gap-2">✓ Aluguer sob demanda</li>
                                <li className="flex items-center gap-2">✓ Contacto direto com fornecedores</li>
                                <li className="flex items-center gap-2">✓ Pesquisa por região</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Fornecedor */}
                    <Card
                        className="cursor-pointer transition-all hover:border-makini-earth hover:shadow-xl group bg-white"
                        onClick={() => handleSelectRole('fornecedor')}
                    >
                        <CardContent className="p-8 flex flex-col items-center text-center h-full">
                            <div className="w-20 h-20 rounded-full bg-makini-sand flex items-center justify-center mb-6 text-makini-earth group-hover:scale-110 transition-transform">
                                <Tractor className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-heading font-bold text-makini-earth mb-4">Sou Fornecedor</h2>
                            <p className="text-makini-clay flex-grow">
                                Quero anunciar os meus equipamentos, transportes e serviços agrícolas para aluguer.
                            </p>
                            <ul className="text-sm text-left text-makini-clay mt-6 space-y-2 w-full">
                                <li className="flex items-center gap-2">✓ Anúncios com fotos e preços</li>
                                <li className="flex items-center gap-2">✓ Rentabilize equipamentos parados</li>
                                <li className="flex items-center gap-2">✓ Dashboard de gestão</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <p className="mt-8 text-makini-clay">
                    Já tem conta? <Link to="/login" className="text-makini-green font-semibold hover:underline">Entre aqui</Link>
                </p>
            </div>
        );
    }

    // Registration Form

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!validateEmail(email)) {
            setError('Por favor, insira um email válido.');
            setLoading(false);
            return;
        }

        try {
            // 1. Sign up user e passar os metadados para o Trigger DB criar o perfil automaticamente
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        role: role,
                        nome_completo: name,
                        nif: role === 'fornecedor' ? nif : null,
                        documento_url: role === 'fornecedor' ? 'mock-document-url.pdf' : null,
                    }
                }
            });

            if (authError) throw authError;

            if (authData?.user) {
                toast.success('Registo concluído! Verifique o seu email e faça login.');
                navigate('/login');
            }
        } catch (err) {
            console.error('Registration Error:', err);
            setError(err.message || 'Ocorreu um erro durante o registo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-12 pb-12 flex flex-col items-center bg-makini-sand px-4">
            <Card className="w-full max-w-md bg-white">
                <CardContent className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-heading font-bold text-makini-earth">
                            Registo de {role === 'agricultor' ? 'Agricultor' : 'Fornecedor'}
                        </h2>
                        <p className="text-makini-clay text-sm mt-2">Preencha os dados abaixo para começar</p>
                    </div>

                    <form className="space-y-4" onSubmit={handleRegister}>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-makini-earth">Nome Completo</label>
                            <input
                                aria-label="Nome Completo"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2 border border-makini-clay/30 rounded-md focus:outline-none focus:border-makini-green focus:ring-1 focus:ring-makini-green"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-makini-earth">Email</label>
                            <input
                                aria-label="Email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border border-makini-clay/30 rounded-md focus:outline-none focus:border-makini-green focus:ring-1 focus:ring-makini-green"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-makini-earth">Palavra-passe</label>
                            <input
                                aria-label="Palavra-passe"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border border-makini-clay/30 rounded-md focus:outline-none focus:border-makini-green focus:ring-1 focus:ring-makini-green"
                            />
                        </div>

                        {role === 'fornecedor' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-makini-earth">NIF</label>
                                    <input
                                        type="text"
                                        required
                                        value={nif}
                                        onChange={(e) => setNif(e.target.value)}
                                        className="w-full p-2 border border-makini-clay/30 rounded-md focus:outline-none focus:border-makini-green focus:ring-1 focus:ring-makini-green"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-makini-earth">Documento de Verificação</label>
                                    <input type="file" required className="w-full p-2 border border-makini-clay/30 rounded-md focus:outline-none focus:border-makini-green text-sm" />
                                    <p className="text-xs text-makini-clay">Envie foto do B.I ou certidão comercial</p>
                                </div>
                            </>
                        )}

                        <Button type="submit" disabled={loading} className="w-full mt-6 bg-makini-green hover:bg-makini-green/90">
                            {loading ? 'A processar...' : 'Criar Conta e Confirmar'}
                        </Button>

                        <button
                            type="button"
                            onClick={() => setRole(null)}
                            className="w-full mt-4 text-sm text-makini-clay hover:text-makini-earth"
                        >
                            ← Voltar para seleção de perfil
                        </button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

function SproutIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M7 20h10" />
            <path d="M10 20c5.5-2.5.8-6.4 3-10" />
            <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
            <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
        </svg>
    );
}

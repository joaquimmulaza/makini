import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent } from '../../components/ui/card.jsx';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            setError(signInError.message);
            setLoading(false);
        } else {
            // Se logado com sucesso, redirecionar consoante o perfil.
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profile?.role === 'fornecedor') {
                navigate('/dashboard');
            } else {
                navigate('/buscar');
            }
        }
    };

    return (
        <div className="min-h-screen pt-12 pb-12 flex flex-col items-center justify-center bg-makini-sand px-4">
            <Card className="w-full max-w-md bg-white">
                <CardContent className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-heading font-bold text-makini-earth">Bem-vindo de volta!</h2>
                        <p className="text-makini-clay text-sm mt-2">Aceda à sua conta Makini</p>
                    </div>

                    <form className="space-y-4" onSubmit={handleLogin}>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                                {error === 'Invalid login credentials' ? 'Email ou Senha inválidos.' : error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-makini-earth">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border border-makini-clay/30 rounded-md focus:outline-none focus:border-makini-green focus:ring-1 focus:ring-makini-green"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium text-makini-earth">Palavra-passe</label>
                                <Link to="#" className="text-xs text-makini-green hover:underline">Esqueceu?</Link>
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border border-makini-clay/30 rounded-md focus:outline-none focus:border-makini-green focus:ring-1 focus:ring-makini-green"
                            />
                        </div>

                        <Button type="submit" disabled={loading} className="w-full mt-6 bg-makini-green hover:bg-makini-green/90">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Entrar'}
                        </Button>

                        <p className="mt-6 text-center text-sm text-makini-clay">
                            Ainda não tem conta? <Link to="/register" className="text-makini-green font-semibold hover:underline">Registe-se</Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

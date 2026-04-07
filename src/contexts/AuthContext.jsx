import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { fetchProfileByUserId } from '../lib/profileDomain.ts';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId) => {
        try {
            const nextProfile = await fetchProfileByUserId(userId);
            setProfile(nextProfile || null);
            return nextProfile || null;
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            setProfile(null);
            return null;
        }
    };

    useEffect(() => {
        // Obter sessao atual
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
            if (session?.user) {
                await fetchProfile(session.user.id);
            }
            setLoading(false);
        };

        getSession();

        // Escutar mudancas de autenticacao
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user || null);
            if (session?.user) {
                await fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const refreshProfile = async (nextProfile) => {
        if (nextProfile) {
            setProfile(nextProfile);
            return nextProfile;
        }

        if (!user?.id) return null;
        return fetchProfile(user.id);
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Erro ao terminar sessao:', error);
        }
        setUser(null);
        setProfile(null);
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

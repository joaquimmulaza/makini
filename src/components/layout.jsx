import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Tractor, Menu, LogOut, LayoutDashboard, X } from 'lucide-react'
import { Button } from './ui/button.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

export function Header() {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const handleScrollLinkClick = (e, id, isMobile = false) => {
        if (isMobile) closeMobileMenu();
        if (window.location.pathname === '/') {
            e.preventDefault();
            const element = document.getElementById(id);
            if (element) {
                const y = element.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-makini-clay/20 bg-makini-earth text-white shadow-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
                    <img src="/Union.png" alt="Makini Logo" className="h-8 w-auto" />
                </Link>

                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                   
                </nav>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2">
                        {user ? (
                            <div className="flex items-center gap-8">
                                 <Link to="/buscar" className="transition-colors hover:text-makini-lightGreen">Mercado</Link>
                    <Link to="/#categorias" onClick={(e) => handleScrollLinkClick(e, 'categorias')} className="transition-colors hover:text-makini-lightGreen">Categorias</Link>
                    <Link to="/#como-funciona" onClick={(e) => handleScrollLinkClick(e, 'como-funciona')} className="transition-colors hover:text-makini-lightGreen">Como Funciona</Link>
                                <span className="text-sm font-medium text-makini-sand hidden lg:block">
                                    Olá, {profile?.nome_completo || user.email}
                                </span>
                                {profile?.role === 'fornecedor' && (
                                    <Button variant="ghost" asChild className="text-makini-lightGreen hover:bg-makini-clay hover:text-white">
                                        <Link to="/dashboard" className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Painel</Link>
                                    </Button>
                                )}
                                {profile?.role === 'agricultor' && (
                                    <Button variant="ghost" asChild className="text-makini-lightGreen hover:bg-makini-clay hover:text-white">
                                        <Link to="/minhas-reservas" className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Minhas Reservas</Link>
                                    </Button>
                                )}
                                <Button variant="ghost" onClick={handleLogout} className="text-red-300 hover:bg-red-900/50 hover:text-red-100 flex items-center gap-2">
                                    <LogOut className="w-4 h-4" /> Sair
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Button variant="ghost" asChild className="text-white hover:bg-makini-clay hover:text-white">
                                    <Link to="/login">Entrar</Link>
                                </Button>
                                <Button variant="default" asChild>
                                    <Link to="/register">Registar</Link>
                                </Button>
                            </>
                        )}
                    </div>
                    <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-makini-clay" onClick={toggleMobileMenu}>
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-makini-clay/20 bg-makini-earth px-4 py-4 space-y-4 shadow-lg absolute w-full left-0">
                    <nav className="flex flex-col gap-4 text-sm font-medium">
                        <Link to="/buscar" className="transition-colors hover:text-makini-lightGreen" onClick={closeMobileMenu}>Mercado</Link>
                        <Link to="/#categorias" onClick={(e) => handleScrollLinkClick(e, 'categorias', true)} className="transition-colors hover:text-makini-lightGreen">Categorias</Link>
                        <Link to="/#como-funciona" onClick={(e) => handleScrollLinkClick(e, 'como-funciona', true)} className="transition-colors hover:text-makini-lightGreen">Como Funciona</Link>
                    </nav>

                    <div className="flex flex-col gap-2 pt-4 border-t border-makini-clay/20">
                        {user ? (
                            <>
                                <span className="text-sm font-medium text-makini-sand mb-2 px-2">
                                    Olá, {profile?.nome_completo || user.email}
                                </span>
                                {profile?.role === 'fornecedor' && (
                                    <Button variant="ghost" asChild className="justify-start px-2 text-makini-lightGreen hover:bg-makini-clay hover:text-white" onClick={closeMobileMenu}>
                                        <Link to="/dashboard" className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Painel</Link>
                                    </Button>
                                )}
                                {profile?.role === 'agricultor' && (
                                    <Button variant="ghost" asChild className="justify-start px-2 text-makini-lightGreen hover:bg-makini-clay hover:text-white" onClick={closeMobileMenu}>
                                        <Link to="/minhas-reservas" className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Minhas Reservas</Link>
                                    </Button>
                                )}
                                <Button variant="ghost" onClick={() => { handleLogout(); closeMobileMenu(); }} className="justify-start px-2 text-red-300 hover:bg-red-900/50 hover:text-red-100 flex items-center gap-2">
                                    <LogOut className="w-4 h-4" /> Sair
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" asChild className="justify-start px-2 text-white hover:bg-makini-clay hover:text-white" onClick={closeMobileMenu}>
                                    <Link to="/login">Entrar</Link>
                                </Button>
                                <Button variant="default" asChild className="justify-start px-2 mt-2" onClick={closeMobileMenu}>
                                    <Link to="/register" className="w-full text-center">Registar</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}

export function Footer() {
    return (
        <footer className="bg-makini-earth py-12 text-white">
            <div className="container mx-auto grid grid-cols-1 gap-8 px-4 md:grid-cols-4">
                <div className="flex flex-col gap-2">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/Union.png" alt="Makini Logo" className="h-8 w-auto" />
                    </Link>
                    <p className="text-sm text-makini-sand/80 mt-2">
                        Conectando agricultores angolanos a equipamentos e serviços de alta qualidade.
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    <h4 className="font-heading font-semibold text-makini-lightGreen">Categorias</h4>
                    <Link to={`/buscar?categoria=${encodeURIComponent('Preparação do Solo')}`} className="text-sm text-makini-sand/80 hover:text-white">Preparação do Solo</Link>
                    <Link to={`/buscar?categoria=${encodeURIComponent('Plantio e Sementeira')}`} className="text-sm text-makini-sand/80 hover:text-white">Plantio e Sementeira</Link>
                    <Link to={`/buscar?categoria=${encodeURIComponent('Aplicação de Insumos')}`} className="text-sm text-makini-sand/80 hover:text-white">Aplicação de Insumos</Link>
                    <Link to={`/buscar?categoria=${encodeURIComponent('Colheita')}`} className="text-sm text-makini-sand/80 hover:text-white">Colheita</Link>
                </div>

                <div className="flex flex-col gap-2">
                    <h4 className="font-heading font-semibold text-makini-lightGreen">Empresa</h4>
                    <Link to="/sobre" className="text-sm text-makini-sand/80 hover:text-white">Sobre Nós</Link>
                    <Link to="/como-funciona" className="text-sm text-makini-sand/80 hover:text-white">Como Funciona</Link>
                    <Link to="/contato" className="text-sm text-makini-sand/80 hover:text-white">Contacto</Link>
                </div>

                <div className="flex flex-col gap-2">
                    <h4 className="font-heading font-semibold text-makini-lightGreen">Legal</h4>
                    <Link to="/termos" className="text-sm text-makini-sand/80 hover:text-white">Termos de Serviço</Link>
                    <Link to="/privacidade" className="text-sm text-makini-sand/80 hover:text-white">Política de Privacidade</Link>
                </div>
            </div>
            <div className="mt-12 border-t border-makini-clay/50 pt-8 text-center text-sm text-makini-sand/60">
                &copy; {new Date().getFullYear()} Makini. Todos os direitos reservados.
            </div>
        </footer>
    )
}

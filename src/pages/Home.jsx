import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { Tractor, Plane, Sprout, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button.jsx';
import { Card, CardContent } from '../components/ui/card.jsx';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

import heroFarmer from '../assets/hero_farmer.png';
import heroSupplier from '../assets/hero_supplier.png';

const categories = [
    { id: 'preparacao', name: 'Preparação do Solo', icon: Tractor, count: 45 },
    { id: 'plantio', name: 'Plantio e Sementeira', icon: Sprout, count: 32 },
    { id: 'insumos', name: 'Aplicação de Insumos', icon: Plane, count: 18 },
    { id: 'colheita', name: 'Colheita', icon: Tractor, count: 24 }
];

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">

            {/* Hero Section */}
            <section className="relative h-[600px] w-full bg-makini-earth overflow-hidden">
                <Swiper
                    modules={[Autoplay, Pagination, EffectFade]}
                    effect="fade"
                    autoplay={{ delay: 6000, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    loop
                    className="h-full w-full"
                >
                    {/* Farmer Slide */}
                    <SwiperSlide>
                        <div className="relative h-full w-full">
                            <div className="absolute inset-0 bg-black/40 z-10" />
                            <img
                                src={heroFarmer}
                                alt="Agricultor Angolano"
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-4">
                                <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 max-w-4xl drop-shadow-lg">
                                    Encontre o equipamento certo para a sua terra.
                                </h1>
                                <p className="text-xl text-makini-sand mb-8 max-w-2xl drop-shadow">
                                    Localize, agende e contrate recursos agrícolas de forma simples e eficiente em toda Angola.
                                </p>
                                <div className="flex gap-4">
                                    <Button size="lg" className="bg-makini-green hover:bg-makini-green/90 text-white font-semibold text-lg" asChild>
                                        <Link to="/buscar">Procurar Equipamentos</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>

                    {/* Supplier Slide */}
                    <SwiperSlide>
                        <div className="relative h-full w-full">
                            <div className="absolute inset-0 bg-black/40 z-10" />
                            <img
                                src={heroSupplier}
                                alt="Fornecedor Agrícola"
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-4">
                                <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 max-w-4xl drop-shadow-lg">
                                    Rentabilize o seu equipamento quando não o usa.
                                </h1>
                                <p className="text-xl text-makini-sand mb-8 max-w-2xl drop-shadow">
                                    Conecte-se com agricultores que precisam dos seus tratores, camiões ou serviços agrícolas.
                                </p>
                                <div className="flex gap-4">
                                    <Button size="lg" className="bg-makini-earth border border-makini-sand hover:bg-makini-clay text-white font-semibold text-lg" asChild>
                                        <Link to="/register">Anunciar Agora</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                </Swiper>
            </section>

            {/* Categories Section */}
            <section className="py-20 bg-makini-sand">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-heading font-bold text-makini-earth mb-4">Explore por Categoria</h2>
                        <p className="text-makini-clay max-w-2xl mx-auto">Encontre exatamente o que a sua fazenda precisa, desde a preparação do solo até ao transporte da colheita.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((cat) => (
                            <Link to={`/categoria/${cat.id}`} key={cat.id} className="group">
                                <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:border-makini-green hover:shadow-lg bg-white">
                                    <CardContent className="flex flex-col items-center p-8 text-center">
                                        <div className="p-4 rounded-full bg-makini-lightGreen/30 text-makini-green mb-6 group-hover:scale-110 transition-transform">
                                            <cat.icon className="h-8 w-8" />
                                        </div>
                                        <h3 className="font-heading font-semibold text-xl mb-2 text-makini-earth">{cat.name}</h3>
                                        <p className="text-sm text-makini-clay">{cat.count} anúncios</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Como Funciona */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-heading font-bold text-makini-earth mb-4">Como Funciona</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div>
                            <div className="w-16 h-16 rounded-full bg-makini-earth text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
                            <h4 className="font-heading font-semibold text-xl mb-3 text-makini-black">Registe-se</h4>
                            <p className="text-makini-clay">Crie conta como Agricultor para alugar, ou como Fornecedor para anunciar os seus equipamentos.</p>
                        </div>
                        <div>
                            <div className="w-16 h-16 rounded-full bg-makini-green text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
                            <h4 className="font-heading font-semibold text-xl mb-3 text-makini-black">Encontre ou Publique</h4>
                            <p className="text-makini-clay">Busque os equipamentos no nosso catálogo ou publique fotos, preços e disponibilidade do seu património.</p>
                        </div>
                        <div>
                            <div className="w-16 h-16 rounded-full bg-makini-clay text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
                            <h4 className="font-heading font-semibold text-xl mb-3 text-makini-black">Alugue e Produza</h4>
                            <p className="text-makini-clay">Entre em contacto, feche negócio e melhore a produtividade da terra de forma organizada.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-20 bg-makini-green">
                <div className="container mx-auto px-4 text-center text-white">
                    <h2 className="text-3xl font-heading font-bold mb-6">Pronto para transformar a agricultura em Angola?</h2>
                    <p className="text-lg text-makini-lightGreen mb-8 max-w-2xl mx-auto">
                        Junte-se a centenas de fazendeiros e prestadores de serviços que já confiam na Makini.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button size="lg" variant="secondary" className="bg-white text-makini-green hover:bg-makini-sand font-bold text-lg" asChild>
                            <Link to="/register">Criar Conta Gratuita</Link>
                        </Button>
                    </div>
                </div>
            </section>

        </div>
    )
}

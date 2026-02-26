import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AgentCTA({ cta, onClose }) {
    const navigate = useNavigate();

    if (!cta) return null;

    const { type, data } = cta;

    const handleNavigate = (path) => {
        navigate(path);
        if (onClose) onClose();
    };

    switch (type) {
        case 'VIEW_RESULTS': {
            // Data usually has parameters
            const params = new URLSearchParams();
            if (data.parameters) {
                if (data.parameters.category) params.set('categoria', data.parameters.category);
                if (data.parameters.location) params.set('localizacao', data.parameters.location);
                if (data.parameters.date) params.set('data', data.parameters.date);
            }

            const path = data.destination === 'bookings' ? '/minhas-reservas' : '/buscar';

            return (
                <div className="mx-4 mb-4 bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden animate-fade-in-up">
                    <div className="bg-[#D1FAE5] px-4 py-3 border-b border-emerald-100 flex items-center">
                        <span className="text-xl mr-2">✅</span>
                        <span className="font-semibold text-[#1B4332]">Opções encontradas prontas a ver</span>
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                        <button
                            onClick={() => handleNavigate(params.toString() ? `${path}?${params.toString()}` : path)}
                            className="w-full bg-[#1B4332] text-white py-2.5 rounded-lg active:scale-[0.98] transition-transform font-medium"
                        >
                            Ver Opções Disponíveis →
                        </button>
                    </div>
                </div>
            );
        }

        case 'BOOKING_PROPOSAL': {
            const { provider_id, start_date, duration_days } = data.bookingData;
            return (
                <div className="mx-4 mb-4 bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden animate-fade-in-up">
                    <div className="bg-[#FEF3C7] px-4 py-3 border-b border-amber-100 flex items-center">
                        <span className="text-xl mr-2">📋</span>
                        <span className="font-semibold text-amber-900">Proposta de Reserva</span>
                    </div>
                    <div className="p-4 text-sm text-gray-700 mb-2">
                        <p><strong>Detalhes:</strong> Estamos prontos para avançar com a reserva a partir de {start_date} por {duration_days} dias.</p>
                    </div>
                    <div className="px-4 pb-4 flex flex-col gap-2">
                        <button
                            onClick={() => handleNavigate(`/fornecedor/${provider_id}?date=${start_date}&duration=${duration_days}`)}
                            className="w-full bg-[#D4A017] text-white py-2.5 rounded-lg hover:bg-[#b88a14] active:scale-[0.98] transition-all font-medium"
                        >
                            Confirmar Reserva →
                        </button>
                    </div>
                </div>
            );
        }

        case 'NO_RESULTS': {
            return (
                <div className="mx-4 mb-4 bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden animate-fade-in-up">
                    <div className="bg-orange-50 px-4 py-3 border-b border-orange-100 flex items-center">
                        <span className="text-xl mr-2">⚠️</span>
                        <span className="font-semibold text-orange-800">Sem resultados exatos</span>
                    </div>
                    <div className="p-3 text-sm text-gray-600">
                        Mas encontrei alternativas próximas:
                    </div>
                    <div className="px-4 pb-4 flex flex-col gap-2">
                        <button
                            onClick={() => handleNavigate('/buscar')}
                            className="w-full border border-[#1B4332] text-[#1B4332] py-2.5 rounded-lg hover:bg-emerald-50 active:scale-[0.98] transition-all font-medium"
                        >
                            Explorar Todas as Categorias
                        </button>
                    </div>
                </div>
            );
        }

        case 'RATE_LIMITED': {
            return (
                <div className="mx-4 mb-4 bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden animate-fade-in-up">
                    <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center">
                        <span className="text-xl mr-2">⏳</span>
                        <span className="font-semibold text-blue-800">Assistente temporariamente ocupado</span>
                    </div>
                    <div className="px-4 pb-4 pt-3 flex flex-col gap-2">
                        <button
                            onClick={() => handleNavigate('/buscar')}
                            className="w-full bg-[#1B4332] text-white py-2.5 rounded-lg active:scale-[0.98] transition-transform font-medium"
                        >
                            Pesquisar directamente →
                        </button>
                    </div>
                </div>
            );
        }

        default:
            return null;
    }
}

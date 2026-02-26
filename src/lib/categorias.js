// Fonte única de verdade para as categorias da plataforma Makini
// Estes valores correspondem exactamente à coluna `categoria` da tabela `listings`

import { Tractor, Sprout, FlaskConical, Wheat } from 'lucide-react';

export const CATEGORIAS = [
    { id: 'preparacao', nome: 'Preparação do Solo', icon: Tractor },
    { id: 'plantio', nome: 'Plantio e Sementeira', icon: Sprout },
    { id: 'insumos', nome: 'Aplicação de Insumos', icon: FlaskConical },
    { id: 'colheita', nome: 'Colheita', icon: Wheat },
];

// Lista simples de nomes (para use em selects, filtros, etc.)
export const CATEGORIAS_NOMES = CATEGORIAS.map(c => c.nome);

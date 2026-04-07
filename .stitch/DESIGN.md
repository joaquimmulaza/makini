# Design System: Makini Profile Refresh
**Project ID:** 11347942868671485814

## 1. Visual Theme & Atmosphere
Makini deve comunicar confianca operacional com calor humano. A interface segue um tom editorial agricola: espacamento generoso, hierarquia forte e composicao assimetrica em desktop, sem cair no visual SaaS generico.

Direcao criativa: **Organic Precision**.

## 2. Color Palette & Roles
- Verdant Green (`#0d631b`): acoes primarias, estados de foco, confirmacao.
- Deep Green (`#00490e`): gradientes de destaque e CTA principal.
- Warm Paper (`#fcf9f1`): fundo base da pagina.
- Soft Surface (`#f7f3eb`): secoes e agrupamentos secundarios.
- Clean Surface (`#ffffff`): cartoes principais e formularios.
- Earth Brown (`#75584d`): suporte visual e contraste sem agressividade.
- Ink Neutral (`#1c1c17`): texto principal.
- Muted Neutral (`#40493d`): texto secundario e metadata.

## 3. Typography Rules
- Headings: **Manrope** (peso medio/forte, escala alta, tracking contido).
- Body and labels: **Inter** (alta legibilidade, principalmente em formularios e metrica).
- Preferir sentence case em labels e copy funcional.
- Usar uppercase apenas em chips curtos (ex.: `AGRICULTOR`, `FORNECEDOR`).

## 4. Component Stylings
- Buttons:
  - Primario: verde Makini, alto contraste, foco visivel.
  - Secundario: tonal (sem peso visual de borda dura).
- Cards/Containers:
  - Definir camadas por tonalidade e sombra ambiente suave.
  - Evitar divisores de linha como estrutura principal.
- Inputs/Forms:
  - Labels sempre visiveis.
  - Email somente leitura com tratamento visual explicito.
  - Estado de foco sempre ancorado no verde primario.

## 5. Layout Principles
- Desktop: grade assimetrica `rail + workspace` (identidade/metrica + detalhes/edit).
- Mobile: fluxo unico, com acoes de edicao visiveis no topo.
- Ritmo de espacamento claro entre blocos para leitura rapida.
- Priorizar variação de superficie e whitespace no lugar de bordas 1px.

## 6. Profile Experience Rules
- Deve funcionar para dois papeis:
  - `agricultor`: enfase em reservas e progresso de uso.
  - `fornecedor`: enfase em reservas recebidas e anuncios ativos.
- Modo visualizacao e modo edicao precisam ter diferenca clara sem quebrar layout.
- Controles touch-friendly (alvos de clique confortaveis).
- Sem dark-mode bias para esta tela.

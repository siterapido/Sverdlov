# Plano Mestre de Design & UX - Sverdlov (Notion Style)

Este plano detalha a transformação completa da interface do sistema Sverdlov para um design minimalista, focado em conteúdo (estilo Notion), com prioridade total para a experiência mobile (Mobile First) e fluxos de trabalho eficientes.

## 1. Princípios de Design (Notion Style)

### A. Estética "Branco no Branco"
- **Backgrounds:** Uso extensivo de espaço em branco (`#FFFFFF`).
- **Camadas:** Diferenciação sutil entre camadas usando bordas finas (`border-gray-200`) em vez de sombras pesadas ou cores de fundo distintas.
- **Tipografia:** Fonte `Inter`, preto quase puro (`#37352F`) para texto principal, cinza médio para secundário.
- **Sem Gradientes:** Cores sólidas e suaves para badgets e botões.

### B. Mobile First & Responsividade
- **Navegação:** Sidebar colapsável (já implementada) que vira um menu hambúrguer no mobile.
- **Touch Targets:** Botões e inputs com altura mínima de 44px em mobile.
- **Grids Fluidos:** Layouts que fluem de 1 coluna (mobile) para 3+ colunas (desktop) sem quebrar.
- **Ações Contextuais:** Menus de ações (três pontos) para economizar espaço de tela.

### C. UX Focada em Fluxo
- **Redução de Cliques:** Ações principais sempre visíveis.
- **Feedback Imediato:** Toasts e loaders sutis para toda ação assíncrona.
- **Estados Vazios:** Telas vazias com ilustrações minimalistas e botão de ação clara ("Criar novo...").

---

## 2. Estrutura de Telas e Melhorias

### 1. Dashboard (Visão Geral)
- **Objetivo:** Resumo rápido da saúde da organização.
- **Layout:** Grid de KPIs (StatCards) seguido por listas de "Ações Rápidas" e "Atividade Recente".
- **Melhorias Mobile:** KPIs em carrossel horizontal ou grid 2x2.

### 2. Membros (CRM)
- **Listagem:** Tabela responsiva. No mobile, transforma-se em cards individuais com avatar e info principal.
- **Filtros:** Barra de filtros expansível (como implementado em Escalas).
- **Detalhes:** Modal ou Drawer lateral para edição rápida sem sair da lista.
- **Feature Chave:** **Importação de Planilhas** (Detalhada abaixo).

### 3. Escalas (Gestão de Turnos)
- **Visual:** Cards limpos com "strip" de cor fina para categorias.
- **Interação:** Drag & drop para organizar turnos (futuro).
- **Mobile:** Visualização de lista compacta, com botão flutuante (FAB) para "Nova Escala".

### 4. Financeiro
- **Resumo:** Saldo atual grande e limpo.
- **Transações:** Lista timeline (dia a dia).
- **Entrada Rápida:** Botão de fácil acesso para registrar doação/gasto.

### 5. Calendário
- **Visual:** Calendário mensal limpo.
- **Mobile:** Alternar para vista de "Agenda" (lista de próximos eventos) em telas pequenas.

### 6. Chat (Comunicação)
- **Interface:** Estilo WhatsApp Web/Telegram mas mais limpo.
- **Cores:** Balões de mensagem com cores neutras (cinza claro para recebidas, azul notion suave para enviadas).

---

## 3. Feature em Foco: Importação de Planilhas

A importação de dados é crítica para a migração de novos núcleos.

### Fluxo de UX Proposto:
1.  **Upload:** Área de dropzone grande e amigável. Suporte a `.xlsx`, `.csv`.
2.  **Pré-visualização:** Mostrar as primeiras 5 linhas da planilha importada.
3.  **Mapeamento Inteligente (Smart Mapping):**
    *   O sistema tenta adivinhar colunas (ex: "Nome" -> `full_name`, "Zap" -> `phone`).
    *   Interface visual de "De -> Para" com dropdowns simples.
4.  **Validação:** Feedback em tempo real sobre linhas com erro (ex: CPF inválido).
5.  **Confirmação:** Resumo ("Importando 150 membros...").

---

## 4. Plano de Implementação

### Fase 1: Fundação (Concluída ✅)
- [x] Design Tokens (Globals.css)
- [x] Componentes Base (Button, Card, Input, Badge)
- [x] Sidebar e Header Responsivos

### Fase 2: Telas Core (Em Progresso 🚧)
- [x] Escalas (Refatoração completa para White Design)
- [ ] Membros (Aplicar novo design de tabela e filtros)
- [ ] Dashboard (Ajustes finais de mobile)

### Fase 3: Importação Avançada (Próximo Passo)
- [ ] Criar componente `SmartDataMapper`
- [ ] Melhorar feedback visual de erros na importação
- [ ] Otimizar performance para arquivos grandes

### Fase 4: Telas Secundárias
- [ ] Financeiro (Redesign completo)
- [ ] Calendário (Ajuste de cores)
- [ ] Chat (Polish visual)

---

## 5. Próximos Passos Imediatos

1.  **Executar o Build Final** para garantir que a refatoração de Escalas está estável.
2.  **Aplicar o Design Branco na tela de Membros**, que é a mais densa em dados.
3.  **Implementar a UX de Importação** melhorada na tela de Membros.

Este plano garante uma evolução consistente do produto, mantendo a qualidade visual e a usabilidade em foco.

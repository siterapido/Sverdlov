---
title: "Plano de Refatoração UI/UX"
status: "Planned"
design_system: "Modern Minimalist v2.0"
---

# Plano de Refatoração UI/UX: Modern Minimalist

## Visão Geral
Refatoração completa da interface para adotar um estilo "Pure White" / "Deep Dark", eliminando degradês, focando em funcionalidade, contraste e experiência mobile-first.

## Fases do Projeto

### Fase 1: Fundação & Design System (Imediato)
- [x] **Configuração Tailwind:**
    - Atualizar paleta de cores em `globals.css` (CSS Variables).
    - Definir novas variáveis semânticas (`--bg-page`, `--bg-surface`, `--fg-primary`, etc.).
    - Remover estilos legados "Notion-like" (beges, sobras difusas).
- [x] **Reset Global:**
    - Garantir que `body` tenha background puro e texto de alto contraste.
    - Configurar fontes (Inter/Geist) como padrão.

### Fase 2: Componentes Nucleares (Core UI)
Refatorar componentes básicos em `src/components/ui/` para o novo visual.
- [x] **Botões (`Button`):** Remover variantes Notion. Criar variantes "Solid Black" (Light mode) e "Solid White" (Dark mode). Estilo flat.
- [x] **Inputs & Forms:** Bordas nítidas, sem sombras internas, foco de alto contraste.
- [x] **Cards & Surfaces:** Container simples, suporte a modos "Bordered" ou "Flat Surface".
- [x] **Tipografia:** Utilitários de texto padronizados (H1-H6, P, Small).
- [x] **Outros:** Skeleton, Progress, Badge, Avatar, Tabs, Modal, Toast.

### Fase 3: Layouts Estruturais
- [x] **Componente `Layout` Principal:**
    - Refatorar Sidebar/Navigation.
    - **Mobile:** Implementar Bottom Nav ou Menu Overlay Fullscreen moderno clean.
    - **Desktop:** Sidebar clean, unicolor (sem separação visual excessiva do main content).
- [x] **Header/Topbar:** Simplificar. Apenas título ou breadcrumbs e ações principais. Transparência com blur ou solid color (sem degradê).

### Fase 4: Telas Chave (Página por Página)
Prioridade de migração:
1.  [x] **Dashboard:** Visão geral.
2.  [x] **Membros (Members):** Listagem e Edição.
3.  [ ] **Escalas (Schedules):** Calendários e Grids.
4.  [x] **Login/Auth:** Tela de entrada minimalista impactante (Logo + Form centralizado branco no branco).

## Detalhamento Técnico das Mudanças

### 1. Atualização do `globals.css`
Substituir todas as variáveis `--color-gray-*` estilo Notion por uma escala neutra fria (Slate/Zinc ou Neutral puros).
Remover classes utilitárias `.notion-*`.

### 2. Estratégia de Cores
```css
:root {
  --background: 0 0% 100%; /* #FFFFFF */
  --foreground: 240 10% 3.9%; /* #09090B */
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%; /* #18181B (Almost Black) */
  --primary-foreground: 0 0% 98%;
  /* ... */
}

.dark {
  --background: 240 10% 3.9%; /* #09090B (Deep Dark) */
  --foreground: 0 0% 98%;
  --primary: 0 0% 98%; /* White */
  --primary-foreground: 240 5.9% 10%;
}
```

## Próximos Passos
1.  Aprovar este plano.
2.  Executar Fase 1 (CSS Reset & Variables).
3.  Começar refatoração de componentes (Fase 2).

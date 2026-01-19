---
status: in_progress
generated: 2026-01-19
agents:
  - type: "frontend-specialist"
    role: "Liderar a definição estética e implementação dos componentes UI"
  - type: "architect-specialist"
    role: "Garantir a consistência do Design System no Tailwind e estrutura de pastas"
  - type: "code-reviewer"
    role: "Validar acessibilidade e semântica do novo design"
phases:
  - id: "phase-1"
    name: "Foundation & Tokens"
    prevc: "P"
  - id: "phase-2"
    name: "Layout Core Refactor"
    prevc: "E"
  - id: "phase-3"
    name: "Component & Feature Polish"
    prevc: "V"
---

# Plano de Refatoração: Identidade Visual Sverdlov (Original)

Este plano detalha a transição da estética genérica de "SaaS/Notion" para uma identidade visual proprietária baseada nos princípios do Design Suíço: clareza, legibilidade e objetividade.

## 1. Objetivo e Escopo
- **Meta:** Criar uma UI que transmita confiança e precisão técnica, abandonando o visual "Notion" por algo mais original e arquitetônico.
- **Incluso:**
    - Definição de nova paleta (Branco absoluto, Escala de Cinza fria, Azul Royal #0052FF).
    - Tipografia: Foco em pesos contrastantes e clareza.
    - Abandono de sombras por bordas sólidas sutis (1px).
    - UX: Micro-interações baseadas em estado.
- **Excluso:** Mudanças na lógica de negócio ou banco de dados.

## 2. Fases de Trabalho

### Phase 1 — Foundation (P)
**Objetivo:** Configurar o `tailwind.config.ts` e tokens globais.
- **Passos:**
    1. Redefinir `colors`: `primary` como Azul (#0052FF), `background` como Branco (#FFFFFF).
    2. Reduzir `borderRadius`: Usar `2px` ou `0px` para um look mais técnico.
    3. Remover utilitários de sombra (`shadow-*`) do sistema.
- **Owner:** `frontend-specialist`
- **Checkpoint:** `git commit -m "style: define novos design tokens e paleta original"`

### Phase 2 — Layout Core Refactor (E)
**Objetivo:** Refatorar Sidebar e AppLayout.
- **Passos:**
    1. **Sidebar:** Substituir blocos flutuantes por uma borda vertical simples. Tipografia Uppercase para seções.
    2. **Header:** Fundo sólido branco, sem sombras, apenas borda inferior de 1px.
    3. **Ícones:** Uso consistente de ícones de linha (Lucide) com peso uniforme.
- **Owner:** `frontend-specialist`
- **Checkpoint:** `git commit -m "feat(ui): refatora layout core com estética minimalista suíça"`

### Phase 3 — Component & Feature Polish (V)
**Objetivo:** Aplicar o novo estilo em Cards, Tabelas e Modais.
- **Passos:**
    1. **Cards & Tables:** Layout plano com bordas de 1px.
    2. **Buttons:** Azul sólido para `primary`, contorno para `secondary`.
    3. **Validação:** Garantir contraste e acessibilidade.
- **Owner:** `frontend-specialist` & `code-reviewer`
- **Checkpoint:** `git commit -m "feat(ui): completa refatoração de componentes e valida acessibilidade"`

## 3. Critérios de Sucesso
- Ausência de gradientes e sombras suaves.
- Identidade visual distinta e "limpa" (Estilo Suíço).
- Azul #0052FF como única cor de destaque.
- Build de produção sem erros.

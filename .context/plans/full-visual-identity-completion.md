---
status: in_progress
generated: 2026-01-19
agents:
  - type: "frontend-specialist"
    role: "Implementar a refatoração visual de componentes e páginas"
  - type: "architect-specialist"
    role: "Garantir a integridade dos design tokens e estrutura CSS"
  - type: "code-reviewer"
    role: "Validar a consistência visual e acessibilidade"
phases:
  - id: "phase-1"
    name: "Atomic Component Refactor"
    prevc: "P"
  - id: "phase-2"
    name: "Main Pages Migration"
    prevc: "E"
  - id: "phase-3"
    name: "Final Polish & Verification"
    prevc: "V"
---

# Plano de Conclusão da Identidade Visual Sverdlov

Este plano visa estender a nova identidade visual "Design Suíço Minimalista" para todos os cantos da aplicação, garantindo uma experiência coesa, proprietária e livre de vestígios do estilo Notion.

## 1. Objetivo e Escopo
- **Meta:** 100% da aplicação seguindo os tokens de design: Branco Puro, Azul Sverdlov (#0052FF), Bordas 0px (retas) e Tipografia Bold/Black Uppercase.
- **Incluso:**
    - Refatoração de componentes de formulário (`Input`, `Select`, `Checkbox`, `Label`).
    - Migração das páginas: Membros, Escalas, Financeiro, Calendário, Chat e Configurações.
    - Estilização de Modais e Toasts para o novo padrão sharp.
- **Excluso:** Adição de novas funcionalidades (apenas refatoração visual).

## 2. Fases de Trabalho

### Phase 1 — Atomic Component Refactor (P)
**Objetivo:** Padronizar componentes de UI de baixo nível.
- **Passos:**
    1. **Inputs & Labels:** Remover `rounded-md`, usar `rounded-none`. Labels em uppercase bold.
    2. **Badges:** Refatorar para visual flat, uppercase, sem arredondamento.
    3. **Modals & Toasts:** Remover sombras suaves, usar bordas sólidas de 2px e cantos retos.
    4. **Tabs:** Design de linha sólida em vez de blocos flutuantes.
- **Owner:** `frontend-specialist`
- **Checkpoint:** `git commit -m "style(ui): refatora componentes atômicos para o padrão sharp suíço"`

### Phase 2 — Main Pages Migration (E)
**Objetivo:** Aplicar o novo layout nas páginas principais.
- **Passos:**
    1. **Membros:** Refatorar a tabela para visual flat, remover cores alternadas, usar cabeçalhos bold uppercase.
    2. **Escalas:** Ajustar os cards de turnos e o seletor de datas para o novo padrão.
    3. **Financeiro/Calendário:** Remover qualquer gradiente ou sombra remanescente.
    4. **Chat:** Refatorar bolhas de chat e lista de contatos para visual arquitetônico.
- **Owner:** `frontend-specialist`
- **Checkpoint:** `git commit -m "feat(ui): migra páginas principais para a nova identidade visual"`

### Phase 3 — Final Polish & Verification (V)
**Objetivo:** Revisão final e limpeza de código.
- **Passos:**
    1. **Cleanup:** Remover classes CSS não utilizadas e referências ao modo escuro no código JS/TS.
    2. **UX Polish:** Garantir que anéis de foco (`focus-ring`) sejam visíveis e em Azul Sverdlov.
    3. **Verificação:** Rodar Puppeteer em todas as rotas para garantir que o tema branco está forçado e consistente.
- **Owner:** `frontend-specialist` & `code-reviewer`
- **Checkpoint:** `git commit -m "style: conclusão total da implementação da identidade visual"`

## 3. Critérios de Sucesso
- Zero instâncias de `rounded-md` ou `rounded-lg` na UI principal.
- Consistência total do Azul #0052FF em todos os CTAs.
- Todas as páginas forçadas no tema claro sem "vazamentos" de cinza escuro.
- Build limpo e performance de renderização estável.

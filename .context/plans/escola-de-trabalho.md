---
status: completed
generated: 2026-01-20
agents:
  - type: "code-reviewer"
    role: "Review code changes for quality, style, and best practices"
  - type: "feature-developer"
    role: "Implement new features according to specifications"
  - type: "architect-specialist"
    role: "Design overall system architecture and patterns"
docs:
  - "project-overview.md"
  - "architecture.md"
phases:
  - id: "phase-1"
    name: "Discovery & Database Design"
    prevc: "P"
  - id: "phase-2"
    name: "Component Implementation"
    prevc: "E"
  - id: "phase-3"
    name: "AI & Logic Integration"
    prevc: "E"
  - id: "phase-4"
    name: "Validation"
    prevc: "V"
---

# Plano de Implementação: Escola de Trabalho

> Implementação do sistema de gestão de escalas e militantes 'Escola de Trabalho' com persistência (Drizzle/Neon) e arquitetura modular Next.js.

## Task Snapshot
- **Primary goal:** Migrar o protótipo React "Escola de Trabalho" para uma aplicação Next.js robusta, persistente e modular.
- **Success signal:** O sistema permite CRUD completo de militantes, projetos e escalas, salvando no banco de dados, e oferece sugestões inteligentes de alocação.
- **Key references:**
  - [Codebase Map](../docs/codebase-map.json)
  - [UI Components](src/components/ui)

## Codebase Context
A arquitetura atual utiliza Next.js App Router, Drizzle ORM, Tailwind CSS e Lucide React.
O módulo "Escola de Trabalho" será uma nova seção da aplicação (`/escola-trabalho`), integrada ao sistema de autenticação e layout existente.

## Agent Lineup
| Agent | Role in this plan | Focus |
| --- | --- | --- |
| Architect Specialist | Design DB Schema & API | Definir tabelas Drizzle e Server Actions |
| Feature Developer | Build Components | Criar UI modular (Militantes, Projetos, Escalas) |
| AI Enhancer | Implement Smart Logic | Algoritmo de sugestão de escalas (Auto-Scheduler) |

## Working Phases

### Phase 1 — Discovery & Database Design
**Objective:** Definir a estrutura de dados e configurar o banco.
**Steps**
1. Criar schemas Drizzle em `src/lib/db/schema/escola.ts`:
   - `militantes` (id, nome, tipo, habilidades, disponibilidade_json)
   - `projetos` (id, nome, cor)
   - `tarefas` (id, projeto_id, nome, frequencia, dia_padrao, turno_padrao)
   - `escalas` (id, tarefa_id, militante_id, data, turno, observacao)
2. Gerar migração e aplicar ao banco (`npm run db:generate`, `npm run db:push`).
3. Criar Server Actions para CRUD (`src/app/actions/escola.ts`).

### Phase 2 — Component Implementation
**Objective:** Implementar a interface do usuário modular.
**Steps**
1. Refatorar o componente monolítico em partes menores:
   - `MilitantList.tsx`: Gestão de voluntários e disponibilidade.
   - `ProjectBoard.tsx`: Gestão de projetos e tarefas.
   - `ScheduleGrid.tsx`: Visualização e edição de escalas.
   - `OverviewDashboard.tsx`: KPIs e visão geral.
2. Integrar componentes com Server Actions (substituindo `useState` local).
3. Implementar drag-and-drop (dnd-kit) para alocação visual (melhoria de UX).

### Phase 3 — AI & Logic Integration (Context Improvement)
**Objective:** Adicionar inteligência ao sistema.
**Steps**
1. **Auto-Scheduler:** Criar um algoritmo (ou action com IA) que sugere militantes para tarefas baseando-se em:
   - Compatibilidade de turno (disponibilidade vs tarefa).
   - Habilidades requeridas (match de strings simples ou embeddings futuros).
   - Balanceamento de carga (evitar sobrecarregar um militante).
2. **Context Documentation:** Documentar o módulo em `.context/docs/features/escola-trabalho.md` para que futuros agentes entendam as regras de negócio.

### Phase 4 — Validation
**Objective:** Garantir qualidade e funcionamento.
**Steps**
1. Testes unitários para a lógica de disponibilidade (`vitest`).
2. Teste E2E do fluxo de criação de escala.
3. Validação visual e de responsividade.

## Risk Assessment
| Risk | Mitigation |
| --- | --- |
| Complexidade da Disponibilidade | Armazenar disponibilidade como JSON estruturado para flexibilidade inicial. |
| Concorrência em Escalas | Usar transações de banco (Drizzle) ao salvar escalas em lote. |

## Resource Estimation
- **Effort:** 3-5 dias de desenvolvimento.
- **Skills:** React, Drizzle ORM, Typescript.

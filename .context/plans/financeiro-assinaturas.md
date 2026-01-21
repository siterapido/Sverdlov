---
status: completed
generated: 2026-01-21
agents:
  - type: "architect-specialist"
    role: "Definir schema do banco de dados e arquitetura das actions"
  - type: "feature-developer"
    role: "Implementar Server Actions e lógica de backend"
  - type: "frontend-specialist"
    role: "Criar interfaces de gestão de planos e financeiro do filiado"
  - type: "test-writer"
    role: "Criar testes para lógica de pagamentos e status financeiro"
docs:
  - "project-overview.md"
  - "architecture.md"
  - "development-workflow.md"
  - "testing-strategy.md"
phases:
  - id: "phase-1"
    name: "Modelagem e Backend"
    prevc: "P"
  - id: "phase-2"
    name: "Interface do Usuário (UI)"
    prevc: "E"
  - id: "phase-3"
    name: "Validação e Relatórios"
    prevc: "V"
---

# Plano de Implementação: Módulo Financeiro e Assinaturas

> Implementar gestão completa de planos de assinatura (mensal, anual, etc.), vincular a filiados, registrar pagamentos (recorrentes e extras) e visualizar status financeiro.

## Status: Completed
Todas as fases foram executadas com sucesso.
- Schema criado e migrado.
- Actions implementadas.
- UI implementada (Gestão de Planos + Aba Financeiro).
- Testes unitários de lógica financeira passaram.

## Task Snapshot
- **Primary goal:** Criar um sistema financeiro robusto que permita a criação de planos flexíveis e o controle automatizado de inadimplência dos filiados.
- **Success signal:** Administradores conseguem criar planos, filiados são vinculados a planos, e o status financeiro (Em dia/Inadimplente) é atualizado automaticamente com base nos pagamentos registrados.
- **Key references:**
  - [Documentation Index](../docs/README.md)
  - [Plans Index](./README.md)

## Codebase Context
- **Existing Schemas:** `members` e `finances` já existem mas precisam de evolução.
- **Missing Concepts:** `subscription_plans` (Planos) e lógica de recorrência.
- **Tech Stack:** Next.js (Server Actions), Drizzle ORM, Postgres (Neon), Tailwind/Shadcn UI.

### Key Components to Modify/Create
- **Database:** `src/lib/db/schema/plans.ts` (Novo), `members.ts` (Alteração), `finances.ts` (Alteração).
- **Actions:** `src/app/actions/plans.ts` (Novo), `src/app/actions/finances.ts` (Atualização).
- **UI:** `/admin/finance/plans` (Nova rota), componente `MemberFinancialTab`.

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Architect Specialist | Design DB & API | [Architect Specialist](../agents/architect-specialist.md) | Definir schema do Drizzle para `subscription_plans` |
| Feature Developer | Backend Implementation | [Feature Developer](../agents/feature-developer.md) | Criar Server Actions para CRUD de planos e pagamentos |
| Frontend Specialist | UI Implementation | [Frontend Specialist](../agents/frontend-specialist.md) | Criar telas de gestão de planos e aba financeira do filiado |
| Test Writer | QA & Validation | [Test Writer](../agents/test-writer.md) | Criar testes unitários para cálculo de inadimplência |

## Risk Assessment
### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Migração de dados de filiados existentes | Alta | Médio | Criar script de migração definindo um plano padrão ou 'null' controlado | Architect |
| Pagamentos parciais ou valores divergentes | Média | Baixo | MVP aceita apenas pagamentos integrais; Versão futura aceita parciais | Feature Dev |
| Complexidade na lógica de "Inadimplência" | Média | Alto | Definir regra clara: "Se não pagou competência X até dia Y -> Inadimplente" | Architect |

## Resource Estimation
### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Modelagem e Backend | 3 dias | 1 semana | 1 dev |
| Phase 2 - Interface do Usuário | 4 dias | 1 semana | 1 dev |
| Phase 3 - Validação e Ajustes | 2 dias | 3 dias | 1 dev |
| **Total** | **9 dias** | **~2.5 semanas** | **1 dev** |

## Working Phases

### Phase 1 — Modelagem e Backend
**Foco:** Garantir que o banco de dados suporte a nova lógica e que as actions funcionem corretamente.

**Steps**
1. **Schema Definition (Architect):**
    *   Criar tabela `subscription_plans`: `id`, `name`, `frequency` (monthly, yearly, etc), `amount`, `active`.
    *   Atualizar tabela `members`: adicionar `plan_id` (FK) e `subscription_start_date`.
    *   Atualizar tabela `finances`: adicionar `type` (subscription, extra), `reference_date` (data de competência).
    *   Executar migração (`drizzle-kit generate` + `migrate`).
2.  **Server Actions (Feature Dev):**
    *   `createPlan(data)`: Criar novo plano.
    *   `updateMemberPlan(memberId, planId)`: Vincular filiado.
    *   `registerPayment(data)`: Registrar pagamento com validação de competência.
    *   `getFinancialStatus(memberId)`: Calcular se está em dia baseado nos pagamentos e data de início.

**Commit Checkpoint**
- `git commit -m "feat(finance): add subscription plans schema and actions"`

### Phase 2 — Interface do Usuário (UI)
**Foco:** Permitir que o administrador gerencie os planos e veja a situação financeira.

**Steps**
1.  **Gestão de Planos (Frontend):**
    *   Criar página `/admin/finance/plans`.
    *   Listagem de planos ativos/inativos.
    *   Modal para criar/editar planos.
2.  **Aba Financeiro no Perfil (Frontend):**
    *   Atualizar página de detalhes do filiado.
    *   Adicionar aba "Financeiro".
    *   Mostrar: Plano Atual (Card), Status (Badge Verde/Vermelho), Histórico de Pagamentos (Tabela).
    *   Botão "Novo Pagamento": Modal simples para registrar entrada manual.

**Commit Checkpoint**
- `git commit -m "feat(ui): add financial management screens"`

### Phase 3 — Validação e Relatórios
**Foco:** Testes e refino.

**Steps**
1.  **Testes Automatizados (Test Writer):**
    *   Testar criação de planos.
    *   Testar fluxo: Criar Filiado -> Vincular Plano -> Pagar Mês 1 -> Verificar Status (Em dia) -> Não Pagar Mês 2 -> Verificar Status (Atrasado).
2.  **Dashboard Widget (Frontend):**
    *   Adicionar widget na Home: "Fluxo de Caixa Mês Atual" (Soma de `finances` do mês).

**Commit Checkpoint**
- `git commit -m "test(finance): add tests for subscription logic"`

## Rollback Plan
### Rollback Triggers
- Erro na migração de dados existente.
- Cálculo errado de inadimplência bloqueando filiados em dia.

### Rollback Procedures
- **Database:** Reverter migração do Drizzle (`drizzle-kit drop` ou restore backup).
- **Code:** `git revert` nos commits da feature.

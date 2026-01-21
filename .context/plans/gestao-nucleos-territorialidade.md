---
status: pending
generated: 2026-01-21
agents:
  - type: "architect-specialist"
    role: "Design overview and database relations"
  - type: "feature-developer"
    role: "Implement Server Actions and Nucleus Logic"
  - type: "frontend-specialist"
    role: "Implement Nuclei Management UI"
phases:
  - id: "phase-1"
    name: "Estrutura e Backend"
    prevc: "P"
  - id: "phase-2"
    name: "Interface de Gestão"
    prevc: "E"
  - id: "phase-3"
    name: "Vínculos e Dashboard"
    prevc: "V"
---

# Plano de Implementação: Gestão de Núcleos e Territorialidade

> Implementar CRUD de Núcleos, dashboard de núcleos e atribuição de filiados para organização territorial e temática.

## Task Snapshot
- **Primary goal:** Estabelecer a estrutura organizacional do partido, permitindo a criação de núcleos territoriais e temáticos e a vinculação de filiados a eles.
- **Success signal:** Administradores conseguem criar núcleos, visualizar todos os filiados de um núcleo específico e transferir filiados entre núcleos.
- **Key references:**
  - [Schema: nuclei.ts](../lib/db/schema/nuclei.ts)
  - [Schema: members.ts](../lib/db/schema/members.ts)

## Codebase Context
- **Schema Existente:** `nuclei` já possui campos básicos (`id`, `name`, `type`, `state`, `city`, `status`).
- **Gaps:** Falta lógica de "Coordinator" (vínculo com usuário/membro) e UI de gerenciamento.

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Architect Specialist | Design API & Relations | [Architect Specialist](../agents/architect-specialist.md) | Definir Server Actions para CRUD de Núcleos |
| Feature Developer | Backend Implementation | [Feature Developer](../agents/feature-developer.md) | Implementar lógica de atribuição de membros a núcleos |
| Frontend Specialist | UI Implementation | [Frontend Specialist](../agents/frontend-specialist.md) | Criar páginas em `/members/nuclei` e modais de edição |

## Resource Estimation
### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Estrutura e Backend | 2 dias | 3 dias | 1 dev |
| Phase 2 - Interface de Gestão | 3 dias | 4 dias | 1 dev |
| Phase 3 - Vínculos e Dashboard | 2 dias | 3 dias | 1 dev |
| **Total** | **7 dias** | **~2 semanas** | **1 dev** |

## Working Phases

### Phase 1 — Estrutura e Backend
**Foco:** Garantir que as operações básicas de núcleos funcionem no servidor.

**Steps**
1. **Server Actions (Architect/Feature Dev):**
    *   `getNuclei()`: Listar todos os núcleos com contagem de membros.
    *   `getNucleusById(id)`: Detalhes do núcleo e lista de membros vinculados.
    *   `createNucleus(data)` / `updateNucleus(id, data)`: CRUD básico.
    *   `assignMemberToNucleus(memberId, nucleusId)`: Action para vincular filiado.

**Commit Checkpoint**
- `git commit -m "feat(nuclei): add server actions for nucleus management"`

### Phase 2 — Interface de Gestão
**Foco:** Criar as telas para o administrador.

**Steps**
1. **Páginas de Administração (Frontend):**
    *   Criar rota `/members/nuclei`.
    *   Implementar listagem de núcleos com filtros por tipo (territorial/temático) e UF.
    *   Modal de criação/edição de núcleos.
2. **Componentes Reutilizáveis:**
    *   `NucleusSelect`: Componente para selecionar núcleo em outros formulários (ex: no cadastro de membro).

**Commit Checkpoint**
- `git commit -m "feat(ui): add nuclei management screens"`

### Phase 3 — Vínculos e Dashboard
**Foco:** Visualização e relatórios por núcleo.

**Steps**
1. **Detalhes do Núcleo:**
    *   Página `/members/nuclei/[id]`.
    *   Dashboard simples: Qtd de membros, Qtd de militantes, Status financeiro médio do núcleo.
    *   Tabela de membros do núcleo com ação de "Desvincular" ou "Transferir".

**Commit Checkpoint**
- `git commit -m "feat(nuclei): add nucleus dashboard and member list"`

## Rollback Plan
- **Database:** `nuclei` já existe, então não há migrações destrutivas previstas.
- **Code:** Reverter para a branch `main` prévia aos novos arquivos de rota e action.

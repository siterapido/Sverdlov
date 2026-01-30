---
status: pending
generated: 2026-01-21
agents:
  - type: "architect-specialist"
    role: "Define lifecycle state machine and security"
  - type: "feature-developer"
    role: "Implement approval actions and role transitions"
  - type: "frontend-specialist"
    role: "Build Approval Queue and profile management UI"
phases:
  - id: "phase-1"
    name: "Fluxo de Triagem (Inbound)"
    prevc: "P"
  - id: "phase-2"
    name: "Gestão de Responsáveis Políticos"
    prevc: "E"
  - id: "phase-3"
    name: "Histórico e Evolução"
    prevc: "V"
---

# Plano de Implementação: Ciclo de Vida do Filiado e Aprovação

> Implementar fluxo de aprovação de interessados, transição de status e gestão de responsáveis políticos.

## Task Snapshot
- **Primary goal:** Garantir que todo novo interessado (via formulário público) passe por um processo de acolhimento e aprovação antes de se tornar um membro ativo.
- **Success signal:** Administradores possuem uma "Fila de Espera" e podem aprovar membros, designando-os a um núcleo e a um responsável político.
- **Key references:**
  - [Action: createMemberAction](../app/actions/members.ts)
  - [Schema: members.ts](../lib/db/schema/members.ts)

## Codebase Context
- **Estado Atual:** Membros são criados com status `interested`.
- **Gaps:** Não há interface para mudar status ou designar `political_responsible_id`.

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Architect Specialist | State Machine | [Architect Specialist](../agents/architect-specialist.md) | Definir as regras de transição de status (ex: interested -> in_formation -> active) |
| Feature Developer | Business Logic | [Feature Developer](../agents/feature-developer.md) | Criar actions `approveMember`, `rejectMember`, `assignResponsible` |
| Frontend Specialist | Workflow UI | [Frontend Specialist](../agents/frontend-specialist.md) | Criar a "Fila de Triagem" e visualização de Timeline do filiado |

## Resource Estimation
### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Fila de Triagem | 2 dias | 3 dias | 1 dev |
| Phase 2 - Responsáveis Políticos | 2 dias | 3 dias | 1 dev |
| Phase 3 - Histórico/Evolução | 2 dias | 3 dias | 1 dev |
| **Total** | **6 dias** | **~1.5 semanas** | **1 dev** |

## Working Phases

### Phase 1 — Fluxo de Triagem (Inbound)
**Foco:** Organizar quem está chegando.

**Steps**
1. **Actions:**
    *   `getPendingMembers()`: Filtrar por status `interested`.
    *   `updateMemberStatus(id, status)`: Action genérica de transição.
2. **UI:**
    *   Página `/members/requests`.
    *   Cartões de solicitação com ações rápidas: Aprovar, Rejeitar, Ver Detalhes.

**Commit Checkpoint**
- `git commit -m "feat(members): add approval queue for new requests"`

### Phase 2 — Gestão de Responsáveis Políticos
**Foco:** Acolhimento individual.

**Steps**
1. **Vínculos:**
    *   Permitir selecionar um `user` (quadro/líder) como responsável político do novo filiado.
2. **Notificações Internas:**
    *   (Opcional) Trigger simples de log para avisar o responsável.

**Commit Checkpoint**
- `git commit -m "feat(members): add political responsible assignment logic"`

### Phase 3 — Histórico e Evolução
**Foco:** Acompanhamento de longo prazo.

**Steps**
1. **Timeline:**
    *   Exibir datas de: Solicitação, Aprovação, Afiliação.
2. **Militancy Level:**
    *   Interface para promover membro de `supporter` para `militant`.

**Commit Checkpoint**
- `git commit -m "feat(members): implement member evolution timeline"`

## Rollback Plan
- **Database:** Nenhuma alteração de schema necessária (já suportado).
- **Code:** Reverter as novas rotas de administração de solicitações.

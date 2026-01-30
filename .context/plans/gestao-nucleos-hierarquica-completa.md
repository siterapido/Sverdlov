---
status: pending
generated: 2026-01-22
agents:
  - type: "architect-specialist"
    role: "Database migrations and system hierarchy design"
  - type: "feature-developer"
    role: "Implement Server Actions and membership logic"
  - type: "frontend-specialist"
    role: "Create management UI and assignment flows"
phases:
  - id: "phase-1"
    name: "Refinamento de Schema e Actions"
    prevc: "P"
  - id: "phase-2"
    name: "Gestão Hierárquica e Coordenação"
    prevc: "E"
  - id: "phase-3"
    name: "Atribuição de Filiados e Dashboard"
    prevc: "V"
---

# Plano de Implementação: Gestão Hierárquica de Núcleos e Filiados

> Implementar o fluxo completo de criação, edição e organização de núcleos em múltiplos níveis (Estado, Cidade, Zona, Local), com atribuição de responsáveis e gestão de membros.

## Task Snapshot
- **Primary goal:** Criar uma estrutura organizacional ramificada que reflita a realidade territorial do partido, permitindo a descentralização da gestão.
- **Success signal:** Administradores conseguem criar um núcleo de Estado, vincular núcleos de Cidade a ele, definir coordenadores e mover filiados entre núcleos de qualquer nível.
- **Key references:**
  - `src/lib/db/schema/nuclei.ts` (Atualizar)
  - `src/lib/db/schema/members.ts` (Filiados)
  - `src/app/(protected)/members/nuclei/` (UI existente)

## Codebase Context
- **Schema Atual:** O objeto `nuclei` já existe mas é limitado. Precisa de suporte a hierarquia (`parentId`) e níveis explícitos.
- **Filiados:** Já possuem `nucleusId`, facilitando a vinculação.
- **Autenticação:** Uso do Clerk e Supabase já integrado.

## Agent Lineup
| Agent | Role in this plan | Focus Area |
| --- | --- | --- |
| Architect Specialist | Design API & Relations | Migrações Drizzle e lógica de parent/child |
| Feature Developer | Backend Implementation | Server Actions para CRUD e validação de hierarquia |
| Frontend Specialist | UI Implementation | Componentes de árvores, modais de seleção e listagens filtradas |

## Resource Estimation
| Phase | Effort | Team Size |
| --- | --- | --- |
| Phase 1 - Schema e Actions | 1-2 dias | 1 dev |
| Phase 2 - Interface Hierárquica | 2-3 dias | 1 dev |
| Phase 3 - Relatórios e Dashboards | 1 dia | 1 dev |

## Working Phases

### Phase 1 — Refinamento de Schema e Actions
**Foco:** Garantir que o banco de dados suporte a hierarquia e as operações básicas.

**Steps**
1. **Drizzle Migration:**
    *   Adicionar campo `level` (enum: 'state', 'city', 'zone', 'local') ao schema `nuclei`.
    *   Adicionar campo `parentId` (uuid, referenciando `nuclei.id`) para permitir a árvore.
    *   Garantir que `coordinatorId` referencie `members.id`.
2. **Server Actions:**
    *   `getNucleiTree()`: Retornar núcleos organizados hierarquicamente.
    *   `updateNucleusCoordinator(nucleusId, memberId)`: Definir o responsável.
    *   `getNucleiByParent(parentId)`: Listar sub-núcleos.

**Commit Checkpoint**
- `git commit -m "feat(nuclei): update schema for hierarchy and coordination"`

### Phase 2 — Gestão Hierárquica e Coordenação
**Foco:** Implementar as telas de criação e edição considerando os níveis.

**Steps**
1. **Formulário de Núcleo:**
    *   Permitir selecionar o Nível.
    *   Se nível for > 'state', exigir seleção do núcleo pai (ex: Cidade exige Estado).
2. **Seleção de Coordenador:**
    *   Implementar busca/autocomplete de membros no formulário de núcleo.
3. **Página de Detalhes:**
    *   Exibir breadcrumbs (Estado > Cidade > Zona).
    *   Mostrar quem é o coordenador atual com foto/contato.

**Commit Checkpoint**
- `git commit -m "feat(ui): implement hierarchical nucleus management and coordination"`

### Phase 3 — Atribuição de Filiados e Dashboard
**Foco:** Gerenciar as pessoas dentro dos núcleos.

**Steps**
1. **Modal de Atribuição:**
    *   Na página do núcleo, botão "Adicionar Filiado".
    *   Busca de membros sem núcleo ou sugestão de transferência.
2. **Dashboard do Núcleo:**
    *   Métricas: Total de membros, membros ativos, arrecadação total do núcleo (via planos vinculados).
3. **Logs de Atividade:**
    *   Registrar quando um membro entra ou sai de um núcleo.

**Commit Checkpoint**
- `git commit -m "feat(nuclei): add member assignment and statistics"`

## Rollback Plan
- **Database:** Usar migrações do Drizzle para reverter campos se necessário (`drizzle-kit drop`).
- **UI:** Reverter alterações nas rotas `/members/nuclei`.

## Success Criteria
- [ ] É possível criar um núcleo "São Paulo" (Estado) sem pai.
- [ ] É possível criar um núcleo "Capital" (Cidade) vinculado a "São Paulo".
- [ ] Um filiado pode ser definido como Coordenador do núcleo "Capital".
- [ ] Ao visualizar "Capital", vejo todos os filiados atribuídos.
- [ ] Breadcrumbs mostram corretamente a linhagem do núcleo.

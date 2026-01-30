---
status: pending
generated: 2026-01-21
agents:
  - type: "architect-specialist"
    role: "Define complex relationships and slot generation logic"
  - type: "feature-developer"
    role: "Implement Server Actions for scheduling and assignments"
  - type: "frontend-specialist"
    role: "Build interactive Calendar UI and management modals"
phases:
  - id: "phase-1"
    name: "Lógica de Escalas e Turnos"
    prevc: "P"
  - id: "phase-2"
    name: "Visualização de Calendário"
    prevc: "E"
  - id: "phase-3"
    name: "Inscrições e Disponibilidade"
    prevc: "E"
---

# Plano de Implementação: Calendário e Escalas Operacionais

> Implementar a interface de calendário, criação de eventos/escalas e gestão de turnos (slots) para militância.

## Task Snapshot
- **Primary goal:** Criar um sistema unificado para agendamento de atividades políticas (agitprop, formação, vigília) com gestão de turnos e voluntários.
- **Success signal:** Administradores conseguem criar um evento (ex: "Banca de Jornal") com múltiplos turnos, e militantes conseguem se inscrever nos turnos disponíveis.
- **Key references:**
  - [Schema: schedules.ts](../lib/db/schema/schedules.ts)

## Codebase Context
- **Schema Existente:** Extremamente detalhado. Suporta recorrência, categorias e localizações.
- **Gaps:** Implementação total de UI e lógica de geração automática de slots baseada em recorrência.

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Architect Specialist | Recruitment & Logic | [Architect Specialist](../agents/architect-specialist.md) | Criar helper para gerar `schedule_slots` a partir de `recurring_pattern` |
| Feature Developer | Backend Actions | [Feature Developer](../agents/feature-developer.md) | Implementar `assignToSlot` e `checkInSlot` |
| Frontend Specialist | Calendar UI | [Frontend Specialist](../agents/frontend-specialist.md) | Implementar visualização de calendário usando FullCalendar ou biblioteca similar |

## Resource Estimation
### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Lógica de Escalas | 3 dias | 4 dias | 1 dev |
| Phase 2 - Visualização UI | 4 dias | 1 semana | 1 dev |
| Phase 3 - Inscrições | 3 dias | 4 dias | 1 dev |
| **Total** | **10 dias** | **~3 semanas** | **1 dev** |

## Working Phases

### Phase 1 — Lógica de Escalas e Turnos
**Foco:** Automação de slots.

**Steps**
1. **Server Actions:**
    *   `createSchedule(data)`: Salvar escala e disparar gerador de slots.
    *   `generateSlotsForSchedule(scheduleId)`: Lógica para criar registros em `schedule_slots`.
2. **Utils:**
    *   Helper de parsing do `recurring_pattern` (JSONB).

**Commit Checkpoint**
- `git commit -m "feat(calendar): add schedule creation and slot generation logic"`

### Phase 2 — Visualização de Calendário
**Foco:** Interface central.

**Steps**
1. **Calendar View:**
    *   Transformar `/calendar/page.tsx` em uma interface real.
    *   Filtros por Categoria (Vigilância, Formação, etc) e Núcleo.
2. **Event Details:**
    *   Página de detalhe do evento mostrando turnos e quem está inscrito.

**Commit Checkpoint**
- `git commit -m "feat(ui): implement calendar monthly view and event details"`

### Phase 3 — Inscrições e Disponibilidade
**Foco:** Engajamento do militante.

**Steps**
1. **Fluxo do Militante:**
    *   Botão "Participar" no turno.
    *   Ação `confirmAssignment` / `declineAssignment`.
2. **Check-in:**
    *   Interface simples para o responsável do turno registrar presença (attended).

**Commit Checkpoint**
- `git commit -m "feat(calendar): add member assignment and check-in flow"`

## Rollback Plan
- **Database:** Reverter inserts em `schedule_slots` se a geração de recorrência falhar (loop infinito ou datas erradas).
- **Code:** Git revert nos componentes de UI complexos.

---
status: in_progress
generated: 2026-01-21
agents:
  - type: "feature-developer"
    role: "Implement new features according to specifications"
  - type: "code-reviewer"
    role: "Review code changes for quality, style, and best practices"
docs:
  - "project-overview.md"
phases:
  - id: "phase-1"
    name: "Discovery & Alignment"
    prevc: "P"
  - id: "phase-2"
    name: "Implementation & Iteration"
    prevc: "E"
  - id: "phase-3"
    name: "Validation & Handoff"
    prevc: "V"
---

# Cadastro de Filiados Completo Plan

> Implementar formulário público de filiação com todos os campos exigidos pelo schema do banco de dados, incluindo validação Zod e Server Actions.

## Task Snapshot
- **Primary goal:** Implementar o fluxo completo de cadastro de filiados (frontend + backend).
- **Success signal:** Usuário consegue preencher todos os dados, validação funciona, e registro é criado no banco 'members'.
- **Key references:**
  - `src/lib/db/schema/members.ts` (Database Schema)
  - `src/app/(public)/filie-se/page.tsx` (Current Frontend)

## Codebase Context
- **Target Schema:** `members` table in Drizzle.
- **Required Fields:** fullName, cpf, dateOfBirth, phone, email, state, city, neighborhood.
- **Optional Fields:** socialName, voterTitle, zone, gender, nucleusId, politicalResponsibleId.

## Working Phases

### Phase 1 — Discovery & Alignment
**Steps**
1. [x] Analyze `members` table schema.
2. [x] Identify required vs optional fields.
3. [x] Determine validation rules (Zod).

### Phase 2 — Implementation & Iteration
**Steps**
1. **Schema Creation:** Create `src/lib/schemas/member.ts` with Zod validation.
   - Validar CPF e Datas.
2. **Server Action:** Create `src/app/actions/members.ts`.
   - `createMemberAction(data: Schema): Promise<Result>`
   - Check for existing CPF/Email.
   - Insert into DB.
3. **Frontend Update:** Refactor `src/app/(public)/filie-se/page.tsx`.
   - Add new fields.
   - Implement masks (CPF, Phone).
   - Wire up Server Action.

### Phase 3 — Validation & Handoff
**Steps**
1. Verify form validation logic.
2. Verify database insertion.
3. Check UI responsiveness.

## Rollback Plan
- Revert changes to `page.tsx` and delete created files (`actions/members.ts`, `schemas/member.ts`).

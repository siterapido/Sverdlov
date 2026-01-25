---
status: in_progress
generated: 2026-01-25
agents:
  - type: "code-reviewer"
    role: "Review code changes for quality, style, and best practices"
  - type: "feature-developer"
    role: "Implement the Settings Tabs and consolidate User Management"
  - type: "frontend-specialist"
    role: "Ensure responsive and accessible UI for the tabs"
docs:
  - "project-overview.md"
phases:
  - id: "phase-1"
    name: "Discovery & Alignment"
    prevc: "P"
  - id: "phase-2"
    name: "Implementation"
    prevc: "E"
  - id: "phase-3"
    name: "Validation"
    prevc: "V"
---

# Consolidação de Configurações e Gestão de Usuários Plan

> Consolidate User Management into the Settings page using Tabs, restricted by RBAC.

## Task Snapshot
- **Primary goal:** Move the User Management functionality from the Admin page to a "Users" tab within the Settings page, visible only to authorized users.
- **Success signal:** The Settings page displays tabs ("Geral", "Usuários"). The "Usuários" tab shows the user management list. Non-admin users do not see the "Users" tab. The old Admin page is deprecated or redirected.
- **Key references:**
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Plans Index](./README.md)

## Codebase Context
- **Settings Page:** `src/app/(protected)/settings/page.tsx`
- **Admin Page:** `src/app/(protected)/admin/page.tsx`
- **User Component:** `src/components/admin/UserManagement.tsx`
- **RBAC Logic:** `src/lib/auth/rbac.ts`
- **UI Components:** `src/components/ui/tabs.tsx`

### Key Components

**Key Interfaces:**
- `UserManagementProps` (implicit in `UserManagement.tsx`)

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Feature Developer | Lead implementation | [Feature Developer](../agents/feature-developer.md) | Create `SettingsTabs` component and integrate `UserManagement`. |
| Frontend Specialist | UI/UX | [Frontend Specialist](../agents/frontend-specialist.md) | Ensure tabs look good and match the design system. |

## Working Phases
### Phase 1 — Discovery & Alignment
**Steps**
1. [x] Analyze existing `settings/page.tsx` and `admin/page.tsx`.
2. [x] Verify `UserManagement` component independence.
3. [x] Check RBAC implementation for user roles.

**Commit Checkpoint**
- `git commit -m "chore(plan): complete phase 1 discovery"`

### Phase 2 — Implementation
**Steps**
1. Create `src/components/settings/SettingsTabs.tsx` (Client Component).
    - Use `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` from `src/components/ui/tabs.tsx`.
    - Accept `initialUsers` as prop (or fetch inside if preferred, but passing from server component is better for initial state).
    - Implement tab switching logic.
2. Refactor `src/app/(protected)/settings/page.tsx`.
    - Fetch users server-side (copy logic from `admin/page.tsx`).
    - Check current user role to decide if "Users" tab should be rendered.
    - Render `SettingsTabs` passing the necessary data.
3. Update `UserManagement.tsx` if necessary to fit within the tab content (check for layout constraints).
4. Remove `src/app/(protected)/admin` and update `Sidebar.tsx`.
    - Removed `/admin` route.
    - Updated `Sidebar.tsx` to remove "Administração" section (Users are now in "Configurações").
    - Updated `users.ts` and `plans.ts` action paths.

**Commit Checkpoint**
- `git commit -m "feat(settings): add tabs, integrate user management, and remove /admin"`

### Phase 3 — Validation
**Steps**
1. Verify "Geral" tab shows the original "Módulo em construção" message (or new profile settings).
2. Verify "Usuários" tab shows the user list for Admins.
3. Verify "Usuários" tab is hidden for non-Admins.
4. Verify user creation/editing still works within the new location.

**Commit Checkpoint**
- `git commit -m "chore(plan): complete phase 3 validation"`

## Rollback Plan
- **Phase 1:** No rollback needed.
- **Phase 2:** Revert `settings/page.tsx` changes and delete `SettingsTabs.tsx`.
- **Phase 3:** Same as Phase 2.

## Evidence & Follow-up
- Screenshots of the new Settings page.
- Test with different user roles.

---
status: completed
generated: 2026-01-22
agents:
  - type: "feature-developer"
    role: "Implement UI components and server actions"
  - type: "frontend-specialist"
    role: "Design modals and integration"
  - type: "backend-specialist"
    role: "Implement server actions and DB queries"
docs:
  - "project-overview.md"
  - "architecture.md"
---

# Project Management & Availability Visualization Plan

## Goal
Implement a complete interface for managing "Work Schools" (Escolas de Trabalho) and "Tasks" within the Project Details page, and enhance the Schedule creation process by visualizing and validating member availability.

## Scope
1.  **Project Details UI**: Add ability to Create, Read, Update, and Delete (CRUD) Work Schools and Tasks directly from the Project Details page.
2.  **Availability Integration**: Visualize member availability (collected via public links) in the Schedule creation/editing flow to prevent conflicts.

## Phases

### Phase 1: Project Management UI (Work Schools & Tasks)
**Objective**: Enable full management of project sub-components.

#### Steps:
1.  **Work School Management**:
    -   ✅ Create `WorkSchoolModal` component for adding/editing.
    -   ✅ Implement Server Actions: `createWorkSchool`, `updateWorkSchool`, `deleteWorkSchool`.
    -   ✅ Update `ProjectDetailsPage` to list Work Schools and include the "Add" button.
2.  **Task Management**:
    -   ✅ Create `TaskModal` component.
    -   ✅ Implement Server Actions: `createTask`, `updateTask`, `deleteTask` (linked to Project or Work School).
    -   ✅ Update `ProjectDetailsPage` to list Tasks (grouped by Work School or standalone).
3.  **UI Polish**:
    -   ✅ Ensure consistent styling with the design system.
    -   ✅ Add empty states and loading indicators.

**Deliverables**:
-   Functional "Add/Edit Work School" modal.
-   Functional "Add/Edit Task" modal.
-   Updated Project Details view showing hierarchy.

### Phase 2: Availability Visualization in Schedules
**Objective**: Use collected availability data to support decision-making in Schedule creation.

#### Steps:
1.  **Fetch Availability**:
    -   ✅ Updated `getAvailableMembersForSlot` in `src/app/actions/slot-assignments.ts` to reward explicit availability from public links.
    -   ✅ System now checks `scheduleExceptions` for `available` type entries (which are created by the public form).
2.  **UI Integration**:
    -   ✅ Updated `AssignMemberModal` in `src/app/(protected)/escalas/[id]/turnos/page.tsx` to highlight confirmed members.
    -   ✅ Members with explicit availability now appear with a Green background and Check icon.

**Deliverables**:
-   Visual availability indicators in Schedule member assignment.
-   Automatic scoring boost for confirmed availability.

## Success Criteria
-   Users can create projects, add work schools to them, and add tasks to those schools.
-   Users can see which members are available when creating a schedule, based on the data collected via the public availability link.

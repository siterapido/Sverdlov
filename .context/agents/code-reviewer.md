---
name: Code Reviewer
description: Review code changes for quality, style, and best practices
status: unfilled
generated: 2026-01-18
---

# Code Reviewer Agent Playbook

## Mission
Describe how the code reviewer agent supports the team and when to engage it.

## Responsibilities
- Review code changes for quality, style, and best practices
- Identify potential bugs and security issues
- Ensure code follows project conventions
- Provide constructive feedback and suggestions

## Best Practices
- Focus on maintainability and readability
- Consider the broader impact of changes
- Be constructive and specific in feedback

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `drizzle/` — TODO: Describe the purpose of this directory.
- `public/` — TODO: Describe the purpose of this directory.
- `src/` — TODO: Describe the purpose of this directory.

## Key Files
**Entry Points:**
- [`../../../../src/lib/db/index.ts`](../../../../src/lib/db/index.ts)
- [`../../../../src/lib/db/schema/index.ts`](../../../../src/lib/db/schema/index.ts)

## Architecture Context

### Utils
Shared utilities and helpers
- **Directories**: `src/lib`, `src/lib/db`, `src/lib/auth`
- **Symbols**: 9 total
- **Key exports**: [`cn`](src/lib/utils.ts#L4), [`getAuthUser`](src/lib/auth/rbac.ts#L4), [`hasRole`](src/lib/auth/rbac.ts#L14), [`canAccessTerritory`](src/lib/auth/rbac.ts#L22), [`hashPassword`](src/lib/auth/password.ts#L3), [`verifyPassword`](src/lib/auth/password.ts#L7), [`JWTPayload`](src/lib/auth/jwt.ts#L7), [`signToken`](src/lib/auth/jwt.ts#L14), [`verifyToken`](src/lib/auth/jwt.ts#L22)

### Controllers
Request handling and routing
- **Directories**: `src/app/api/members`, `src/app/api/members/[id]`, `src/app/api/auth/register`, `src/app/api/auth/login`
- **Symbols**: 6 total
- **Key exports**: [`GET`](src/app/api/members/route.ts#L8), [`POST`](src/app/api/members/route.ts#L32), [`PATCH`](src/app/api/members/[id]/route.ts#L8), [`DELETE`](src/app/api/members/[id]/route.ts#L75), [`POST`](src/app/api/auth/register/route.ts#L8), [`POST`](src/app/api/auth/login/route.ts#L8)

### Components
UI components and views
- **Directories**: `src/app`, `src/components/ui`, `src/components/members`, `src/components/layout`, `src/app/(public)/filie-se`, `src/app/(protected)/members`, `src/app/(protected)/finance`, `src/app/(protected)/dashboard`, `src/app/(protected)/chat`, `src/app/(protected)/calendar`, `src/app/(protected)/settings`, `src/app/(protected)/members/[id]`
- **Symbols**: 27 total
- **Key exports**: [`PageTransition`](src/components/ui/page-transition.tsx#L5), [`InputProps`](src/components/ui/input.tsx#L4), [`ButtonProps`](src/components/ui/button.tsx#L35), [`MemberForm`](src/components/members/member-form.tsx#L14), [`MembersTable`](src/components/members/MembersTable.tsx#L36), [`ImportModal`](src/components/members/ImportModal.tsx#L23), [`Sidebar`](src/components/layout/Sidebar.tsx#L28), [`QuickCapture`](src/components/layout/QuickCapture.tsx#L7), [`AppLayout`](src/components/layout/AppLayout.tsx#L9), [`AppHeader`](src/components/layout/AppHeader.tsx#L15)
## Key Symbols for This Agent
- [`JWTPayload`](src/lib/auth/jwt.ts#L7) (interface)
- [`InputProps`](src/components/ui/input.tsx#L4) (interface)
- [`ButtonProps`](src/components/ui/button.tsx#L35) (interface)

## Documentation Touchpoints
- [Documentation Index](../docs/README.md)
- [Project Overview](../docs/project-overview.md)
- [Architecture Notes](../docs/architecture.md)
- [Development Workflow](../docs/development-workflow.md)
- [Testing Strategy](../docs/testing-strategy.md)
- [Glossary & Domain Concepts](../docs/glossary.md)
- [Data Flow & Integrations](../docs/data-flow.md)
- [Security & Compliance Notes](../docs/security.md)
- [Tooling & Productivity Guide](../docs/tooling.md)

## Collaboration Checklist

1. Confirm assumptions with issue reporters or maintainers.
2. Review open pull requests affecting this area.
3. Update the relevant doc section listed above.
4. Capture learnings back in [docs/README.md](../docs/README.md).

## Hand-off Notes

Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work.

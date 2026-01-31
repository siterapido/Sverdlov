# PLANO DE IMPLEMENTAÇÃO - SVERDLOV
## Guia para Claude Code

---

## 📋 CONTEXTO DO PROJETO

**Nome:** Sverdlov - Plataforma de Gestão da Unidade Popular
**Stack:** Next.js 16.1 (App Router), TypeScript, Tailwind CSS 4, Drizzle ORM, Neon PostgreSQL
**Design:** Estilo brutalista (rounded-none), cor primária #9B111E

**Estrutura de pastas:**
```
src/
├── app/                    # Next.js App Router
│   ├── (protected)/       # Rotas autenticadas
│   ├── (public)/          # Rotas públicas
│   ├── api/               # API Routes
│   └── actions/           # Server Actions
├── components/
│   ├── ui/                # Design System
│   ├── layout/            # Layout components
│   └── [module]/          # Componentes por módulo
├── lib/
│   ├── db/schema/         # Schemas Drizzle
│   └── auth/              # Autenticação
└── hooks/                 # React hooks
```

---

## 🎯 FASE 1: COMPONENTES UI ESSENCIAIS
**Prioridade: ALTA | Estimativa: 1-2 semanas**

### 1.1 Criar componente Select/Dropdown

**Arquivo:** `src/components/ui/select.tsx`

**Requisitos:**
- Seguir padrão visual dos outros componentes (rounded-none, border-zinc-200)
- Suporte a busca/filtro
- Suporte a multi-select
- Suporte a grupos de opções
- Estados: default, error, disabled
- Integração com React Hook Form

**Implementação:**
```tsx
// Estrutura esperada
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  multiple?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

// Variantes com CVA seguindo padrão do input.tsx
const selectVariants = cva(
  "flex h-11 w-full rounded-none border border-zinc-200 bg-white px-3 py-2 text-sm...",
  { variants: { variant: { default: "...", error: "..." } } }
);
```

**Exportar em:** `src/components/ui/index.ts`

---

### 1.2 Criar componente DatePicker

**Arquivo:** `src/components/ui/date-picker.tsx`

**Requisitos:**
- Calendário visual com navegação mês/ano
- Seleção de data única ou range
- Formatação pt-BR (dd/MM/yyyy)
- Integração com date-fns (já instalado)
- Visual consistente com Design System

**Implementação:**
```tsx
export interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  error?: string;
}

// Para range:
export interface DateRangePickerProps {
  value?: { start: Date | null; end: Date | null };
  onChange: (range: { start: Date | null; end: Date | null }) => void;
  // ...
}
```

---

### 1.3 Criar componente TimePicker

**Arquivo:** `src/components/ui/time-picker.tsx`

**Requisitos:**
- Formato 24h
- Input com máscara (HH:mm)
- Dropdown com horários em intervalos de 30min
- Validação de horário válido

---

### 1.4 Criar componente Checkbox e Radio

**Arquivo:** `src/components/ui/checkbox.tsx`

**Requisitos:**
```tsx
export interface CheckboxProps {
  checked?: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  error?: string;
}

// Visual: box quadrado (rounded-none), check com cor primary
// Quando checked: bg-primary, border-primary, ícone Check branco
```

**Arquivo:** `src/components/ui/radio.tsx`

**Requisitos:**
```tsx
export interface RadioGroupProps {
  value?: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; description?: string }[];
  orientation?: 'horizontal' | 'vertical';
}
```

---

### 1.5 Criar componente Switch/Toggle

**Arquivo:** `src/components/ui/switch.tsx`

**Requisitos:**
- Toggle on/off com animação suave
- Tamanhos: sm, default, lg
- Label opcional à direita
- Visual: track retangular (rounded-full para o thumb)

---

### 1.6 Criar componente DataTable

**Arquivo:** `src/components/ui/data-table.tsx`

**Requisitos:**
- Ordenação por coluna (clicável no header)
- Paginação com controles
- Seleção de linhas (checkbox)
- Ações em lote
- Loading state (skeleton)
- Empty state
- Responsivo (scroll horizontal em mobile)

**Estrutura:**
```tsx
export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  emptyMessage?: string;
}
```

---

### 1.7 Criar componente Tooltip

**Arquivo:** `src/components/ui/tooltip.tsx`

**Requisitos:**
- Posicionamento automático (top, bottom, left, right)
- Delay configurável
- Suporte a conteúdo rich (não apenas texto)

---

### 1.8 Criar componente Popover

**Arquivo:** `src/components/ui/popover.tsx`

**Requisitos:**
- Trigger configurável (click ou hover)
- Posicionamento inteligente
- Fechamento ao clicar fora
- Animação de entrada/saída

---

### 1.9 Criar componente CommandMenu (⌘K)

**Arquivo:** `src/components/ui/command-menu.tsx`

**Requisitos:**
- Atalho ⌘K / Ctrl+K para abrir
- Busca fuzzy
- Categorias de comandos
- Atalhos de teclado para navegação
- Integração com router para navegação

**Comandos iniciais:**
```tsx
const commands = [
  { category: 'Navegação', items: [
    { label: 'Ir para Dashboard', shortcut: 'G D', action: () => router.push('/dashboard') },
    { label: 'Ir para Membros', shortcut: 'G M', action: () => router.push('/members') },
    // ...
  ]},
  { category: 'Ações', items: [
    { label: 'Novo Membro', shortcut: 'N M', action: () => openNewMemberModal() },
    // ...
  ]},
];
```

---

### 1.10 Criar componente EmptyState

**Arquivo:** `src/components/ui/empty-state.tsx`

**Requisitos:**
```tsx
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

---

### 1.11 Criar componente FileUpload

**Arquivo:** `src/components/ui/file-upload.tsx`

**Requisitos:**
- Drag and drop
- Preview de arquivos
- Progresso de upload
- Validação de tipo/tamanho
- Múltiplos arquivos

---

### 1.12 Criar componente Breadcrumb

**Arquivo:** `src/components/ui/breadcrumb.tsx`

**Requisitos:**
```tsx
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode; // default: "/"
}
```

---

### 1.13 Atualizar index.ts

**Arquivo:** `src/components/ui/index.ts`

Adicionar exports de todos os novos componentes.

---

## 🎯 FASE 2: SISTEMA DE AUDITORIA E LOGS
**Prioridade: ALTA | Estimativa: 3-5 dias**

### 2.1 Criar schema de audit_logs

**Arquivo:** `src/lib/db/schema/audit.ts`

```typescript
import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  action: text('action', {
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT']
  }).notNull(),
  tableName: text('table_name').notNull(),
  recordId: uuid('record_id'),
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  metadata: jsonb('metadata'), // dados extras contextuais
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
```

**Atualizar:** `src/lib/db/schema/index.ts` para exportar o novo schema.

---

### 2.2 Criar utilitário de auditoria

**Arquivo:** `src/lib/audit.ts`

```typescript
import { db } from './db';
import { auditLogs } from './db/schema';
import { headers } from 'next/headers';

interface AuditOptions {
  userId?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT';
  tableName: string;
  recordId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
}

export async function createAuditLog(options: AuditOptions) {
  const headersList = headers();
  const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip');
  const userAgent = headersList.get('user-agent');

  await db.insert(auditLogs).values({
    ...options,
    ipAddress,
    userAgent,
  });
}

// Helper para diff de objetos
export function getChangedFields(oldObj: Record<string, any>, newObj: Record<string, any>) {
  const changes: Record<string, { old: any; new: any }> = {};

  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  for (const key of allKeys) {
    if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
      changes[key] = { old: oldObj[key], new: newObj[key] };
    }
  }

  return Object.keys(changes).length > 0 ? changes : null;
}
```

---

### 2.3 Integrar auditoria nas Server Actions

**Arquivos a modificar:**
- `src/app/actions/members.ts`
- `src/app/actions/nuclei.ts`
- `src/app/actions/finances.ts`
- `src/app/actions/schedules.ts`
- `src/app/actions/users.ts`

**Exemplo de integração:**
```typescript
// Em members.ts
import { createAuditLog, getChangedFields } from '@/lib/audit';

export async function updateMember(id: string, data: UpdateMemberData) {
  const user = await getCurrentUser();

  // Buscar valores antigos
  const oldMember = await db.query.members.findFirst({ where: eq(members.id, id) });

  // Atualizar
  const [updated] = await db.update(members)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(members.id, id))
    .returning();

  // Registrar auditoria
  await createAuditLog({
    userId: user.id,
    action: 'UPDATE',
    tableName: 'members',
    recordId: id,
    oldValues: oldMember,
    newValues: updated,
    metadata: { changedFields: getChangedFields(oldMember, updated) }
  });

  return updated;
}
```

---

### 2.4 Criar página de visualização de logs

**Arquivo:** `src/app/(protected)/admin/logs/page.tsx`

**Requisitos:**
- Listagem paginada de logs
- Filtros por: usuário, ação, tabela, período
- Visualização de diff (valores antigos vs novos)
- Exportação para CSV

---

## 🎯 FASE 3: SISTEMA DE NOTIFICAÇÕES
**Prioridade: ALTA | Estimativa: 3-5 dias**

### 3.1 Criar schema de notifications

**Arquivo:** `src/lib/db/schema/notifications.ts`

```typescript
import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: text('type', {
    enum: ['info', 'success', 'warning', 'error', 'task', 'schedule', 'finance']
  }).notNull().default('info'),
  title: text('title').notNull(),
  message: text('message').notNull(),
  read: boolean('read').default(false).notNull(),
  actionUrl: text('action_url'), // Link para ação relacionada
  metadata: jsonb('metadata'), // Dados extras
  createdAt: timestamp('created_at').defaultNow().notNull(),
  readAt: timestamp('read_at'),
});
```

---

### 3.2 Criar Server Actions para notificações

**Arquivo:** `src/app/actions/notifications.ts`

```typescript
'use server';

export async function getNotifications(userId: string, options?: { unreadOnly?: boolean }) {
  // ...
}

export async function markAsRead(notificationId: string) {
  // ...
}

export async function markAllAsRead(userId: string) {
  // ...
}

export async function createNotification(data: NewNotification) {
  // ...
}

export async function deleteNotification(notificationId: string) {
  // ...
}
```

---

### 3.3 Criar componente NotificationBell

**Arquivo:** `src/components/layout/NotificationBell.tsx`

**Requisitos:**
- Ícone de sino no header
- Badge com contador de não lidas
- Dropdown com lista de notificações
- Marcar como lida ao clicar
- Link para página completa

---

### 3.4 Criar página de notificações

**Arquivo:** `src/app/(protected)/notifications/page.tsx`

---

### 3.5 Integrar no AppHeader

**Arquivo:** `src/components/layout/AppHeader.tsx`

Adicionar o NotificationBell ao lado do perfil do usuário.

---

## 🎯 FASE 4: MELHORIAS NO MÓDULO DE MEMBROS
**Prioridade: ALTA | Estimativa: 1-2 semanas**

### 4.1 Pipeline Kanban de Filiação

**Arquivo:** `src/components/members/MembersPipeline.tsx`

**Requisitos:**
- Colunas: Interessado → Em Formação → Ativo → Inativo
- Drag and drop entre colunas
- Contadores por coluna
- Cards com info resumida do membro
- Atualização automática do status ao mover

**Dependência:** Instalar `@dnd-kit/core` e `@dnd-kit/sortable`

```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

---

### 4.2 Histórico de Atividades do Membro

**Arquivo:** `src/components/members/MemberActivityTab.tsx`

**Requisitos:**
- Timeline visual de ações
- Tipos: alteração de dados, mudança de status, contribuições, participações em escalas
- Busca dados de audit_logs filtrado por memberId

---

### 4.3 Filtros Avançados

**Arquivo:** `src/components/members/MembersFilters.tsx`

**Requisitos:**
- Filtros múltiplos: status, núcleo, estado, cidade, período de cadastro, status financeiro
- Chips mostrando filtros ativos
- Salvar filtros como preset
- Botão "Limpar filtros"

---

### 4.4 Exportação Avançada

**Arquivo:** `src/components/members/ExportModal.tsx`

**Requisitos:**
- Seleção de campos a exportar
- Formato: Excel ou CSV
- Aplicar filtros atuais
- Preview de dados

---

### 4.5 Validação de CPF em tempo real

**Arquivo:** `src/lib/validators/cpf.ts`

```typescript
export function validateCPF(cpf: string): boolean {
  // Implementar algoritmo de validação de CPF
}

export function formatCPF(cpf: string): string {
  // Formatar: 000.000.000-00
}
```

Integrar no formulário de membro com feedback visual.

---

### 4.6 Detecção de Duplicados

**Arquivo:** `src/app/actions/members.ts`

Adicionar verificação antes de criar/atualizar:

```typescript
export async function checkDuplicates(data: { cpf?: string; email?: string; phone?: string }) {
  const duplicates = [];

  if (data.cpf) {
    const byCpf = await db.query.members.findFirst({ where: eq(members.cpf, data.cpf) });
    if (byCpf) duplicates.push({ field: 'cpf', member: byCpf });
  }
  // ... verificar email e phone

  return duplicates;
}
```

---

## 🎯 FASE 5: MELHORIAS NO MÓDULO DE NÚCLEOS
**Prioridade: MÉDIA | Estimativa: 1 semana**

### 5.1 Visualização Hierárquica

**Arquivo:** `src/components/members/NucleiTreeView.tsx`

**Requisitos:**
- Árvore: Estado → Cidade → Zona → Núcleos
- Expandir/colapsar níveis
- Contadores de membros por nível
- Click para navegar ao núcleo

---

### 5.2 Dashboard por Núcleo

**Arquivo:** Melhorar `src/components/members/NucleusDetailClient.tsx`

**Adicionar:**
- KPIs: membros ativos, taxa de adimplência, escalas cumpridas
- Gráfico de evolução de membros
- Lista de últimas atividades

---

### 5.3 Gestão de Coordenação

**Criar schema:** `src/lib/db/schema/nucleus-coordination.ts`

```typescript
export const nucleusCoordination = pgTable('nucleus_coordination', {
  id: uuid('id').defaultRandom().primaryKey(),
  nucleusId: uuid('nucleus_id').references(() => nuclei.id).notNull(),
  memberId: uuid('member_id').references(() => members.id).notNull(),
  role: text('role', { enum: ['coordinator', 'vice_coordinator', 'secretary'] }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

---

## 🎯 FASE 6: MELHORIAS NO MÓDULO FINANCEIRO
**Prioridade: ALTA | Estimativa: 1-2 semanas**

### 6.1 Dashboard Financeiro Completo

**Arquivo:** Melhorar `src/components/finance/FinanceDashboard.tsx`

**Adicionar:**
- Gráfico de arrecadação mensal (últimos 12 meses)
- Gráfico de inadimplência
- Projeção de receita
- Top contribuintes
- Alertas de inadimplência

---

### 6.2 Relatórios Financeiros

**Arquivo:** `src/app/(protected)/finance/reports/page.tsx`

**Requisitos:**
- Balanço mensal
- Contribuições por núcleo
- Contribuições por estado
- Exportação PDF/Excel

---

### 6.3 Gestão de Inadimplência

**Arquivo:** `src/components/finance/DelinquencyManager.tsx`

**Requisitos:**
- Lista de inadimplentes com dias em atraso
- Filtro por período de atraso
- Ações em lote (enviar lembrete)
- Status: pendente, em negociação, regularizado

---

### 6.4 Integração Asaas (Preparação)

**Arquivo:** `src/lib/integrations/asaas.ts`

```typescript
// Estrutura para futura integração
export interface AsaasConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
}

export class AsaasClient {
  constructor(config: AsaasConfig) {}

  async createCustomer(data: CustomerData) {}
  async createCharge(data: ChargeData) {}
  async getCharge(id: string) {}
  // ... outros métodos
}
```

---

## 🎯 FASE 7: MELHORIAS NO MÓDULO DE ESCALAS
**Prioridade: MÉDIA | Estimativa: 1 semana**

### 7.1 Auto-escalonamento

**Arquivo:** `src/lib/scheduling/auto-assign.ts`

```typescript
export interface AutoAssignOptions {
  scheduleId: string;
  slotId: string;
  maxParticipants: number;
  preferLeaders?: boolean; // Priorizar quem já foi líder
}

export async function autoAssignMembers(options: AutoAssignOptions) {
  // 1. Buscar disponibilidades compatíveis com o slot
  // 2. Filtrar por território/núcleo
  // 3. Ordenar por critérios (experiência, frequência anterior)
  // 4. Atribuir até maxParticipants
}
```

---

### 7.2 Trocas de Turno

**Criar schema:** `src/lib/db/schema/shift-swaps.ts`

```typescript
export const shiftSwaps = pgTable('shift_swaps', {
  id: uuid('id').defaultRandom().primaryKey(),
  requesterId: uuid('requester_id').references(() => members.id).notNull(),
  targetId: uuid('target_id').references(() => members.id),
  originalSlotId: uuid('original_slot_id').references(() => scheduleSlots.id).notNull(),
  proposedSlotId: uuid('proposed_slot_id').references(() => scheduleSlots.id),
  status: text('status', { enum: ['pending', 'accepted', 'rejected', 'cancelled'] }).default('pending'),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at'),
});
```

---

### 7.3 Relatórios de Presença

**Arquivo:** `src/app/(protected)/escalas/reports/page.tsx`

**Métricas:**
- Taxa de comparecimento geral
- Ranking de membros por presença
- Faltas por período
- Comparativo entre núcleos

---

## 🎯 FASE 8: NOVOS MÓDULOS
**Prioridade: BAIXA | Estimativa: 2-4 semanas**

### 8.1 Módulo de Eventos

**Schemas:**
```typescript
// src/lib/db/schema/events.ts
export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type', { enum: ['meeting', 'training', 'assembly', 'action', 'other'] }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  location: text('location'),
  maxParticipants: integer('max_participants'),
  nucleusId: uuid('nucleus_id').references(() => nuclei.id),
  territoryScope: text('territory_scope'), // "SP" ou "SP:São Paulo"
  createdById: uuid('created_by_id').references(() => users.id),
  status: text('status', { enum: ['draft', 'published', 'cancelled', 'completed'] }).default('draft'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const eventRegistrations = pgTable('event_registrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }).notNull(),
  status: text('status', { enum: ['registered', 'confirmed', 'attended', 'absent'] }).default('registered'),
  registeredAt: timestamp('registered_at').defaultNow().notNull(),
  confirmedAt: timestamp('confirmed_at'),
  attendedAt: timestamp('attended_at'),
});
```

**Páginas:**
- `/events` - Lista de eventos
- `/events/new` - Criar evento
- `/events/[id]` - Detalhes e inscrições
- `/events/calendar` - Visualização calendário

---

### 8.2 Módulo de Documentos

**Schema:**
```typescript
// src/lib/db/schema/documents.ts
export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category', {
    enum: ['ata', 'resolucao', 'estatuto', 'manual', 'template', 'other']
  }).notNull(),
  fileUrl: text('file_url').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  version: integer('version').default(1),
  nucleusId: uuid('nucleus_id').references(() => nuclei.id),
  territoryScope: text('territory_scope'),
  uploadedById: uuid('uploaded_by_id').references(() => users.id),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

---

## 🎯 MELHORIAS TÉCNICAS (CONTÍNUAS)

### Paginação Server-Side

Implementar em todas as listagens:

```typescript
// src/lib/pagination.ts
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function paginate<T>(items: T[], params: PaginationParams): PaginatedResult<T> {
  // ...
}
```

---

### Índices de Banco de Dados

**Arquivo:** Criar migration ou adicionar ao schema

```typescript
// Índices importantes para performance
// Em members.ts
export const membersIndexes = {
  cpfIdx: index('members_cpf_idx').on(members.cpf),
  emailIdx: index('members_email_idx').on(members.email),
  statusIdx: index('members_status_idx').on(members.status),
  nucleusIdx: index('members_nucleus_idx').on(members.nucleusId),
  stateIdx: index('members_state_idx').on(members.state),
  createdAtIdx: index('members_created_at_idx').on(members.createdAt),
};
```

---

### Error Boundaries

**Arquivo:** `src/components/error-boundary.tsx`

```typescript
'use client';

export function ErrorBoundary({
  children,
  fallback
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  // Implementar com React Error Boundary
}
```

Adicionar em todas as páginas principais.

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

### Componentes UI
- [ ] Select/Dropdown
- [ ] DatePicker
- [ ] TimePicker
- [ ] Checkbox
- [ ] Radio
- [ ] Switch
- [ ] DataTable
- [ ] Tooltip
- [ ] Popover
- [ ] CommandMenu
- [ ] EmptyState
- [ ] FileUpload
- [ ] Breadcrumb
- [ ] Atualizar index.ts

### Sistema Base
- [ ] Schema audit_logs
- [ ] Utilitário de auditoria
- [ ] Integrar auditoria nas actions
- [ ] Página de logs
- [ ] Schema notifications
- [ ] Actions de notificações
- [ ] NotificationBell
- [ ] Página de notificações

### Módulo Membros
- [ ] Pipeline Kanban
- [ ] Histórico de Atividades
- [ ] Filtros Avançados
- [ ] Exportação Avançada
- [ ] Validação CPF
- [ ] Detecção Duplicados

### Módulo Núcleos
- [ ] Tree View Hierárquico
- [ ] Dashboard por Núcleo
- [ ] Gestão de Coordenação

### Módulo Financeiro
- [ ] Dashboard Completo
- [ ] Relatórios
- [ ] Gestão Inadimplência
- [ ] Preparação Asaas

### Módulo Escalas
- [ ] Auto-escalonamento
- [ ] Trocas de Turno
- [ ] Relatórios de Presença

### Novos Módulos
- [ ] Eventos (schema + páginas)
- [ ] Documentos (schema + páginas)

### Técnico
- [ ] Paginação server-side
- [ ] Índices de banco
- [ ] Error Boundaries

---

## 🚀 COMANDOS ÚTEIS

```bash
# Rodar o projeto
npm run dev

# Gerar migrations
npm run db:generate

# Aplicar migrations
npm run db:push

# Abrir Drizzle Studio
npm run db:studio

# Rodar testes
npm run test

# Build de produção
npm run build
```

---

## 📚 REFERÊNCIAS

- **Design System:** Ver `src/components/ui/` para padrões existentes
- **Schemas:** Ver `src/lib/db/schema/` para estrutura de dados
- **Actions:** Ver `src/app/actions/` para padrão de server actions
- **Estilo:** Tailwind CSS 4 + Design brutalista (rounded-none, shadows offset)

---

*Documento atualizado em Janeiro 2026*
*Para uso com Claude Code*

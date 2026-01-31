# CHECKLIST DE IMPLEMENTAÇÃO SVERDLOV

## 🎯 PRIORIDADE ALTA

### Componentes UI Faltantes
- [x] `src/components/ui/select.tsx` - Select com busca e multi-select ✅
- [x] `src/components/ui/date-picker.tsx` - Calendário visual ✅
- [x] `src/components/ui/time-picker.tsx` - Seletor 24h ✅
- [x] `src/components/ui/checkbox.tsx` - Checkbox estilizado ✅
- [x] `src/components/ui/radio.tsx` - RadioGroup ✅
- [x] `src/components/ui/switch.tsx` - Toggle on/off ✅
- [x] `src/components/ui/data-table.tsx` - Tabela com ordenação/paginação ✅
- [x] `src/components/ui/file-upload.tsx` - Upload drag-and-drop ✅

### Sistema de Auditoria
- [x] `src/lib/db/schema/audit.ts` - Schema audit_logs ✅
- [x] `src/lib/audit.ts` - Utilitário createAuditLog ✅
- [ ] Integrar auditoria em todas as Server Actions
- [x] `src/app/(protected)/admin/logs/page.tsx` - Visualização ✅

### Sistema de Notificações
- [x] `src/lib/db/schema/notifications.ts` - Schema ✅
- [x] `src/app/actions/notifications.ts` - Server Actions ✅
- [x] `src/components/layout/NotificationBell.tsx` - Componente ✅
- [ ] Integrar no AppHeader

### Melhorias Membros
- [ ] `src/components/members/MembersPipeline.tsx` - Kanban (instalar @dnd-kit/core)
- [x] `src/components/members/MembersFilters.tsx` - Filtros avançados ✅
- [x] `src/lib/validators/cpf.ts` - Validação CPF ✅
- [ ] Detecção de duplicados nas actions

## 🎯 PRIORIDADE MÉDIA

### Componentes UI
- [x] `src/components/ui/tooltip.tsx` ✅
- [x] `src/components/ui/popover.tsx` ✅
- [x] `src/components/ui/command-menu.tsx` - ⌘K ✅
- [x] `src/components/ui/empty-state.tsx` ✅
- [x] `src/components/ui/breadcrumb.tsx` ✅

### Módulo Núcleos
- [x] `src/components/members/NucleiTreeView.tsx` - Hierarquia visual ✅
- [ ] Melhorar NucleusDetailClient com KPIs
- [ ] `src/lib/db/schema/nucleus-coordination.ts`

### Módulo Financeiro
- [ ] Melhorar FinanceDashboard com gráficos
- [ ] `src/app/(protected)/finance/reports/page.tsx`
- [ ] `src/components/finance/DelinquencyManager.tsx`

### Módulo Escalas
- [ ] `src/lib/scheduling/auto-assign.ts`
- [ ] `src/lib/db/schema/shift-swaps.ts`
- [ ] `src/app/(protected)/escalas/reports/page.tsx`

## 🎯 PRIORIDADE BAIXA

### Novos Módulos
- [ ] `src/lib/db/schema/events.ts` - Eventos
- [ ] `src/lib/db/schema/documents.ts` - Documentos
- [ ] Páginas de eventos: /events, /events/new, /events/[id]
- [ ] Páginas de documentos: /documents

### Técnico
- [x] `src/lib/pagination.ts` - Paginação server-side ✅
- [ ] Índices de banco de dados
- [ ] `src/components/error-boundary.tsx`

---

## 📋 PADRÕES DO PROJETO

### Design System
- Cores: primary=#9B111E, background=#FFFFFF
- Bordas: rounded-none (estilo brutalista)
- Shadows: shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]
- Font: Inter, font-black para títulos

### Componentes
- Usar CVA (class-variance-authority) para variantes
- Exportar em src/components/ui/index.ts
- Props com interface tipada
- forwardRef para inputs

### Server Actions
- Localização: src/app/actions/
- Prefixo 'use server'
- Sempre revalidar paths após mutações
- Integrar auditoria após implementar

### Schemas
- UUID para IDs
- createdAt/updatedAt em todas tabelas
- Relations com Drizzle ORM
- Exportar tipos inferidos

---

## 🔧 COMANDOS

```bash
npm run dev          # Desenvolvimento
npm run db:push      # Aplicar schema
npm run db:studio    # Drizzle Studio
npm run test         # Testes
```

---
status: filled
generated: 2026-01-18
---

# Sverdlov - Visão Geral do Projeto

**Sverdlov** é uma plataforma de gestão completa para organizações políticas, desenvolvida para a Unidade Popular. O sistema gerencia filiação de membros, finanças (contribuições), nucleação territorial e temática, com interface inspirada no design do Notion.

## 🎯 Propósito e Objetivos

O projeto resolve o desafio de organizar e gerenciar uma organização política de massas, oferecendo:

- **Gestão centralizada de membros**: Cadastro, acompanhamento e atualização de dados de filiados
- **Controle territorial hierárquico**: Acesso baseado em níveis (nacional, estadual, municipal)
- **Acompanhamento financeiro**: Registro e gestão de contribuições dos membros
- **Nucleação organizada**: Gestão de núcleos territoriais e temáticos
- **Pipeline de filiação**: Acompanhamento do processo de adesão de novos membros

## 👥 Público-Alvo

| Persona | Descrição | Nível de Acesso |
|---------|-----------|-----------------|
| Administrador Nacional | Coordenação nacional da organização | Acesso total |
| Liderança Estadual | Coordenadores estaduais | Acesso ao território do estado |
| Liderança Municipal | Coordenadores municipais | Acesso à cidade específica |
| Membro | Filiados da organização | Acesso aos próprios dados |

## 📦 Stack Tecnológica

### Core
- **Framework**: Next.js 16+ (App Router)
- **Linguagem**: TypeScript 5+
- **Runtime**: React 19

### Estilização & UI
- **CSS Framework**: Tailwind CSS 4
- **Animações**: Framer Motion
- **Ícones**: Lucide React
- **Design System**: Notion-inspired com tema personalizado

### Backend & Dados
- **Banco de Dados**: Neon PostgreSQL (Serverless)
- **ORM**: Drizzle ORM
- **Autenticação**: JWT (jose) + bcryptjs

### Desenvolvimento
- **Testes**: Vitest
- **Linter**: ESLint 9
- **Build**: pnpm/npm

## 🗂️ Estrutura do Projeto

```
sverdlov/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (public)/              # Rotas públicas (filiação)
│   │   ├── (protected)/           # Rotas autenticadas
│   │   │   ├── dashboard/         # Dashboard com KPIs
│   │   │   ├── members/           # Gestão de membros
│   │   │   ├── finance/           # Gestão financeira
│   │   │   ├── chat/              # Chat interno
│   │   │   ├── calendar/          # Calendário
│   │   │   └── settings/          # Configurações
│   │   ├── api/                   # API Routes
│   │   │   ├── auth/              # Autenticação (login/register)
│   │   │   └── members/           # CRUD de membros
│   │   └── actions/               # Server Actions
│   ├── components/
│   │   ├── ui/                    # Componentes base (Button, Input)
│   │   ├── layout/                # Sidebar, Header, AppLayout
│   │   └── members/               # Componentes de membros
│   ├── hooks/                     # React hooks customizados
│   └── lib/
│       ├── db/                    # Drizzle ORM + Schemas
│       │   └── schema/            # Schemas do banco (users, members, etc.)
│       └── auth/                  # JWT, RBAC, passwords
├── drizzle/                       # Migrations SQL
└── public/                        # Assets estáticos
```

## 🚀 Início Rápido

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com suas credenciais do Neon

# 3. Aplicar migrations do banco
npm run db:push

# 4. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

## 📡 Endpoints Principais

### Autenticação
- `POST /api/auth/register` - Registro de novos usuários
- `POST /api/auth/login` - Autenticação e geração de JWT

### Membros
- `GET /api/members` - Listar membros (com filtros territoriais)
- `POST /api/members` - Criar novo membro
- `PATCH /api/members/[id]` - Atualizar membro
- `DELETE /api/members/[id]` - Remover membro

## ✅ Funcionalidades Implementadas

- [x] Autenticação JWT com RBAC (Role-Based Access Control)
- [x] Gestão completa de membros (CRUD)
- [x] Formulário público de filiação
- [x] Dashboard com KPIs e estatísticas
- [x] Design system inspirado no Notion
- [x] Animações suaves com Framer Motion
- [x] Importação de membros via Excel/CSV
- [x] Controle de acesso territorial

## 🚧 Roadmap

- [ ] Pipeline de filiação no estilo Kanban
- [ ] Pipeline de nucleação
- [ ] Gestão financeira completa com relatórios
- [ ] Integração com Asaas/PIX para pagamentos
- [ ] Relatórios e analytics avançados
- [ ] Logs de auditoria e histórico de ações
- [ ] Chat em tempo real

## 📚 Recursos Relacionados

- [Arquitetura do Sistema](./architecture.md) - Detalhes técnicos da arquitetura
- [Workflow de Desenvolvimento](./development-workflow.md) - Guia para contribuidores
- [Estratégia de Testes](./testing-strategy.md) - Como testar o sistema
- [Segurança](./security.md) - Práticas de segurança implementadas

---

**Sverdlov** - Organização, disciplina e trabalho estruturado para construir uma organização política de massas. 🚩

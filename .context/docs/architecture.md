---
status: filled
generated: 2026-01-18
---

# Arquitetura do Sistema Sverdlov

Este documento descreve a arquitetura técnica do Sverdlov, explicando as decisões de design, padrões utilizados e como os componentes se integram.

## 📐 Visão Geral da Arquitetura

O Sverdlov segue uma arquitetura **monolítica modular** baseada no Next.js App Router, aproveitando:

- **Server Components** para renderização otimizada no servidor
- **Server Actions** para mutações seguras e tipadas
- **API Routes** para endpoints RESTful quando necessário
- **Edge Functions** compatíveis via Neon Serverless

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │   React     │ │   Framer    │ │    Forms    │               │
│  │ Components  │ │   Motion    │ │   & State   │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT.JS APP ROUTER                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Server Components                     │   │
│  │  • Dashboard Page  • Members Page  • Settings Page       │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Server Actions                        │   │
│  │  • getMembers()  • importMembers()  • deleteMember()     │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      API Routes                          │   │
│  │  • /api/auth/*  • /api/members/*                         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         LIB LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │     Auth     │  │   Database   │  │    Utils     │          │
│  │  • JWT       │  │  • Drizzle   │  │  • cn()      │          │
│  │  • RBAC      │  │  • Schemas   │  │  • helpers   │          │
│  │  • Password  │  │  • Neon      │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEON POSTGRESQL (Serverless)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    users     │  │   members    │  │   nuclei     │          │
│  │   (RBAC)     │  │  (filiados)  │  │  (núcleos)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │   finances   │  │   logs       │                            │
│  │ (contribui.) │  │  (auditoria) │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

## 🏗️ Camadas Arquiteturais

### 1. Camada de Apresentação (Components)

**Diretórios**: `src/components/`, `src/app/`

| Componente | Responsabilidade | Localização |
|------------|------------------|-------------|
| `AppLayout` | Layout principal com sidebar | `components/layout/AppLayout.tsx` |
| `Sidebar` | Navegação lateral do sistema | `components/layout/Sidebar.tsx` |
| `AppHeader` | Cabeçalho contextual por página | `components/layout/AppHeader.tsx` |
| `MembersTable` | Tabela de membros com ações | `components/members/MembersTable.tsx` |
| `MemberForm` | Formulário de criação/edição | `components/members/member-form.tsx` |
| `ImportModal` | Modal para importação Excel | `components/members/ImportModal.tsx` |
| `Button`, `Input` | Componentes UI base | `components/ui/` |

**Padrões**:
- Componentes funcionais com TypeScript
- Props interfaces exportadas para composição
- Uso de `cn()` para merge de classes Tailwind
- Framer Motion para animações

### 2. Camada de Controle (API Routes)

**Diretórios**: `src/app/api/`

```
api/
├── auth/
│   ├── login/route.ts       # POST - Autenticação
│   └── register/route.ts    # POST - Registro
└── members/
    ├── route.ts             # GET, POST - Listar/Criar
    └── [id]/route.ts        # PATCH, DELETE - Atualizar/Remover
```

**Fluxo de Requisição**:
1. Request chega na API Route
2. Validação do JWT (quando aplicável)
3. Verificação de permissões RBAC
4. Execução da lógica de negócio
5. Interação com banco via Drizzle
6. Response JSON estruturado

### 3. Camada de Dados (Lib)

**Diretórios**: `src/lib/`

#### Auth (`src/lib/auth/`)

| Módulo | Função | Exports |
|--------|--------|---------|
| `jwt.ts` | Geração e verificação de tokens | `signToken()`, `verifyToken()`, `JWTPayload` |
| `password.ts` | Hash e verificação de senhas | `hashPassword()`, `verifyPassword()` |
| `rbac.ts` | Controle de acesso baseado em roles | `getAuthUser()`, `hasRole()`, `canAccessTerritory()` |

#### Database (`src/lib/db/`)

| Módulo | Função |
|--------|--------|
| `index.ts` | Conexão Drizzle + Neon Serverless |
| `schema/users.ts` | Schema de usuários (autenticação) |
| `schema/members.ts` | Schema de membros (filiados) |
| `schema/nuclei.ts` | Schema de núcleos |
| `schema/finances.ts` | Schema de contribuições |
| `schema/index.ts` | Re-exportação de todos schemas |

## 🔐 Sistema de Autenticação e Autorização

### Fluxo de Autenticação

```
┌─────────┐    ┌─────────────┐    ┌──────────┐    ┌──────────┐
│ Cliente │───▶│ POST /login │───▶│ Valida   │───▶│ Gera JWT │
│         │    │             │    │ Senha    │    │          │
└─────────┘    └─────────────┘    └──────────┘    └──────────┘
                                                        │
                                                        ▼
                                                  ┌──────────┐
                                                  │ Response │
                                                  │ + Cookie │
                                                  └──────────┘
```

### Níveis de Acesso (RBAC)

```typescript
type UserRole = 
  | 'national_admin'    // Acesso total ao sistema
  | 'state_leader'      // Acesso limitado ao estado
  | 'municipal_leader'  // Acesso limitado à cidade
  | 'member';           // Acesso aos próprios dados
```

### Controle Territorial

O campo `territoryScope` define o escopo de acesso:
- **Formato**: `"ESTADO:CIDADE"` (ex: `"SP:São Paulo"`)
- **Nacional**: Sem restrições (scope vazio ou null)
- **Estadual**: Filtra por estado
- **Municipal**: Filtra por estado + cidade

```typescript
// Exemplo de verificação
const canAccess = canAccessTerritory(
  user.role,
  user.territoryScope,
  member.state,
  member.city
);
```

## 📊 Schemas do Banco de Dados

### Users (Autenticação)

```typescript
{
  id: uuid,
  email: string (unique),
  passwordHash: string,
  role: enum('national_admin', 'state_leader', 'municipal_leader', 'member'),
  territoryScope: string | null,  // "SP:São Paulo"
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Members (Filiados)

```typescript
{
  id: uuid,
  // Dados pessoais
  fullName: string,
  cpf: string (unique),
  birthDate: date,
  email: string,
  phone: string,
  
  // Dados territoriais
  state: string,
  city: string,
  neighborhood: string,
  nucleusId: uuid | null,
  
  // Status
  status: enum('pending', 'active', 'inactive', 'suspended'),
  membershipDate: date,
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Nuclei (Núcleos)

```typescript
{
  id: uuid,
  name: string,
  type: enum('territorial', 'thematic'),
  state: string,
  city: string,
  coordinatorId: uuid | null,
  status: enum('active', 'inactive', 'forming'),
  createdAt: timestamp
}
```

## 🎨 Design Patterns Utilizados

### 1. Server Components First
- Componentes são Server Components por padrão
- `"use client"` apenas quando necessário (interatividade)
- Dados carregados no servidor reduzem waterfall

### 2. Colocation
- Arquivos relacionados ficam juntos
- Actions próximas às pages que as utilizam
- Schemas agrupados por domínio

### 3. Composition over Inheritance
- Componentes UI compostos via props
- Slots e children para flexibilidade
- Props interfaces bem definidas

### 4. Repository Pattern (implícito)
- Drizzle abstrai acesso ao banco
- Server Actions encapsulam operações

## 🌐 Dependências Externas

| Serviço | Função | Considerações |
|---------|--------|---------------|
| **Neon** | PostgreSQL Serverless | Cold starts ~50-100ms, pool de conexões |
| **Vercel** | Hosting/Deploy | Edge Functions, limites de execução |

## ⚠️ Decisões Arquiteturais e Trade-offs

### Por que Next.js App Router?

**Prós**:
- Server Components para performance
- Server Actions simplificam mutações
- Routing file-based intuitivo
- Streaming e Suspense nativos

**Contras**:
- Ecossistema ainda amadurecendo
- Complexidade adicional no mental model
- Algumas limitações com bibliotecas client-only

### Por que Drizzle ORM?

**Prós**:
- Type-safe end-to-end
- SQL transparente (sem magic)
- Performance excelente
- Migrations declarativas

**Contras**:
- Menor ecossistema que Prisma
- Menos abstrações automáticas

### Por que JWT em vez de Sessions?

**Prós**:
- Stateless, escala horizontalmente
- Funciona bem com edge functions
- Sem necessidade de store de sessão

**Contras**:
- Revogação mais complexa
- Token maior no payload

## 📈 Considerações de Performance

1. **Conexões de Banco**: Usar pool do Neon Serverless
2. **Caching**: Aproveitar Next.js cache (`unstable_cache`)
3. **Streaming**: Usar Suspense para loading states
4. **Bundle Size**: Lazy load componentes pesados

## 📚 Recursos Relacionados

- [Visão Geral do Projeto](./project-overview.md)
- [Glossário de Termos](./glossary.md)
- [Segurança](./security.md)

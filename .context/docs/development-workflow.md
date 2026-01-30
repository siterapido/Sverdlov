---
status: filled
generated: 2026-01-18
---

# Workflow de Desenvolvimento

Guia para contribuidores do projeto Sverdlov.

## 🔧 Configuração do Ambiente

### Pré-requisitos

- Node.js 20+
- npm ou pnpm
- Conta no Neon (PostgreSQL)
- Editor com suporte TypeScript (VS Code recomendado)

### Setup Inicial

```bash
# 1. Clone o repositório
git clone <repo-url>
cd sverdlov

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.local.example .env.local

# 4. Edite .env.local com suas credenciais
# DATABASE_URL=postgresql://...
# JWT_SECRET=your-secret-key

# 5. Aplique o schema do banco
npm run db:push

# 6. Inicie o servidor de desenvolvimento
npm run dev
```

## 📋 Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| `dev` | `npm run dev` | Servidor de desenvolvimento (hot reload) |
| `build` | `npm run build` | Build de produção |
| `start` | `npm run start` | Servidor de produção |
| `lint` | `npm run lint` | Verificação ESLint |
| `test` | `npm run test` | Executa testes com Vitest |
| `db:generate` | `npm run db:generate` | Gera migrations do Drizzle |
| `db:push` | `npm run db:push` | Aplica schema ao banco |
| `db:studio` | `npm run db:studio` | Abre Drizzle Studio (GUI do banco) |

## 📁 Estrutura de Pastas

### Onde colocar novos arquivos

| Tipo de Arquivo | Localização |
|-----------------|-------------|
| Nova página | `src/app/(protected)/[nome-pagina]/page.tsx` |
| Componente UI base | `src/components/ui/` |
| Componente de feature | `src/components/[feature]/` |
| Server Action | `src/app/actions/` |
| API Route | `src/app/api/[endpoint]/route.ts` |
| Hook customizado | `src/hooks/` |
| Schema do banco | `src/lib/db/schema/` |
| Utilitário de auth | `src/lib/auth/` |

## 🎯 Convenções de Código

### Nomenclatura

- **Componentes**: PascalCase (`MemberForm.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useIsMobile.ts`)
- **Utils/Helpers**: camelCase (`formatDate.ts`)
- **Schemas**: camelCase singular (`members.ts`)

### Componentes

```tsx
// ✅ Pattern recomendado
interface ComponentNameProps {
  prop1: string;
  prop2?: number;
}

export function ComponentName({ prop1, prop2 = 10 }: ComponentNameProps) {
  return <div>{/* ... */}</div>;
}
```

### Server Actions

```typescript
// ✅ Pattern recomendado
'use server';

import { db } from '@/lib/db';
import { members } from '@/lib/db/schema';

export async function getMembers() {
  return db.select().from(members);
}
```

## 🔄 Fluxo de Trabalho Git

### Branches

- `main` - Produção (protegida)
- `develop` - Desenvolvimento integrado
- `feature/*` - Novas funcionalidades
- `fix/*` - Correções de bugs
- `hotfix/*` - Correções urgentes em produção

### Commits

Seguir o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: adiciona formulário de filiação
fix: corrige validação de CPF
docs: atualiza README com instruções de deploy
refactor: extrai lógica de auth para hook
test: adiciona testes para MemberForm
```

## 🧪 Testes

```bash
# Executar todos os testes
npm run test

# Modo watch (desenvolvimento)
npm run test -- --watch

# Com coverage
npm run test -- --coverage
```

### Estrutura de Testes

```
src/
├── components/
│   └── members/
│       ├── MemberForm.tsx
│       └── MemberForm.test.tsx  # ✅ Teste junto ao componente
└── lib/
    └── auth/
        ├── jwt.ts
        └── jwt.test.ts
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte o repositório ao Vercel
2. Configure as Environment Variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_APP_URL`
3. Deploy automático a cada push na `main`

### Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `DATABASE_URL` | URL de conexão Neon PostgreSQL | ✅ |
| `JWT_SECRET` | Chave secreta para tokens JWT | ✅ |
| `NEXT_PUBLIC_APP_URL` | URL pública da aplicação | ❌ |

## 🔍 Debugging

### Drizzle Studio

```bash
npm run db:studio
```

Abre interface visual para explorar e editar dados do banco.

### Next.js DevTools

- Use `console.log` em Server Components (aparece no terminal)
- Use React DevTools para Client Components
- Verifique a aba Network para API calls

## 📚 Recursos Úteis

- [Next.js App Router Docs](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)

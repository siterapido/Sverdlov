---
status: filled
generated: 2026-01-18
---

# Ferramentas e Produtividade

Guia de ferramentas utilizadas no desenvolvimento do Sverdlov.

## 🛠️ Ferramentas Essenciais

### Editor / IDE

**VS Code** (recomendado) com extensões:

| Extensão | Propósito |
|----------|-----------|
| ESLint | Linting em tempo real |
| Tailwind CSS IntelliSense | Autocomplete Tailwind |
| Prettier | Formatação de código |
| TypeScript Importer | Auto-import de tipos |
| Prisma/Drizzle | Syntax highlight SQL |

### CLI Tools

```bash
# Node Version Manager (recomendado)
nvm use 20

# Verificar versões
node --version  # v20.x
npm --version   # 10.x
```

## 📦 Package Manager

O projeto usa **npm** como package manager padrão.

```bash
# Instalar dependências
npm install

# Adicionar nova dependência
npm install package-name

# Adicionar dev dependency
npm install -D package-name

# Atualizar dependências
npm update
```

## 🗄️ Drizzle Kit

CLI do Drizzle ORM para gerenciar banco de dados.

### Comandos Principais

```bash
# Gerar migration a partir do schema
npm run db:generate

# Aplicar schema ao banco (sync direto)
npm run db:push

# Abrir interface visual do banco
npm run db:studio
```

### Drizzle Studio

Interface visual para explorar e editar dados:

```bash
npm run db:studio
# Abre em https://local.drizzle.studio
```

**Features**:
- Visualizar tabelas e dados
- Executar queries SQL
- Editar registros diretamente
- Exportar dados

## 🧪 Vitest

Framework de testes rápido e moderno.

```bash
# Executar testes
npm run test

# Modo watch
npm run test -- --watch

# Com UI interativa
npm run test -- --ui

# Coverage
npm run test -- --coverage
```

## 🔍 ESLint

Configurado para Next.js + TypeScript.

```bash
# Verificar erros
npm run lint

# Auto-fix quando possível
npm run lint -- --fix
```

### Configuração

```javascript
// eslint.config.mjs
export default [
  {
    rules: {
      // Customizações aqui
    }
  }
];
```

## 🎨 Tailwind CSS 4

Framework CSS utility-first.

### Configuração

O Tailwind CSS 4 usa configuração via CSS:

```css
/* globals.css */
@import "tailwindcss";

@theme {
  --color-primary: #2383e2;
  /* ... customizações */
}
```

### Classes Úteis

```html
<!-- Layout -->
<div class="flex items-center justify-between">

<!-- Spacing -->
<div class="p-4 m-2 gap-4">

<!-- Typography -->
<p class="text-lg font-semibold text-gray-900">

<!-- Responsive -->
<div class="hidden md:block lg:flex">
```

## 🚀 Next.js CLI

```bash
# Desenvolvimento (hot reload)
npm run dev

# Build de produção
npm run build

# Analisar bundle
ANALYZE=true npm run build

# Servidor de produção
npm run start
```

## 🔧 Git Hooks (Opcional)

Configurar com Husky para validações automáticas:

```bash
# Instalar husky
npm install -D husky

# Inicializar
npx husky init

# Pre-commit hook
echo "npm run lint && npm run test" > .husky/pre-commit
```

## 📝 Scripts Customizados

Adicionar no `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

## 🌐 Browser DevTools

### React DevTools
- Inspecionar component tree
- Ver props e state
- Profile performance

### Next.js DevTools
- Network tab para API calls
- Console para Server Component logs
- Application tab para cookies/storage

## 📚 Recursos

- [VS Code Tips for React](https://code.visualstudio.com/docs/nodejs/reactjs-tutorial)
- [Drizzle Kit CLI](https://orm.drizzle.team/kit-docs/overview)
- [Vitest Guide](https://vitest.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

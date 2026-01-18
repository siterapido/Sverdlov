---
status: filled
generated: 2026-01-18
---

# Estratégia de Testes

Documentação da abordagem de testes para o projeto Sverdlov.

## 🎯 Filosofia de Testes

O Sverdlov adota uma abordagem pragmática de testes:

1. **Testes de integração** para fluxos críticos de negócio
2. **Testes unitários** para lógica complexa isolada
3. **Testes E2E** para fluxos completos do usuário (futuro)

## 🛠️ Stack de Testes

| Ferramenta | Propósito |
|------------|-----------|
| **Vitest** | Test runner e assertions |
| **React Testing Library** | Testes de componentes (futuro) |
| **Playwright** | Testes E2E (futuro) |

## 📁 Organização dos Testes

### Estrutura Recomendada

```
src/
├── components/
│   └── members/
│       ├── MemberForm.tsx
│       └── MemberForm.test.tsx    # Testes junto ao componente
├── lib/
│   └── auth/
│       ├── jwt.ts
│       └── jwt.test.ts
└── __tests__/                      # Testes de integração
    ├── api/
    │   └── members.test.ts
    └── flows/
        └── filiacao.test.ts
```

## 🧪 Tipos de Testes

### Testes Unitários

Para lógica pura e funções utilitárias:

```typescript
// src/lib/auth/jwt.test.ts
import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from './jwt';

describe('JWT', () => {
  it('should sign and verify a token', async () => {
    const payload = { userId: '123', email: 'test@example.com', role: 'member' };
    const token = await signToken(payload);
    const verified = await verifyToken(token);
    
    expect(verified.userId).toBe('123');
  });

  it('should reject expired tokens', async () => {
    // ...
  });
});
```

### Testes de Componentes

Para React components com lógica:

```typescript
// src/components/members/MemberForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MemberForm } from './MemberForm';

describe('MemberForm', () => {
  it('should validate required fields', async () => {
    render(<MemberForm onSubmit={jest.fn()} />);
    
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));
    
    expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
  });
});
```

### Testes de API

Para API routes e Server Actions:

```typescript
// __tests__/api/members.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { getMembers } from '@/app/actions/members';

describe('Members API', () => {
  beforeEach(async () => {
    // Setup: criar dados de teste
  });

  it('should list members with pagination', async () => {
    const result = await getMembers({ page: 1, limit: 10 });
    
    expect(result).toHaveLength(10);
  });
});
```

## 🏃 Executando Testes

```bash
# Executar todos os testes
npm run test

# Modo watch (re-executa ao salvar)
npm run test -- --watch

# Com coverage report
npm run test -- --coverage

# Executar arquivo específico
npm run test -- src/lib/auth/jwt.test.ts

# Executar testes que matcha nome
npm run test -- --grep "JWT"
```

## 📊 Coverage Goals

| Área | Meta | Prioridade |
|------|------|------------|
| `lib/auth/*` | 90%+ | 🔴 Alta |
| `lib/db/*` | 80%+ | 🔴 Alta |
| `app/actions/*` | 80%+ | 🟡 Média |
| `components/*` | 60%+ | 🟡 Média |
| `app/(pages)/*` | 40%+ | 🟢 Baixa |

## 🎭 Mocking

### Banco de Dados

Para testes que precisam do banco:

```typescript
// vitest.setup.ts
import { beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db';

beforeEach(async () => {
  // Usar transação para rollback automático
  await db.execute('BEGIN');
});

afterEach(async () => {
  await db.execute('ROLLBACK');
});
```

### Fetch / APIs Externas

```typescript
import { vi } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn().mockReturnValue({ value: 'mock-jwt-token' }),
  }),
}));
```

## ✅ Checklist de Testes

### Antes de PR

- [ ] Todos os testes passando (`npm run test`)
- [ ] Coverage não diminuiu
- [ ] Novas features têm testes
- [ ] Testes são determinísticos (não flaky)

### O que testar

✅ **Sempre testar**:
- Funções de autenticação
- Validações de dados
- Lógica de RBAC
- Cálculos e transformações de dados

⚠️ **Considerar testar**:
- Componentes com lógica complexa
- Integrações com serviços externos
- Fluxos críticos de usuário

❌ **Evitar testar**:
- Componentes apenas de layout
- Código do framework (Next.js, React)
- Bibliotecas de terceiros

## 📚 Recursos

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Next.js Apps](https://nextjs.org/docs/testing)

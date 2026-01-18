---
status: filled
generated: 2026-01-18
---

# Segurança

Documentação das práticas de segurança implementadas no Sverdlov.

## 🔐 Autenticação

### JWT (JSON Web Tokens)

O sistema utiliza JWT para autenticação stateless:

```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  territoryScope: string | null;
  exp: number;
}
```

**Implementação**:
- Biblioteca: `jose` (compatível com Edge Runtime)
- Algoritmo: HS256
- Expiração: Configurável via código (padrão: 7 dias)

**Boas práticas implementadas**:
- ✅ Token armazenado em httpOnly cookie
- ✅ Token não exposto ao JavaScript do cliente
- ✅ Verificação de expiração em cada request
- ✅ Payload mínimo (sem dados sensíveis)

### Passwords

**Algoritmo**: bcryptjs  
**Salt Rounds**: 10 (padrão)

```typescript
// Hash seguro
const hash = await hashPassword(plainTextPassword);

// Verificação timing-safe
const isValid = await verifyPassword(plainText, hash);
```

## 🛡️ Autorização (RBAC)

### Roles do Sistema

| Role | Descrição | Escopo |
|------|-----------|--------|
| `national_admin` | Administrador Nacional | Acesso total |
| `state_leader` | Liderança Estadual | Estado específico |
| `municipal_leader` | Liderança Municipal | Cidade específica |
| `member` | Membro | Próprios dados |

### Territory Scope

O campo `territoryScope` limita o acesso geográfico:

```
"SP"              → Acesso a todo estado de SP
"SP:São Paulo"    → Acesso apenas a São Paulo/SP
null              → Acesso nacional (só para national_admin)
```

### Verificação de Acesso

```typescript
// Em API Routes e Server Actions
const user = await getAuthUser(request);

if (!hasRole(user, ['national_admin', 'state_leader'])) {
  return new Response('Forbidden', { status: 403 });
}

if (!canAccessTerritory(user.role, user.scope, memberState, memberCity)) {
  return new Response('Forbidden', { status: 403 });
}
```

## 🔒 Proteção de Rotas

### Route Groups

```
src/app/
├── (public)/          # Rotas públicas (sem autenticação)
│   └── filie-se/      # Formulário de filiação
├── (protected)/       # Rotas protegidas
│   ├── dashboard/
│   ├── members/
│   └── ...
└── api/
    ├── auth/          # Endpoints públicos
    └── members/       # Endpoints protegidos
```

### Middleware

O middleware Next.js verifica autenticação em rotas protegidas:

1. Verifica presença do cookie JWT
2. Valida signature e expiração
3. Redireciona para login se inválido
4. Injeta user info no request

## 🛡️ Proteção contra Ataques

### CSRF (Cross-Site Request Forgery)

- Server Actions: Proteção nativa do Next.js
- API Routes: Verificação de Origin header

### XSS (Cross-Site Scripting)

- React escapa conteúdo por padrão
- Evitar `dangerouslySetInnerHTML`
- CSP headers configurados

### SQL Injection

- Drizzle ORM: Queries parametrizadas
- Nunca concatenar SQL manualmente

```typescript
// ✅ Seguro - Drizzle parametriza automaticamente
const result = await db
  .select()
  .from(members)
  .where(eq(members.email, userInput));

// ❌ NUNCA fazer isso
// db.execute(`SELECT * FROM members WHERE email = '${userInput}'`)
```

### Rate Limiting

Recomendado implementar via:
- Vercel Edge Config
- Upstash Redis rate limiter
- Middleware customizado

## 🔑 Variáveis de Ambiente

### Segredos Sensíveis

| Variável | Descrição | Exposição |
|----------|-----------|-----------|
| `DATABASE_URL` | Conexão do banco | ❌ Servidor only |
| `JWT_SECRET` | Chave de assinatura JWT | ❌ Servidor only |

### Boas Práticas

1. **Nunca commitar `.env.local`**
2. **Usar secrets diferentes por ambiente** (dev, staging, prod)
3. **Rotacionar secrets regularmente**
4. **Usar Vercel/Neon para gerenciar secrets em produção**

## 📋 Checklist de Segurança

### Antes de Deploy

- [ ] Verificar que `.env.local` está no `.gitignore`
- [ ] JWT_SECRET é uma string longa e aleatória
- [ ] DATABASE_URL usa SSL (`?sslmode=require`)
- [ ] Não há logs de dados sensíveis

### Review de Código

- [ ] Inputs do usuário são validados (Zod)
- [ ] Queries usam ORM (não SQL raw)
- [ ] Autenticação verificada em endpoints sensíveis
- [ ] RBAC aplicado corretamente

## 🚨 Resposta a Incidentes

1. **Credential Leak**: Rotacionar imediatamente JWT_SECRET e database password
2. **Suspected Breach**: Invalidar todas as sessões (mudar JWT_SECRET)
3. **SQL Injection Found**: Patch imediato + audit de logs

## 📚 Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [Neon Security](https://neon.tech/docs/security)

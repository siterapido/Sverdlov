---
status: filled
generated: 2026-01-18
---

# Glossário de Termos

Definições de termos específicos do domínio e tecnológicos utilizados no projeto Sverdlov.

## 📌 Termos do Domínio

### Filiado / Membro
Pessoa cadastrada na organização através do processo de filiação. Possui dados pessoais, territoriais e status de militância registrados.

### Filiação
Processo de adesão formal à organização. Inicia-se no formulário público (`/filie-se`) e segue por um pipeline de aprovação.

### Núcleo
Unidade organizativa básica da estrutura. Pode ser:
- **Territorial**: Baseado em localização geográfica (bairro, cidade)
- **Temático**: Baseado em área de atuação (educação, saúde, cultura)

### Nucleação
Processo de formação de novos núcleos e organização dos membros dentro deles.

### Contribuição
Pagamento financeiro regular feito pelos membros para sustentação da organização.

### Territory Scope
Escopo territorial que define o alcance de acesso de um usuário no sistema. Formato: `"ESTADO:CIDADE"` ou apenas `"ESTADO"`.

### RBAC (Role-Based Access Control)
Sistema de controle de acesso baseado em papéis. Define o que cada tipo de usuário pode fazer no sistema.

---

## 🛠️ Termos Técnicos

### App Router
Sistema de roteamento do Next.js 13+ baseado em estrutura de pastas. Suporta Server Components, layouts aninhados e Server Actions.

### Server Component
Componente React que executa apenas no servidor. Pode acessar banco de dados diretamente e não aumenta o bundle do cliente.

### Client Component
Componente React que executa no navegador. Necessário para interatividade (hooks, eventos). Marcado com `"use client"`.

### Server Action
Função assíncrona que executa no servidor, chamada diretamente de componentes cliente. Substitui API routes para mutações simples.

### Route Handler (API Route)
Endpoint HTTP definido em arquivo `route.ts`. Usado para APIs RESTful e webhooks.

### Route Groups
Pastas com parênteses `(nome)` que organizam rotas sem afetar a URL. Ex: `(protected)` agrupa rotas que precisam de autenticação.

### Drizzle ORM
ORM TypeScript type-safe para SQL. Gera queries otimizadas e oferece migrations declarativas.

### Neon
Serviço de PostgreSQL serverless com pool de conexões e escalonamento automático.

### JWT (JSON Web Token)
Token compacto e auto-contido para transmitir informações de autenticação de forma segura entre partes.

### Edge Runtime
Ambiente de execução leve compatível com edge functions (Vercel Edge, Cloudflare Workers). Tem APIs limitadas mas baixa latência.

### Tailwind CSS
Framework CSS utility-first. Classes como `flex`, `p-4`, `text-lg` são aplicadas diretamente no HTML.

### Framer Motion
Biblioteca de animações para React. Usa componentes como `<motion.div>` com props declarativas.

---

## 📊 Entities do Sistema

### User
Registro de autenticação. Contém email, senha hashada, role e territory scope.

### Member
Registro de filiado. Contém dados pessoais, territoriais, status e vínculo com núcleo.

### Nucleus (plural: Nuclei)
Registro de núcleo. Contém nome, tipo, localização e coordenador.

### Finance
Registro de contribuição financeira. Contém valor, data, método de pagamento e membro associado.

---

## 🔗 Siglas

| Sigla | Significado |
|-------|-------------|
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete |
| CSS | Cascading Style Sheets |
| JWT | JSON Web Token |
| ORM | Object-Relational Mapping |
| RBAC | Role-Based Access Control |
| SQL | Structured Query Language |
| SSR | Server-Side Rendering |
| UI | User Interface |
| UX | User Experience |

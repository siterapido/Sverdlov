# Sverdlov - Plataforma de Gestão da Unidade Popular

Plataforma de gestão de filiação, finanças e nucleação da Unidade Popular, inspirada no design do Notion.

## 🚀 Início Rápido

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com suas credenciais do Neon

# Executar migrations do banco
npm run db:push

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

## 📦 Stack Tecnológica

- **Framework**: Next.js 14+ (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS 4
- **Animações**: Framer Motion
- **Banco de Dados**: Neon PostgreSQL (Serverless)
- **ORM**: Drizzle ORM
- **Autenticação**: JWT (jose) + bcryptjs

## 🏗️ Estrutura do Projeto

```
sverdlov/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/          # Rotas públicas
│   │   │   └── filie-se/      # Formulário de filiação
│   │   ├── (protected)/       # Rotas protegidas
│   │   │   ├── dashboard/     # Dashboard com KPIs
│   │   │   └── members/       # Gestão de membros
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Autenticação
│   │   │   └── members/       # CRUD de membros
│   │   └── globals.css        # Design system Notion
│   ├── components/
│   │   ├── ui/                # Componentes base
│   │   └── members/           # Componentes de membros
│   └── lib/
│       ├── db/                # Drizzle ORM + Schemas
│       │   └── schema/        # Schemas do banco
│       └── auth/              # JWT + RBAC
├── drizzle/                   # Migrations
└── package.json
```

## 🗄️ Schemas do Banco de Dados

### Users (Autenticação)
- Roles: `national_admin`, `state_leader`, `municipal_leader`, `member`
- Territory scope para controle de acesso

### Members (Membros)
- Informações pessoais (nome, CPF, data de nascimento)
- Dados territoriais (estado, cidade, bairro, núcleo)
- Informações políticas (status, militância)
- Dados financeiros

### Finances (Contribuições)
- Registro de contribuições
- Métodos de pagamento
- Integração com Asaas (preparada)

### Nuclei (Núcleos)
- Tipos: territorial ou temático
- Status do núcleo
- Coordenador

## 🔐 Autenticação e Autorização

### Níveis de Acesso (RBAC)

1. **Administrador Nacional**: Acesso total
2. **Liderança Estadual**: Acesso ao estado
3. **Liderança Municipal**: Acesso à cidade
4. **Membro**: Acesso aos próprios dados

### Controle Territorial

O sistema implementa controle de acesso baseado em território através do campo `territoryScope`:
- Formato: `"ESTADO:CIDADE"` (ex: `"SP:São Paulo"`)
- Administradores nacionais não têm restrições
- Lideranças têm acesso limitado ao seu território

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro de usuários
- `POST /api/auth/login` - Login

### Membros
- `GET /api/members` - Listar membros
- `POST /api/members` - Criar membro

## 🎨 Design System

Interface inspirada no Notion com:
- Paleta de cores neutra com azul primário (#2383e2)
- Tipografia Inter
- Animações suaves com Framer Motion
- Componentes reutilizáveis

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linter
npm run db:generate  # Gerar migrations
npm run db:push      # Aplicar migrations
npm run db:studio    # Drizzle Studio
```

## 🌐 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Variáveis de Ambiente

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 📋 Funcionalidades Implementadas

- ✅ Autenticação JWT com RBAC
- ✅ Gestão de membros (CRUD)
- ✅ Formulário público de filiação
- ✅ Dashboard com KPIs
- ✅ Design system Notion-inspired
- ✅ Animações com Framer Motion

## 🚧 Próximos Passos

- [ ] Pipeline de filiação (Kanban)
- [ ] Pipeline de nucleação
- [ ] Gestão financeira completa
- [ ] Integração com Asaas/PIX
- [ ] Relatórios e analytics
- [ ] Logs de auditoria

## 📄 Licença

Projeto da Unidade Popular

---

**Sverdlov** - Organização, disciplina e trabalho estruturado para construir uma organização política de massas. 🚩

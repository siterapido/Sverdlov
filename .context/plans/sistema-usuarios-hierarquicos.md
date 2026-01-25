---
status: in_progress
generated: 2026-01-22
agents:
  - type: "architect-specialist"
    role: "Define data model for hierarchy, permissions logic, and admin dashboard architecture"
  - type: "backend-specialist"
    role: "Implement schema changes, migrations, and permission middleware/logic"
  - type: "frontend-specialist"
    role: "Build Admin Dashboard and update Nucleus views with hierarchy filters"
  - type: "test-writer"
    role: "Create tests for permission scopes and hierarchy logic"
docs:
  - "src/lib/db/schema"
  - "src/lib/auth"
  - "src/app/(protected)/members/nuclei/page.tsx"
---

# Plano: Sistema de Usuários Hierárquicos e Gestão de Núcleos

## Objetivo
Implementar um sistema robusto de controle de acesso hierárquico para a gestão de núcleos, definindo papéis (roles) com escopos geográficos específicos (Estadual, Municipal, Zonal, Local) e criando um painel administrativo para gestão desses usuários.

## Escopo Hierárquico
O sistema deve suportar os seguintes níveis de permissão, onde cada nível superior herda visualização/edição dos níveis inferiores dentro de sua jurisdição:

1.  **Admin Geral**: Acesso total a todo o sistema e painel exclusivo de administração de usuários.
2.  **Coordenador Estadual**: Gere todos os núcleos de um estado específico.
3.  **Coordenador Municipal**: Gere todos os núcleos de um município específico.
4.  **Coordenador Zonal**: Gere núcleos de uma zona específica dentro de um município.
5.  **Coordenador Local**: Gere apenas o seu núcleo específico.

## Fases de Implementação

### Phase 1: Modelagem de Dados e Backend (Architecture & DB)
**Objetivo**: Estruturar o banco de dados para suportar roles e jurisdições.

1.  **Schema Update**:
    - Adicionar enum/tabela de `UserRole`: `['ADMIN', 'STATE_COORD', 'CITY_COORD', 'ZONE_COORD', 'LOCAL_COORD']`.
    - Adicionar colunas de jurisdição na tabela de `users` (ou tabela vinculada `user_permissions`):
        - `scope_state` (UF)
        - `scope_city` (City ID/Name)
        - `scope_zone` (Zone ID)
        - `scope_nucleus_id` (Nucleus ID - foreign key)
    - *Nota*: Validar se usamos tabela `users` local ou metadata do provedor de auth (ex: Clerk). Recomendado: Tabela local sincronizada ou extendida para queries relacionais rápidas.

2.  **Permission Logic (Service Layer)**:
    - Criar utilitário `getUserScope(userId)` que retorna o filtro de query aplicável.
    - Implementar função `canAccessNucleus(user, nucleus)` para validação unitária.
    - Criar ou atualizar queries de busca de núcleos (`getNuclei`) para aceitar um contexto de usuário e aplicar filtros automáticos (WHERE state = X, WHERE city = Y, etc.).

3.  **Middleware/Auth Actions**:
    - Garantir que a sessão do usuário carregue essas permissões.

### Phase 2: Dashboard Administrativo (Frontend)
**Objetivo**: Interface para o Admin criar e gerenciar coordenadores.

1.  **Admin Layout**:
    - Criar rota `/admin` (protegida, apenas role=ADMIN).
    - Criar Sidebar ou Menu item visível apenas para Admin.

2.  **User Management Interface**:
    - **Listagem**: Tabela de usuários com filtros por Role.
    - **Criação/Edição**:
        - Formulário para definir E-mail/Nome.
        - **Seletor de Role**: Dropdown dinâmico.
        - **Configuração de Jurisdição**: Campos condicionais.
            - Se `STATE_COORD` -> Mostra Select de Estado.
            - Se `CITY_COORD` -> Mostra Select de Estado + Select de Cidade.
            - Se `LOCAL_COORD` -> Mostra busca de Núcleo.

3.  **Server Actions**:
    - `createUser({ ...data, role, scope })`: Validar consistência (não criar Coord Municipal sem definir município).
    - `updateUserRole`: Permitir promoção/rebaixamento e mudança de escopo.

### Phase 3: Integração com Módulo de Núcleos (Access Control)
**Objetivo**: Aplicar as regras de visualização na interface existente de núcleos.

1.  **Refatorar Data Fetching de Núcleos**:
    - Atualizar a página `src/app/(protected)/members/nuclei` e seus componentes filhos.
    - Substituir chamadas diretas ao DB por chamadas que injetam o escopo do usuário logado.
    - Exemplo: `db.query.nuclei.findMany({ where: userScopeFilter })`.

2.  **UI Adaptativa**:
    - Um Coord Estadual vendo a lista deve ver filtros relevantes ao seu estado (ex: filtrar por cidades do seu estado).
    - Botões de "Criar Núcleo":
        - Coord Local: Provavelmente não pode criar novos núcleos (apenas editar o seu).
        - Coord Municipal: Pode criar núcleos dentro do seu município.
        - Validar essas regras de negócio na UI (desabilitar botões) e no Backend (rejeitar actions).

### Phase 4: Validação e Testes
**Objetivo**: Garantir que o isolamento de dados funciona (segurança).

1.  **Testes de Permissão**:
    - Criar usuários de teste para cada nível.
    - Verificar se Coord de SP *não* vê núcleos do RJ.
    - Verificar se Coord Local A *não* edita Núcleo B.
2.  **Testes de Admin**:
    - Criar fluxo completo de criação de um coordenador e login com esse novo usuário.
	
## Critérios de Sucesso
- [ ] Tabela de usuários reflete hierarquia correta.
- [ ] Dashboard Admin funcional permitindo atribuição de papéis.
- [ ] Coordenadores acessam apenas dados de sua jurisdição.
- [ ] Tentativas de acesso não autorizado são bloqueadas.

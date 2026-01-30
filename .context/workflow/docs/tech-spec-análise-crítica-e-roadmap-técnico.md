# Análise Crítica e Roadmap Técnico - Sverdlov

## Contexto Atual
O projeto Sverdlov possui uma base sólida em **Next.js 15 (App Router)** com **Drizzle ORM** e **Tailwind CSS**. A arquitetura visual segue um estilo "Brutalist/Neo-modernist" inspirado no Notion/Design System moderno.

### Estado dos Módulos (Jan/2026)
| Módulo | Estado de Dados (DB) | Estado de Lógica (Actions) | Estado de UI |
| :--- | :--- | :--- | :--- |
| **Membros** | Completo (Schema robusto) | Básico (CRUD e Import) | Parcial (Listagem e Cadastro Público) |
| **Financeiro** | Avançado (Planos e Contribuições) | Parcial (Gestão de Planos) | Mínimo (Apenas Gestão de Planos) |
| **Núcleos** | Básico (Tabela criada) | Inexistente | Inexistente |
| **Calendário** | Muito Avançado (Escalas e Turnos) | Inexistente | Placeholder |

---

## Análise Crítica de Gaps

### 1. Desconexão entre "Filie-se" e "Núcleos"
O formulário de filiação atual é agnóstico à estrutura territorial. O filiado cai no sistema mas não é automaticamente triado para um núcleo ou responsável político.
*   **Risco:** Acúmulo de dados sem ação.
*   **Solução:** Implementar fluxo de triagem (Approval Workflow).

### 2. Complexidade do Calendário vs Execução
O schema de `schedules.ts` prevê controle de disponibilidade e exceções (`member_availability`, `schedule_exceptions`). Isso é excelente para organizações de alta disciplina, mas complexo de implementar na UI.
*   **Risco:** O módulo ser complexo demais para os usuários e cair em desuso.
*   **Solução:** Implementar em fases, começando por um Calendário de Eventos simples, evoluindo para Escalas de Turnos.

### 3. Lacuna de Tesouraria
O sistema permite criar planos, mas não há um "Extrato" ou "Fluxo de Caixa" que consolide as contribuições de todos os membros.
*   **Risco:** Falta de visibilidade financeira global.

---

## Roadmap de Implementação (Novos Planos)

### [Módulo A] Gestão de Núcleos e Territorialidade
**Prioridade:** Alta (Essencial para organização)
*   **DB:** Já possui schema.
*   **Actions:** `getNuclei`, `createNucleus`, `assignMemberToNucleus`.
*   **UI:** Tela de listagem de núcleos e Dashboard de Núcleo.

### [Módulo B] Calendário e Escalas Operacionais
**Prioridade:** Média (Diferencial competitivo)
*   **DB:** Já possui schema avançado.
*   **Actions:** `createSchedule`, `generateSlots`, `assignToSlot`.
*   **UI:** Visualização mensal/semanal (usando `react-day-picker` ou similar) e fluxo de check-in.

### [Módulo C] Tesouraria e Dashboard Financeiro
**Prioridade:** Alta (Saúde financeira)
*   **DB:** Expandir para suportar `expenses` (despesas) além de `finances` (receitas).
*   **Actions:** Relatórios consolidados por mês/ano.
*   **UI:** Dashboard financeiro com gráficos de arrecadação.

---

## Próximos Passos
1. Validar Roadmap com o usuário.
2. Criar os planos de implementação individuais via `ai-context`.

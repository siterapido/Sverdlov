# Escola de Trabalho

## Visão Geral
O módulo **Escola de Trabalho** gerencia a alocação de militantes em tarefas de diversos projetos da organização. O sistema cruza a disponibilidade dos voluntários com a demanda das tarefas.

## Regras de Negócio

### 1. Militantes
- Podem ser **Voluntários** ou **Profissionais**.
- Possuem disponibilidade definida por dia da semana e turno (Manhã, Tarde, Noite).
- Habilidades são textos livres (ex: "design", "motorista").

### 2. Projetos e Tarefas
- Projetos agrupam tarefas (ex: "Jornal A Verdade", "Cozinha Solidária").
- Tarefas têm frequência (semanal, pontual, etc) e podem ter dia/turno pré-fixados.

### 3. Escalas (Alocação)
- Uma escala conecta um **Militante** a uma **Tarefa** em um **Dia/Turno** específico.
- O sistema deve sugerir militantes disponíveis para o turno da tarefa.

## Arquitetura
- **Banco de Dados:** Tabelas prefixadas com `et_` (et_militantes, et_escalas...).
- **Frontend:** Componentes modulares em `src/components/escola/`.
- **State Management:** Server Actions (`src/app/actions/escola.ts`) com `useTransition` no cliente.

## Futuro (IA)
- O algoritmo de sugestão (`suggestMilitantes`) deve evoluir para considerar:
  - Balanceamento de carga (quem trabalhou menos?).
  - Afinidade de habilidades.
  - Restrições geográficas (se implementado).

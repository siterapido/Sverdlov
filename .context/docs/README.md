# 📚 Contexto do Projeto Sverdlov

Este diretório contém a documentação de contexto gerada e mantida para auxiliar agentes de IA e desenvolvedores a entenderem o projeto.

## 📁 Estrutura

```
.context/
├── docs/                    # Documentação do projeto
│   ├── project-overview.md  # Visão geral e propósito
│   ├── architecture.md      # Arquitetura técnica
│   ├── development-workflow.md # Guia de desenvolvimento
│   ├── security.md          # Práticas de segurança
│   ├── testing-strategy.md  # Estratégia de testes
│   ├── tooling.md           # Ferramentas e produtividade
│   ├── glossary.md          # Glossário de termos
│   └── codebase-map.json    # Mapa semântico do código
└── agents/                  # Playbooks para agentes de IA
    ├── code-reviewer.md
    ├── bug-fixer.md
    ├── feature-developer.md
    ├── frontend-specialist.md
    └── ...
```

## 📖 Documentação

| Documento | Descrição |
|-----------|-----------|
| [project-overview.md](docs/project-overview.md) | Propósito, stack tecnológica e estrutura do projeto |
| [architecture.md](docs/architecture.md) | Arquitetura do sistema, padrões e decisões técnicas |
| [development-workflow.md](docs/development-workflow.md) | Setup do ambiente, convenções e fluxo de trabalho |
| [security.md](docs/security.md) | Autenticação, autorização e práticas de segurança |
| [testing-strategy.md](docs/testing-strategy.md) | Filosofia de testes, coverage e boas práticas |
| [tooling.md](docs/tooling.md) | Ferramentas, CLI e configurações de produtividade |
| [glossary.md](docs/glossary.md) | Definições de termos do domínio e técnicos |

## 🤖 Playbooks de Agentes

Os playbooks em `agents/` fornecem contexto específico para diferentes tipos de agentes de IA:

- **code-reviewer.md** - Para revisão de código
- **bug-fixer.md** - Para correção de bugs
- **feature-developer.md** - Para desenvolvimento de features
- **frontend-specialist.md** - Para trabalho no frontend
- **refactoring-specialist.md** - Para refatoração de código
- **test-writer.md** - Para escrita de testes
- **documentation-writer.md** - Para documentação
- **performance-optimizer.md** - Para otimização de performance
- **security-auditor.md** - Para auditoria de segurança
- **architect-specialist.md** - Para decisões arquiteturais
- **devops-specialist.md** - Para infraestrutura e deploy

## 🔄 Manutenção

Esta documentação é gerada e atualizada automaticamente através do MCP `ai-context`.

Para atualizar a documentação:

```bash
# Reinicializar contexto
mcp_ai-context initializeContext

# Reconstruir mapa semântico
mcp_ai-context buildSemanticContext
```

## 📅 Última Atualização

- **Data**: 2026-01-18
- **Status**: ✅ Preenchido

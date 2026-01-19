---
title: "Modern Minimalist Design System"
version: "2.0"
date: "2026-01-18"
description: "Sistema de design moderno, minimalista, focado em 'Pure White' e 'Deep Dark', Mobile-First."
---

# Modern Minimalist Design System

## 1. Princípios de Design

1.  **Pureza & Contraste:**
    *   **Light Mode:** Branco absoluto (#FFFFFF). Sem cinzas sujos. Contraste alto com preto (#000000) ou grafite muito escuro.
    *   **Dark Mode:** Preto absoluto (#000000) ou muito próximo (#050505). Elementos em cinza escuro profundo.
    *   **Sem Degradês:** Cores sólidas e chapadas. O volume é dado por bordas sutis ou espaçamento, não por gradientes.
2.  **Mobile First:**
    *   Interfaces projetadas primeiro para telas pequenas.
    *   Áreas de toque generosas (min 44px).
    *   Tipografia legível e hierarquia clara sem depender de hover.
3.  **Funcionalidade Sobre Forma:**
    *   Redução de ruído visual.
    *   Animações apenas para feedback funcional (micro-interações rápidas).
    *   Densidade de informação equilibrada.

## 2. Cores

### Light Mode (Padrão)
*   **Background:** `#FFFFFF` (Puro)
*   **Surface / Secondary:** `#F8F8F8` (Sutil diferenciação para cards/seções)
*   **Border:** `#E5E5E5` (Sutil)
*   **Text Primary:** `#09090B` (Quase preto, alto contraste)
*   **Text Secondary:** `#71717A` (Cinza neutro)
*   **Primary Action (Brand):** `#000000` (Botões pretos, texto branco - Luxuoso/Minimalista) ou uma cor de destaque sólida se necessário (ex: Azul Elétrico `#0066FF` ou Laranja Internacional `#FF3B30` - a definir conforme marca). *Assumindo Monocromático de alto luxo por enquanto.*

### Dark Mode (Deep)
*   **Background:** `#000000` (Puro)
*   **Surface / Secondary:** `#121212` (Profundo)
*   **Border:** `#27272A` (Escuro)
*   **Text Primary:** `#FFFFFF` (Branco puro)
*   **Text Secondary:** `#A1A1AA` (Cinza claro)
*   **Primary Action (Brand):** `#FFFFFF` (Botões brancos, texto preto).

### Status
*   **Success:** `#10B981` (Emerald 500)
*   **Warning:** `#F59E0B` (Amber 500)
*   **Error:** `#EF4444` (Red 500)
*   **Info:** `#3B82F6` (Blue 500)

## 3. Tipografia

*   **Fonte:** Inter ou Geist Sans (Modernas, grotescas, alta legibilidade).
*   **Escala:** Usar escala modular simples.
    *   **H1:** 32px (Mobile) / 48px (Desktop) - Bold negative-tracking (-0.02em)
    *   **H2:** 24px (Mobile) / 30px (Desktop) - SemiBold
    *   **H3:** 20px - Medium
    *   **Body:** 16px - Regular (Padrão para leitura)
    *   **Small:** 14px - Regular (Labels, metadados)
    *   **Tiny:** 12px - Medium (Badges, legendas)

## 4. Componentes Chave

### Botões
*   **Forma:** Cantos arredondados sutis (4px ou 6px - não "pill" shape, mais técnico) ou totalmente retangulares (brutalista light). Vamos padronizar em **6px (md)**.
*   **Primary (Light):** Fundo Preto, Texto Branco. Hover: Cinza grafite.
*   **Primary (Dark):** Fundo Branco, Texto Preto. Hover: Cinza claro.
*   **Secondary:** Borda de 1px sólida, Fundo transparente.
*   **Ghost:** Sem borda, apenas texto. Hover com background sutil (#F4F4F5).

### Inputs
*   **Estilo:** Borda 1px sólida (#E4E4E7). Canto 6px.
*   **Estado:**
    *   **Default:** Borda cinza claro.
    *   **Focus:** Borda preta (Light) / Branca (Dark) ou Azul Sólido. Ring de foco nítido, sem glow difuso.
    *   **Error:** Borda vermelha.

### Cards
*   **Estilo:**
    *   **Flat:** Apenas background (`#F8F8F8` light / `#121212` dark).
    *   **Bordered:** Background transparente, Borda 1px (`#E5E5E5` light / `#27272A` dark).
    *   **Sem Sombras:** Evitar drop-shadows realistas. Usar contraste de cor ou borda.

### Navegação (Mobile First)
*   **Mobile:** Bottom Navigation Bar ou "Hamburguer" minimalista que abre um overlay em tela cheia.
*   **Desktop:** Sidebar fixa lateral esquerda minimalista (ícones + labels, expansível) ou Topbar limpa.

## 5. Layout & Espaçamento

*   **Grid:** Base de 4px.
*   **Padding Padrão de Tela (Mobile):** 16px ou 20px.
*   **Padding Padrão de Tela (Desktop):** Max-width centralizado (1200px) ou Fluido com margens de 48px.
*   **Espaço em Branco:** Usar generosamente para separar seções sem linhas.

## 6. UX Behaviors

*   **Feedback Tátil:** Feedback visual imediato ao toque (background change instantâneo).
*   **Transições:** Rápidas (150ms - 200ms). `ease-out`. Evitar bounces exagerados.
*   **Loadings:** Skeleton screens (brilhantes) em vez de spinners rotativos onde possível.

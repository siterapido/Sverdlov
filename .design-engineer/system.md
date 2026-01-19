# Sverdlov Design System (Notion Style)

## Direction
Personality: Minimalist, Clean, White-focused (Notion-like)
Foundation: Neutral Grays + Blue Accent
Depth: Flat with subtle borders and minimal shadows

## Tokens

### Spacing & Sizing
Base Unit: 4px
Input Height: 32px
Button Height: 32px
Page Width Max: 900px

### Radius
xs: 2px
sm: 3px
md: 4px (Standard)
lg: 6px (Cards)
xl: 8px
full: 9999px

### Colors
# Neutral
--bg-primary: #FFFFFF
--bg-secondary: #FBFBFA (Sidebar/Hover)
--bg-tertiary: #F7F6F3

# Foreground
--fg-primary: #37352F (Main Text)
--fg-secondary: #787774 (Subtext)
--fg-placeholder: #B4B4B0

# Accent
--accent: #2383E2 (Blue)
--accent-hover: #0B6BCB
--accent-light: #E7F3FF

# Status
--success: #0F7B6C
--warning: #D9730D
--danger: #E03E3E

## Patterns

### Button (.notion-button)
- Height: 32px
- Padding: 6px 12px
- Radius: 4px (md)
- Font: 14px, Weight 500
- Variants:
  - Primary: Bg Accent, Text Inverse
  - Secondary: Bg Hover, Text Primary
  - Ghost: Bg Transparent, Text Secondary -> Hover Primary
  - Danger: Bg Danger, Text Inverse

### Input (.notion-input)
- Height: 32px
- Padding: 4px 10px
- Radius: 4px (md)
- Border: 1px solid #E9E9E7
- Focus: Border Accent, Ring 2px Accent-Light

### Card (.notion-card)
- Background: #FFFFFF
- Radius: 6px (lg)
- Border: Optional (1px solid #E9E9E7)
- Shadow: Minimal (--shadow-xs or --shadow-sm)

### Sidebar
- Background: #FBFBFA
- Item Height: ~32px
- Item Padding: 6px 8px
- Item Radius: 4px
- Text: #787774 (Active #37352F)

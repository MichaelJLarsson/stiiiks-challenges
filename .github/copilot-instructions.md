# Stiiks Challenges - AI Coding Guidelines

## Project Overview
This is a **Stiiks Challenges** project - a design system and component library built around CSS custom properties and SVG iconography. The project follows a minimal, asset-driven approach with centralized theming.

## Architecture & Design System

### CSS Design Tokens (`config.css`)
- **Central theming**: All colors defined as CSS custom properties in `:root`
- **Semantic color system**: Uses specific brand colors (`--neon-yellow: #e5ff00`, `--green: #4fa684`, `--purple: #877bc3`)
- **Theme structure**: Background/foreground variables reference base colors for easy theme switching
- **Convention**: Use existing color variables rather than hardcoded hex values

### SVG Icon System (`assets/`)
- **Stroke-based icons**: All icons follow `-stroke.svg` naming convention
- **Consistent sizing**: Icons use standardized viewBox dimensions (typically 32x29, 32x32)
- **Fill strategy**: Icons use `fill="black"` for themeable coloring via CSS
- **Brand assets**: `stiiks-logo.svg` contains the main brand logo

## Development Patterns

### File Organization
```
├── config.css          # Design tokens and CSS variables
├── assets/             # SVG icons and brand assets
│   ├── *-stroke.svg    # Functional icons (UI elements)
│   └── stiiks-logo.svg # Brand logo
```

### Naming Conventions
- **Icons**: Use descriptive names with `-stroke` suffix (e.g., `heart-stroke.svg`, `comment-stroke.svg`)
- **CSS Variables**: Follow `--semantic-name` pattern, avoiding abbreviations
- **Colors**: Use semantic names (`--neon-yellow`) rather than generic ones (`--yellow`)

### Icon Integration
- Icons are designed to work with CSS `fill` property for theming
- Use `currentColor` or CSS variables for dynamic coloring
- Maintain consistent stroke width across icon set

## Project-Specific Guidelines

### Adding New Colors
1. Add to `:root` in `config.css` using semantic naming
2. Consider both light/dark theme implications
3. Update `--background-color`/`--foreground-color` if needed for theming

### Adding New Icons
1. Follow `-stroke.svg` naming convention
2. Use `fill="black"` for themeable paths
3. Maintain consistent viewBox sizing with existing icons
4. Test icon scaling at different sizes

### CSS Architecture
- Leverage CSS custom properties for all theming
- Avoid hardcoded colors in stylesheets
- Use semantic color variables (`--foreground-color`) for component styling

## Key Files to Reference
- `config.css` - Complete design token system and color palette
- `assets/stiiks-logo.svg` - Brand guidelines and logo structure
- `assets/*-stroke.svg` - Icon system patterns and styling approach
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static blog built with **Astro** and **React**, using **PocketBase** as the backend. The project is located in the `frontend/` directory and follows the Gyoza blog template architecture.

**Key Technologies:**
- Astro 4.6+ (static site generator)
- React 18+ (for interactive components)
- Tailwind CSS (styling)
- Framer Motion (animations)
- Jotai (state management)
- PocketBase (backend CMS)
- Swup (page transitions)

## Development Commands

All commands should be run from the `frontend/` directory:

```bash
cd frontend
pnpm i              # Install dependencies
pnpm dev            # Start dev server at localhost:4321
pnpm build          # Build production site (runs type check, build, and pagefind indexing)
pnpm preview        # Preview production build
pnpm lint           # Format code with Prettier
pnpm new-post       # Create new blog post
pnpm new-project    # Create new project entry
pnpm new-friend     # Create new friend link
```

**Build Process:** The build command runs three steps: `astro check` (type checking), `astro build` (production build), and `pagefind --site dist` (search indexing).

## Configuration

- **Site Config:** `frontend/src/config.json` - Contains all site metadata, navigation menus, color themes, analytics, and feature settings
- **Astro Config:** `frontend/astro.config.js` - Integrations (Tailwind, React, Sitemap, Swup) and markdown/rehype/remark plugins
- **PocketBase:** `frontend/src/lib/pb.ts` - Points to `https://nainong.me`

## Architecture

### Directory Structure

```
frontend/src/
├── components/          # React components (.tsx) and Astro components (.astro)
│   ├── footer/         # Footer components (ThemeSwitch, RunningDays)
│   ├── head/           # Head/HTML components (CommonHead, Analytics, ThemeLoader)
│   ├── header/         # Header components (Header, Search, Navigation)
│   ├── post/           # Post-related components (PostCard, PostToc, etc.)
│   ├── provider/       # Jotai providers (theme, viewport, scroll, meta info)
│   └── ui/             # UI components (modal system)
├── layouts/            # Astro layout components
│   ├── Layout.astro          # Base HTML layout
│   ├── MarkdownLayout.astro  # For blog posts (includes Provider + Header)
│   └── PageLayout.astro      # For standalone pages
├── pages/              # Astro pages (file-based routing)
├── plugins/            # Custom remark/rehype plugins for markdown processing
├── store/              # Jotai atoms for global state
├── styles/             # Global CSS
└── utils/              # Utility functions
```

### Component Architecture

**Interactive Components (React):**
- Global components like `MusicPlayer`, `BackToTopFAB`, `ToastContainer`, `ModalStack` are rendered in `Layout.astro` with `client:only="react"`
- The `Provider` component (in `MarkdownLayout.astro`) wraps React context providers for theme, viewport, scroll, and meta info
- Swup handles animated page transitions on the `<main>` element

**Astro vs React Components:**
- Use `.astro` files for static content and server-side logic
- Use `.tsx` files for interactive components requiring state or user interaction
- Astro components use `client:only="react"` or `client:idle` directives to hydrate React components

### State Management with Jotai

Global state is managed through Jotai atoms in `frontend/src/store/`:

- **theme.ts** - Theme preference ('light' | 'dark' | 'system')
- **viewport.ts** - Viewport dimensions
- **scrollInfo.ts** - Page scroll position (used by BackToTopFAB, ReadingProgress)
- **metaInfo.ts** - Post/page metadata
- **modalStack.ts** - Modal stack management
- **music.ts** - Music player state

**Pattern:** Create atom, then use `useAtom()` for read/write or `useAtomValue()` for read-only. For write-only atoms with actions, use the pattern in `music.ts`.

### Custom Markdown Processing

The blog uses custom remark and rehype plugins in `frontend/src/plugins/`:

- **remarkReadingTime** - Calculates reading time
- **remarkEmbed** - Custom embed syntax
- **remarkSpoiler** - Spoiler blocks
- **rehypeCodeBlock** - Code block styling
- **rehypeCodeHighlight** - Syntax highlighting with Shiki
- **rehypeTableBlock** - Responsive tables
- **rehypeImage** - Image optimization
- **rehypeLink** - Link styling
- **rehypeHeading** - Heading attributes

Plugins are registered in `astro.config.js`.

### Theme System

- Three themes: light, dark, system
- Theme preference stored in localStorage under key `gyoza-theme`
- Theme atom in `store/theme.ts` syncs with `data-theme` attribute on `<html>`
- Accent colors defined in `config.json` under `color.accent`

### Content Management

Blog posts are managed through PocketBase CMS. The `utils/content.ts` file provides helper functions for content fetching and processing.

## Working with This Codebase

### Adding New Interactive Components

1. Create React component in `frontend/src/components/`
2. If global (always visible): Add to `Layout.astro` with `client:only="react"`
3. If page-specific: Add to appropriate layout (`MarkdownLayout.astro` or `PageLayout.astro`)

### Modifying Layouts

- **Layout.astro** - Base HTML structure, affects all pages
- **MarkdownLayout.astro** - Blog post layout (includes Header, Provider, HeadGradient)
- **PageLayout.astro** - Standalone pages (About, Projects, etc.)

### Styling Conventions

- Uses Tailwind CSS with custom design tokens:
  - `bg-primary`, `bg-secondary` - Background colors
  - `text-primary`, `text-secondary` - Text colors
  - `border-primary` - Border colors
- Design tokens defined in `config.json` and injected via `AccentColorInjector.astro`
- Dark mode uses `dark:` prefix

### PocketBase Integration

- PocketBase instance initialized in `src/lib/pb.ts`
- Posts fetched through utility functions in `src/utils/content.ts`
- Collections: posts, projects, friends

### When Running Build

The build will fail on TypeScript errors. Common issues:
- Missing type imports for React components
- Incorrect prop types in Astro components
- Missing required fields in config.json

Note: Some pre-existing errors in other files (Footer.astro, CommonHead.astro, etc.) are unrelated to new development.

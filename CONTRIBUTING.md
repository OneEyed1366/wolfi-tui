# Contributing to wolf-tui

Thank you for your interest in contributing to wolf-tui!

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9
- **Rust** (for building native layout bindings)

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/wolf-tui.git
   cd wolf-tui
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Start development:
   ```bash
   pnpm dev
   ```

## Project Structure

```
wolf-tui/
├── internal/
│   ├── core/           # @wolfie/core - Framework-agnostic TUI engine
│   │   └── rust/       # Taffy layout bindings (napi-rs)
│   └── css-parser/     # @wolfie/css-parser - CSS preprocessing
├── packages/
│   ├── react/          # @wolfie/react - React adapter
│   ├── vue/            # @wolfie/vue - Vue 3 adapter
│   ├── angular/        # @wolfie/angular - Angular adapter
│   └── plugin/         # @wolfie/plugin - Build tool plugin
├── scripts/            # Build utilities
└── .github/            # CI workflows
```

## Development Workflow

### Commands

| Command             | Description                   |
| ------------------- | ----------------------------- |
| `pnpm dev`          | Watch mode for all packages   |
| `pnpm build`        | Build all packages            |
| `pnpm test`         | Run all tests                 |
| `pnpm test:related` | Test files related to changes |
| `pnpm lint`         | Check code style with ESLint  |
| `pnpm lint:fix`     | Fix ESLint issues             |
| `pnpm format`       | Format code with Prettier     |
| `pnpm typecheck`    | TypeScript type checking      |

### Running Examples

```bash
# React examples
pnpm --filter @examples/react-vite example

# Vue examples
pnpm --filter @examples/vue-vite example

# Angular examples
pnpm --filter @examples/angular-vite example
```

### Building Native Bindings

The core package includes Rust bindings for the Taffy layout engine:

```bash
cd internal/core
pnpm build:rust    # Build native bindings
pnpm build:full    # Build Rust + TypeScript
```

## Code Style

### TypeScript

- **Strict mode** enabled
- Use TypeScript for all new code
- Prefer `type` over `interface` for object types
- Use `satisfies` for type-safe object literals

### ESLint + Prettier

- ESLint checks run on commit (via Husky)
- Prettier formats code automatically
- Run `pnpm lint:fix` to auto-fix issues

### Naming Conventions

| Type       | Convention      | Example            |
| ---------- | --------------- | ------------------ |
| Files      | kebab-case      | `render-node.ts`   |
| Components | PascalCase      | `TextInput`        |
| Functions  | camelCase       | `renderOutput`     |
| Constants  | SCREAMING_SNAKE | `DEFAULT_THROTTLE` |
| Types      | PascalCase      | `RenderOptions`    |

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

### Types

| Type       | Description                  |
| ---------- | ---------------------------- |
| `feat`     | New feature                  |
| `fix`      | Bug fix                      |
| `docs`     | Documentation only           |
| `refactor` | Code change (no feature/fix) |
| `test`     | Adding/updating tests        |
| `chore`    | Build, CI, tooling           |
| `perf`     | Performance improvement      |
| `style`    | Formatting, whitespace       |

### Scopes

- `react` — React adapter
- `vue` — Vue adapter
- `angular` — Angular adapter
- `core` — Core engine
- `plugin` — Build plugin
- `css` — CSS parser

### Examples

```bash
feat(react): add useSpinner hook
fix(angular): handle null nodes in renderer
docs: update README quick start
refactor(core): simplify layout calculation
test(vue): add viewport units tests
chore: update dependencies
```

## Pull Request Process

1. **Create a branch** from `master`:

   ```bash
   git checkout -b feat/my-feature
   ```

2. **Make your changes** with tests

3. **Run checks locally**:

   ```bash
   pnpm lint
   pnpm test
   pnpm typecheck
   ```

4. **Commit** using conventional commits

5. **Push** and create a Pull Request

6. **Address review feedback**

### PR Guidelines

- Keep PRs focused — one feature/fix per PR
- Include tests for new functionality
- Update documentation if needed
- Reference related issues

## Testing

### Running Tests

```bash
# All tests
pnpm test

# Watch mode
pnpm -r test:watch

# Single package
pnpm --filter @wolfie/react test
```

### Writing Tests

- Use Vitest for unit tests
- Place tests in `test/` directories
- Name test files as `*.test.ts` or `*.test.tsx`
- Use descriptive test names

```typescript
import { describe, it, expect } from 'vitest'

describe('Component', () => {
	it('should render with default props', () => {
		// ...
	})
})
```

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions

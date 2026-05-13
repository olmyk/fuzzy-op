# fuzzy-op

An interactive playground for building and evaluating expressions over **fuzzy numbers** and **fuzzy sets**. Define membership functions from a catalogue of standard shapes, drag operands and operators onto a canvas, and see the resulting membership function plotted live.

## Description

The app is split into two workspaces:

### Fuzzy numbers
Arithmetic over fuzzy numbers based on **Zadeh's extension principle** applied to discrete point sets. For each pair of points `(pa, pb)`, the output `z = pa.x op pb.x` is assigned membership `µ = min(pa.µ, pb.µ)`; when multiple pairs collapse to the same `z`, the supremum (max) is kept.

Supported binary operations:
- Addition (`+`)
- Subtraction (`−`)
- Multiplication (`×`)
- Division (`÷`) — guarded against zero in the divisor's support

### Fuzzy sets
Set operations evaluated by interpolating both operands onto a merged x-grid:
- **Union** — `µ_A∪B(x) = max(µ_A(x), µ_B(x))`
- **Intersection** — `µ_A∩B(x) = min(µ_A(x), µ_B(x))`
- **Complement** — `µ_∁A(x) = 1 − µ_A(x)` (unary prefix)

### Membership functions
Each operand is sampled from a parametric membership function. Available shapes:

| Shape | Used for numbers | Used for sets | Parameters |
| --- | :---: | :---: | --- |
| Triangle | ✓ | ✓ | `a, b, c` |
| Trapezoid | ✓ | ✓ | `a, b, c, d` |
| Gaussian | ✓ | ✓ | `c, σ` |
| Bell-shaped | ✓ | ✓ | `a, b, c` |
| Exponential | ✓ | ✓ | `λ, c` |
| Pi-shape | ✓ | ✓ | `a, b, c, d` |
| Sigmoid |   | ✓ | `a, c` |
| S-shape |   | ✓ | `a, b` |
| Z-shape |   | ✓ | `a, b` |

Each function is sampled at 80 points across its effective domain to produce the point set used by the arithmetic engine.

### Expression canvas
Operands (letters) and operators are drag-and-drop tokens (powered by `@dnd-kit`). The canvas evaluates the expression left-to-right and renders the result against the inputs in a live chart.

## Tech stack

- **React 19** + **TypeScript** (strict mode, `noUnusedLocals` / `noUnusedParameters`)
- **Vite 8** — dev server and bundler
- **React Router 7** — `createBrowserRouter`, central path config in `src/config/paths.ts`
- **Material UI 9** + **Emotion** — components and styling
- **@dnd-kit** — drag-and-drop for the expression canvas
- **ESLint 10** (flat config) with `typescript-eslint` and React hooks plugins

The source layout follows a feature-slice pattern: shared primitives in `src/shared/`, route-bound feature modules in `src/features/<name>/{components,hooks,utils,types}`.

## Installation

### Prerequisites
- **Node.js** ≥ 20.19 (Vite 8 requirement)
- **npm** (or any compatible package manager; lockfile is `package-lock.json`)

### Setup

```bash
git clone <repository-url>
cd fuzzy-op
npm install
```

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR (default: http://localhost:5173) |
| `npm run build` | Type-check (`tsc -b`) then produce a production bundle in `dist/` |
| `npm run preview` | Serve the built bundle locally to smoke-test the production output |
| `npm run lint` | Run ESLint over the project (flat config in `eslint.config.js`) |

No test framework is configured.

## Routes

| Path | View |
| --- | --- |
| `/` | Landing page |
| `/fuzzy-numbers` | Fuzzy number arithmetic workspace |
| `/fuzzy-sets` | Fuzzy set operations workspace |

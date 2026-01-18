# ADR-0010: Monorepo Package Structure

## Status

Accepted

## Context

python2ts started as a single package combining the transpiler and runtime. As the project grew,
several concerns emerged:

1. **Bundle size**: Users who only need the runtime (pythonlib) were forced to include the entire
   transpiler with its parser dependencies
2. **Versioning**: The transpiler and runtime have different release cycles - runtime is more stable
   while the transpiler evolves rapidly
3. **Use cases**: Some users want pythonlib standalone for Python-style utilities in TypeScript,
   without any transpilation
4. **Dependencies**: The transpiler needs `@lezer/python` for parsing, but the runtime has zero
   dependencies

Options considered:

1. **Single package**: Keep everything in one package
   - Pro: Simpler publishing, single version
   - Con: Bloated bundles, coupled releases

2. **Separate repositories**: Split into independent repos
   - Pro: Complete independence
   - Con: Coordination overhead, harder to test together

3. **Monorepo with workspaces**: Single repo, multiple packages
   - Pro: Unified development, atomic changes, shared tooling
   - Con: More complex setup, workspace protocol in dependencies

## Decision

We adopt a **pnpm monorepo** structure with two independent packages:

```
python2ts/
├── packages/
│   ├── python2ts/     # Transpiler (depends on pythonlib)
│   └── pythonlib/     # Runtime (zero dependencies)
├── tests/             # Shared test suite
├── docs/              # Documentation
└── package.json       # Workspace root
```

### Package: python2ts

The transpiler package:

```json
{
  "name": "python2ts",
  "dependencies": {
    "@lezer/python": "^1.1.0",
    "pythonlib": "workspace:*"
  }
}
```

- **Purpose**: Parse Python, transform AST, generate TypeScript
- **Entry point**: `python2ts` (main export + CLI)
- **Dependencies**: Lezer parser, pythonlib runtime
- **Users**: Developers transpiling Python to TypeScript

### Package: pythonlib

The runtime library:

```json
{
  "name": "pythonlib",
  "dependencies": {}
}
```

- **Purpose**: Python standard library implementations in TypeScript
- **Entry points**: Main export + subpath exports (see
  [ADR-0009](./0009-subpath-exports-architecture.md))
- **Dependencies**: None (zero-dependency)
- **Users**: Anyone wanting Python-style utilities in TypeScript

### Workspace Configuration

Root `package.json`:

```json
{
  "name": "python2ts-monorepo",
  "private": true,
  "packageManager": "pnpm@9.15.4",
  "scripts": {
    "build": "pnpm -r build",
    "test": "vitest --run",
    "lint": "eslint packages/*/src tests"
  }
}
```

`pnpm-workspace.yaml`:

```yaml
packages:
  - "packages/*"
```

### Dependency Flow

```
┌─────────────────────┐
│      python2ts      │
│    (transpiler)     │
├─────────────────────┤
│ @lezer/python       │
│ pythonlib ──────────┼──────┐
└─────────────────────┘      │
                             ▼
                    ┌─────────────────────┐
                    │     pythonlib       │
                    │     (runtime)       │
                    ├─────────────────────┤
                    │ (zero dependencies) │
                    └─────────────────────┘
```

### Shared Test Suite

Tests live at the monorepo root to:

- Test integration between packages
- Verify generated code works with runtime
- Share test utilities and fixtures

```
tests/
├── e2e/              # End-to-end transpilation tests
├── runtime.test.ts   # Runtime unit tests
├── transformer.test.ts
├── parser.test.ts
└── generator.test.ts
```

## Consequences

### Positive

- **Independent installation**: `npm install pythonlib` works standalone
- **Smaller bundles**: pythonlib has zero dependencies, tree-shakeable
- **Flexible versioning**: Packages can be versioned independently
- **Atomic changes**: Cross-package changes are single commits
- **Shared tooling**: One ESLint, Prettier, TypeScript, Vitest config
- **Unified CI**: Single workflow tests everything together

### Negative

- **Workspace protocol**: `workspace:*` requires pnpm or special handling for npm/yarn
- **Publishing complexity**: Need to publish multiple packages
- **Version coordination**: Major changes may need coordinated releases

### Publishing Strategy

1. **pythonlib**: Publish first as it has no internal dependencies
2. **python2ts**: Publish second, referencing published pythonlib version

For npm compatibility, `workspace:*` is replaced with actual version during publish:

```bash
pnpm publish --filter pythonlib
pnpm publish --filter python2ts
```

### Installation Scenarios

```bash
# Full transpiler (includes pythonlib)
npm install python2ts

# Runtime only (zero dependencies)
npm install pythonlib

# Specific module only
npm install pythonlib  # then import from "pythonlib/itertools"
```

### Directory Structure

```
python2ts/
├── packages/
│   ├── python2ts/
│   │   ├── src/
│   │   │   ├── parser/      # Lezer-based Python parser
│   │   │   ├── transformer/ # AST transformation
│   │   │   ├── generator/   # TypeScript code generation
│   │   │   └── cli/         # Command-line interface
│   │   ├── package.json
│   │   └── tsup.config.ts
│   │
│   └── pythonlib/
│       ├── src/
│       │   ├── index.ts     # Main export (builtins)
│       │   ├── itertools.ts # pythonlib/itertools
│       │   ├── functools.ts # pythonlib/functools
│       │   ├── collections.ts
│       │   ├── math.ts
│       │   ├── random.ts
│       │   ├── datetime.ts
│       │   ├── json.ts
│       │   ├── re.ts
│       │   ├── os.ts
│       │   └── string.ts
│       ├── package.json
│       └── tsup.config.ts
│
├── tests/               # Shared test suite
├── docs/                # Documentation & ADRs
├── package.json         # Workspace root
├── pnpm-workspace.yaml
├── tsconfig.json        # Shared TS config
├── eslint.config.js     # Shared lint config
└── vitest.config.ts     # Test configuration
```

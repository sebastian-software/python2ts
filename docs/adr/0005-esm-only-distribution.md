# ADR-0005: ESM-Only Distribution

## Status

Accepted

## Context

Node.js supports two module systems:

1. **CommonJS (CJS)**: Traditional `require()` / `module.exports`
2. **ES Modules (ESM)**: Modern `import` / `export`

We need to decide which format(s) to distribute:

Options:

1. **CJS only**: Maximum compatibility, but outdated
2. **ESM only**: Modern, tree-shakeable, but excludes old CJS consumers
3. **Dual (CJS + ESM)**: Maximum compatibility, but complex build, potential dual-package hazard

## Decision

We will distribute **ESM only**.

Rationale:

1. **Target audience**: Modern TypeScript/JavaScript developers
2. **Node.js requirement**: We already require Node.js 22+
3. **Simplicity**: Single format, simpler build configuration
4. **Tree-shaking**: ESM enables better dead code elimination
5. **Future-proof**: ESM is the standard going forward

Configuration:

```json
// package.json
{
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./runtime": {
      "import": "./dist/runtime/index.js",
      "types": "./dist/runtime/index.d.ts"
    }
  }
}
```

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

```typescript
// tsup.config.ts
{
  format: ['esm'],  // ESM only
  target: 'node22',
}
```

## Consequences

### Positive

- Simpler build configuration
- Smaller package size (single format)
- Better tree-shaking for consumers
- No dual-package hazard
- Cleaner imports with `.js` extensions

### Negative

- Cannot be `require()`-ed from CJS code
- Excludes projects stuck on old Node.js versions
- Some bundlers may need configuration for ESM

### Migration Path for CJS Users

Users with CJS codebases can:

1. Use dynamic `import()`:

   ```javascript
   const { transpile } = await import("python2ts")
   ```

2. Upgrade to ESM (recommended)

3. Use a bundler that handles ESM→CJS conversion

### File Extensions

All internal imports use `.js` extensions as required by ESM:

```typescript
// Correct
import { parse } from "./parser/index.js"

// Incorrect (won't work in ESM)
import { parse } from "./parser/index"
```

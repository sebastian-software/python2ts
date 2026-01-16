# ADR-0004: Testing Strategy with Vitest

## Status

Accepted

## Context

We need a comprehensive testing strategy that:

1. Verifies correct parsing of Python code
2. Ensures correct transformation to TypeScript
3. Validates runtime function behavior (especially edge cases)
4. Provides end-to-end verification of the full pipeline
5. Maintains high code coverage (target: 85%+)

Testing framework options:

1. **Jest** - Popular, mature, but slower and heavier
2. **Vitest** - Fast, modern, native ESM support, Vite-compatible
3. **Node.js test runner** - Built-in, but limited features
4. **Mocha + Chai** - Flexible, but more setup required

## Decision

We will use **Vitest** as our testing framework with **@vitest/coverage-v8** for coverage.

Test structure:

```
tests/
├── parser.test.ts       # Parser unit tests
├── transformer.test.ts  # Transformer unit tests
├── generator.test.ts    # Generator unit tests
├── runtime.test.ts      # Runtime library unit tests
├── integration.test.ts  # Full pipeline integration tests
└── e2e/
    ├── literals.test.ts     # End-to-end: literals
    ├── operators.test.ts    # End-to-end: operators
    ├── control-flow.test.ts # End-to-end: control flow
    ├── functions.test.ts    # End-to-end: functions
    ├── advanced.test.ts     # End-to-end: advanced features
    ├── builtins.test.ts     # End-to-end: built-in functions
    └── edge-cases.test.ts   # End-to-end: edge cases
```

## Consequences

### Positive

- **Fast execution**: Vitest is significantly faster than Jest
- **Native ESM**: No configuration needed for ES modules
- **Watch mode**: Efficient development workflow
- **Coverage integration**: Built-in coverage with thresholds
- **TypeScript support**: First-class TypeScript support

### Negative

- Less ecosystem maturity than Jest (mitigated by API compatibility)
- Fewer third-party plugins available

### Coverage Configuration

```typescript
// vitest.config.ts
coverage: {
  provider: 'v8',
  include: ['src/**/*.ts'],
  thresholds: {
    lines: 85,
    functions: 85,
    branches: 85,
    statements: 85,
  },
}
```

### Test Categories

1. **Unit Tests**: Test individual functions in isolation
   - Parser: AST generation, node traversal
   - Transformer: Node-by-node transformation
   - Generator: Code output, import management
   - Runtime: Python-compatible behavior

2. **Integration Tests**: Test component interactions
   - Parse → Transform → Generate pipeline
   - Runtime dependency tracking

3. **End-to-End Tests**: Test complete Python → TypeScript conversion
   - Real Python snippets
   - Verify generated code structure
   - Verify runtime execution matches Python

### Example Test Pattern

```typescript
describe('E2E: Operators', () => {
  it('should preserve Python modulo semantics', () => {
    const python = 'x = -7 % 3';
    const ts = transpile(python);

    // Verify generated code uses runtime
    expect(ts).toContain('py.mod(-7, 3)');

    // Verify runtime produces Python result
    expect(py.mod(-7, 3)).toBe(2); // Python: 2, JS: -1
  });
});
```

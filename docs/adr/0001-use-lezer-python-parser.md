# ADR-0001: Use @lezer/python as Parser

## Status

Accepted

## Context

We need a Python parser to generate an Abstract Syntax Tree (AST) from Python source code. The parser must:

1. Run in Node.js/browser environments (JavaScript/TypeScript)
2. Be well-maintained and reliable
3. Support modern Python syntax
4. Provide a traversable AST structure

Alternatives considered:

1. **Tree-sitter Python** - Excellent parser, but requires native bindings (WASM available but complex setup)
2. **python-ast** - Limited maintenance, incomplete Python 3 support
3. **Custom parser** - High development effort, error-prone
4. **@lezer/python** - CodeMirror's Python parser, pure JavaScript, actively maintained

## Decision

We will use **@lezer/python** as our Python parser.

Key factors:

- **Pure JavaScript**: No native dependencies, works everywhere
- **Actively maintained**: Part of the CodeMirror 6 ecosystem
- **Incremental parsing**: Efficient for editor integrations (future use case)
- **Well-documented**: Clear node type definitions
- **Small bundle size**: ~50KB minified

## Consequences

### Positive

- No native build requirements (easier CI/CD, cross-platform)
- Fast parsing for typical Python files
- Can be used in browser-based tools
- Strong TypeScript support via @lezer/common

### Negative

- Lezer's AST is optimized for editor use, not traditional compiler ASTs
- Some Python constructs may need special handling during transformation
- Less detailed error messages compared to Python's native parser
- Node types are strings, not typed enums (addressed via our NodeTypes constants)

### Mitigations

- Created wrapper functions (`getChildren`, `getNodeText`, etc.) to simplify AST traversal
- Maintain a `NodeTypes` constant object for type-safe node type references
- `debugTree` function helps during development to understand AST structure

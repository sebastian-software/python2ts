# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for the python2ts project.

## What is an ADR?

An Architecture Decision Record captures an important architectural decision made along with its
context and consequences.

## ADR Index

| ID                                                 | Title                              | Status     | Date       |
| -------------------------------------------------- | ---------------------------------- | ---------- | ---------- |
| [ADR-0001](./0001-use-lezer-python-parser.md)      | Use @lezer/python as Parser        | Accepted   | 2026-01-16 |
| [ADR-0002](./0002-runtime-namespace-design.md)     | Runtime Namespace Design (py.\*)   | Superseded | 2026-01-16 |
| [ADR-0003](./0003-python-operator-semantics.md)    | Preserve Python Operator Semantics | Accepted   | 2026-01-16 |
| [ADR-0004](./0004-testing-strategy.md)             | Testing Strategy with Vitest       | Accepted   | 2026-01-16 |
| [ADR-0005](./0005-esm-only-distribution.md)        | ESM-Only Distribution              | Accepted   | 2026-01-16 |
| [ADR-0006](./0006-type-hints-to-typescript.md)     | Python Type Hints to TypeScript    | Accepted   | 2026-01-16 |
| [ADR-0007](./0007-dataclass-transformation.md)     | @dataclass Transformation Strategy | Accepted   | 2026-01-16 |
| [ADR-0008](./0008-itertools-eager-vs-lazy.md)      | itertools: Eager Arrays vs. Lazy   | Accepted   | 2026-01-17 |
| [ADR-0009](./0009-subpath-exports-architecture.md) | Subpath Exports Architecture       | Accepted   | 2026-01-18 |
| [ADR-0010](./0010-monorepo-package-structure.md)   | Monorepo Package Structure         | Accepted   | 2026-01-18 |
| [ADR-0011](./0011-camelcase-api-convention.md)     | camelCase API Convention           | Accepted   | 2026-01-18 |
| [ADR-0012](./0012-async-filesystem-api.md)         | Async Filesystem API               | Accepted   | 2026-01-21 |

## Template

When adding a new ADR, use the following template:

```markdown
# ADR-XXXX: Title

## Status

Proposed | Accepted | Deprecated | Superseded by [ADR-XXXX](./xxxx-title.md)

## Context

What is the issue that we're seeing that is motivating this decision or change?

## Decision

What is the change that we're proposing and/or doing?

## Consequences

What becomes easier or more difficult to do because of this change?
```

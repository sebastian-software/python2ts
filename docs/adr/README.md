# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for the python2ts project.

## What is an ADR?

An Architecture Decision Record captures an important architectural decision made along with its
context and consequences.

## ADR Index

| ID                                              | Title                              | Status   | Date       |
| ----------------------------------------------- | ---------------------------------- | -------- | ---------- |
| [ADR-0001](./0001-use-lezer-python-parser.md)   | Use @lezer/python as Parser        | Accepted | 2026-01-16 |
| [ADR-0002](./0002-runtime-namespace-design.md)  | Runtime Namespace Design (py.\*)   | Accepted | 2026-01-16 |
| [ADR-0003](./0003-python-operator-semantics.md) | Preserve Python Operator Semantics | Accepted | 2026-01-16 |
| [ADR-0004](./0004-testing-strategy.md)          | Testing Strategy with Vitest       | Accepted | 2026-01-16 |
| [ADR-0005](./0005-esm-only-distribution.md)     | ESM-Only Distribution              | Accepted | 2026-01-16 |

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

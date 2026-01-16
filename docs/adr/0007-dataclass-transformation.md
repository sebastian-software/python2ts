# ADR-0007: @dataclass Transformation Strategy

## Status

Accepted

## Context

Python's `@dataclass` decorator (PEP 557) automatically generates boilerplate methods for classes
that are primarily data containers. It's one of Python's most popular features for reducing
boilerplate.

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: int
    y: int
```

This automatically generates `__init__`, `__repr__`, `__eq__`, and other methods.

We need to decide how to handle `@dataclass` in our transpiler:

1. **Generic decorator wrapping**: Treat it like any other decorator
   - `const Point = dataclass(class Point { ... })`
   - Requires a runtime `dataclass` function that does reflection magic
   - Complex, fragile, doesn't leverage TypeScript's type system

2. **Special-case transformation**: Recognize `@dataclass` and generate equivalent TypeScript
   - Generate typed fields and constructor directly
   - No runtime dependency for basic functionality
   - Cleaner, more idiomatic TypeScript output

3. **Ignore the decorator**: Strip `@dataclass` and just emit the class body
   - Loses the auto-generated constructor
   - Would require manual constructor definition in Python source

## Decision

We will implement **special-case transformation** for `@dataclass`. The decorator is recognized
during transformation and the class is rewritten to include:

1. Typed field declarations
2. Auto-generated constructor with parameters matching fields
3. Support for `frozen=True` via `readonly` and `Object.freeze()`
4. Support for `field(default_factory=...)` for mutable defaults

### Basic Transformation

```python
@dataclass
class Person:
    name: str
    age: int
    email: str = ""
```

```typescript
class Person {
  name: string
  age: number
  email: string

  constructor(name: string, age: number, email: string = "") {
    this.name = name
    this.age = age
    this.email = email
  }
}
```

### Frozen Dataclasses

```python
@dataclass(frozen=True)
class Point:
    x: int
    y: int
```

```typescript
class Point {
  readonly x: number
  readonly y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    Object.freeze(this)
  }
}
```

### Field with default_factory

Python disallows mutable default values. The `field(default_factory=...)` pattern solves this:

```python
@dataclass
class Container:
    items: list = field(default_factory=list)
    metadata: dict = field(default_factory=dict)
    tags: set = field(default_factory=set)
```

```typescript
class Container {
  items: unknown[]
  metadata: Record<string, unknown>
  tags: Set<unknown>

  constructor(
    items: unknown[] = [],
    metadata: Record<string, unknown> = {},
    tags: Set<unknown> = new Set()
  ) {
    this.items = items
    this.metadata = metadata
    this.tags = tags
  }
}
```

### Inheritance

Dataclasses that inherit from other dataclasses call `super()`:

```python
@dataclass
class Employee(Person):
    employee_id: str
```

```typescript
class Employee extends Person {
  employee_id: string

  constructor(name: string, age: number, email: string = "", employee_id: string) {
    super(name, age, email)
    this.employee_id = employee_id
  }
}
```

### What We Don't Transform

These `@dataclass` features are not specially handled (they're either ignored or would need runtime
support):

- `__post_init__` method (transformed as regular method, but not auto-called)
- `__eq__`, `__repr__`, `__hash__` generation (not needed for most TypeScript use cases)
- `order=True` for comparison operators
- `slots=True` (JavaScript doesn't have slots)
- `ClassVar` fields (recognized and excluded from constructor)
- `InitVar` fields (included in constructor but not as class field)

### Generic Decorators vs @dataclass

Other class decorators use the generic wrapping pattern:

```python
@register
@validate
class MyClass:
    pass
```

```typescript
const MyClass = register(validate(class MyClass {}))
```

The key distinction is that `@dataclass` fundamentally changes the class structure (adding
constructor logic), while generic decorators wrap the class without modifying its internals.

## Consequences

### Positive

- **Idiomatic TypeScript**: Generated code looks like hand-written TypeScript
- **Type safety**: Constructor parameters are fully typed
- **No runtime dependency**: Basic dataclass functionality needs no `py.*` helpers
- **IDE support**: TypeScript understands the class structure completely
- **Immutability support**: `frozen=True` maps naturally to `readonly`

### Negative

- **Incomplete feature coverage**: Advanced dataclass features aren't supported
- **Behavioral differences**: Generated `__eq__` would behave differently than Python's
- **Special-case complexity**: Parser must recognize `@dataclass` specifically
- **Decorator order matters**: `@dataclass` must be handled before other decorators

### Design Rationale

The decision to special-case `@dataclass` rather than implement a runtime equivalent comes down to
TypeScript's strengths:

1. **Static typing**: TypeScript's value is in compile-time type checking. A runtime `dataclass`
   function couldn't provide the same level of type inference.

2. **Tooling integration**: IDEs understand TypeScript classes natively. A decorator-wrapped class
   would lose autocomplete for fields.

3. **Simplicity**: Generating a constructor is straightforward. Implementing full dataclass
   semantics at runtime would be complex and error-prone.

4. **Common use case**: Most dataclass usage is for simple data containers. The generated TypeScript
   handles this case well.

# Python zu TypeScript Converter - Projektplan

## Übersicht

Ein AST-basierter Transpiler, der Python-Code nach TypeScript konvertiert. Der Parser basiert auf `@lezer/python`, und Python-spezifische Operationen werden an Runtime-Helfer unter dem `py`-Namespace delegiert.

## Architektur

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Python Code   │────▶│  Lezer Parser   │────▶│   Lezer AST     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ TypeScript Code │◀────│  Code Generator │◀────│   Transformer   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │  py.* Runtime   │
                        └─────────────────┘
```

## Kernkomponenten

### 1. Parser (`src/parser/`)
- Wrapper um `@lezer/python`
- AST-Traversierung und Node-Typen

### 2. Transformer (`src/transformer/`)
- Konvertiert Lezer-AST zu TypeScript-AST
- Handler für jeden Python-Node-Typ

### 3. Code Generator (`src/generator/`)
- Generiert TypeScript-Code aus transformiertem AST

### 4. Runtime Library (`src/runtime/`)
- `py.*` Helfer-Funktionen für Python-spezifische Operationen
- Wird mit dem generierten Code ausgeliefert

## Phasen der Implementierung

### Phase 1: Grundgerüst (MVP)
- [x] Projektsetup (TypeScript, Vitest, ESLint)
- [ ] Lezer Parser Integration
- [ ] Basis-Transformer Struktur
- [ ] Code Generator Grundstruktur

**Unterstützte Syntax:**
- Literale: `int`, `float`, `str`, `bool`, `None`
- Variablen und Zuweisungen
- Arithmetische Operatoren: `+`, `-`, `*`, `/`, `//`, `%`, `**`
- Vergleichsoperatoren: `==`, `!=`, `<`, `>`, `<=`, `>=`
- Logische Operatoren: `and`, `or`, `not`

### Phase 2: Kontrollfluss
- [ ] `if`/`elif`/`else`
- [ ] `while`-Schleifen
- [ ] `for`-Schleifen (mit `py.iter()`)
- [ ] `break`, `continue`, `pass`

### Phase 3: Datenstrukturen
- [ ] Listen → `py.list()`
- [ ] Dictionaries → `py.dict()`
- [ ] Tuples → `py.tuple()`
- [ ] Sets → `py.set()`
- [ ] Slicing → `py.slice()`
- [ ] List Comprehensions → `py.listComp()`

### Phase 4: Funktionen
- [ ] Funktionsdefinitionen
- [ ] Default-Parameter
- [ ] `*args`, `**kwargs`
- [ ] Lambda-Ausdrücke
- [ ] Closures

### Phase 5: Klassen
- [ ] Klassendefinitionen
- [ ] Vererbung
- [ ] `__init__`, `__str__`, etc.
- [ ] Properties (`@property`)
- [ ] Statische Methoden, Klassenmethoden

### Phase 6: Python Built-ins
- [ ] `print()` → `console.log()`
- [ ] `len()` → `py.len()`
- [ ] `range()` → `py.range()`
- [ ] `enumerate()` → `py.enumerate()`
- [ ] `zip()` → `py.zip()`
- [ ] `map()`, `filter()`, `reduce()`
- [ ] String-Methoden
- [ ] Liste der Built-ins erweitern

### Phase 7: Exception Handling
- [ ] `try`/`except`/`finally`
- [ ] `raise`
- [ ] Custom Exceptions

### Phase 8: Module & Imports
- [ ] `import` Statements
- [ ] `from ... import ...`
- [ ] Relative Imports

## py.* Runtime API

```typescript
// src/runtime/index.ts
export const py = {
  // Slicing
  slice<T>(obj: string | T[], start?: number, stop?: number, step?: number): string | T[],

  // Iterables
  range(stop: number): Iterable<number>,
  range(start: number, stop: number, step?: number): Iterable<number>,
  enumerate<T>(iterable: Iterable<T>): Iterable<[number, T]>,
  zip<T, U>(a: Iterable<T>, b: Iterable<U>): Iterable<[T, U]>,

  // Collections
  list<T>(iterable?: Iterable<T>): T[],
  dict<K, V>(entries?: Iterable<[K, V]>): Map<K, V>,
  set<T>(iterable?: Iterable<T>): Set<T>,
  tuple<T extends any[]>(...items: T): Readonly<T>,

  // Built-ins
  len(obj: string | any[] | Map<any, any> | Set<any>): number,
  abs(x: number): number,
  min<T>(...args: T[]): T,
  max<T>(...args: T[]): T,
  sum(iterable: Iterable<number>): number,
  sorted<T>(iterable: Iterable<T>, key?: (x: T) => any, reverse?: boolean): T[],
  reversed<T>(iterable: Iterable<T>): Iterable<T>,

  // Type Conversions
  int(x: string | number | boolean): number,
  float(x: string | number): number,
  str(x: any): string,
  bool(x: any): boolean,

  // String operations
  string: {
    join(sep: string, iterable: Iterable<string>): string,
    split(s: string, sep?: string, maxsplit?: number): string[],
    // ... weitere String-Methoden
  },

  // Operators
  floordiv(a: number, b: number): number,  // //
  pow(base: number, exp: number): number,   // **
  mod(a: number, b: number): number,        // % (Python-Semantik)

  // Membership & Identity
  in<T>(item: T, container: Iterable<T> | string): boolean,
  is(a: any, b: any): boolean,

  // Comprehensions
  listComp<T, S>(iterable: Iterable<S>, map: (x: S) => T, filter?: (x: S) => boolean): T[],
  dictComp<K, V, S>(iterable: Iterable<S>, key: (x: S) => K, value: (x: S) => V, filter?: (x: S) => boolean): Map<K, V>,
};
```

## Externe Abhängigkeiten

| Paket | Verwendung |
|-------|------------|
| `@lezer/python` | Python Parser |
| `@lezer/common` | Lezer Utilities |
| `lodash-es` | Utility-Funktionen (optional) |
| `vitest` | Testing |
| `typescript` | Compiler |
| `tsup` | Bundling |
| `@vitest/coverage-v8` | Code Coverage |

## Projektstruktur

```
python2ts/
├── src/
│   ├── index.ts              # Haupt-Export
│   ├── parser/
│   │   ├── index.ts          # Parser-Wrapper
│   │   └── types.ts          # AST-Typen
│   ├── transformer/
│   │   ├── index.ts          # Haupt-Transformer
│   │   ├── expressions.ts    # Expression Handler
│   │   ├── statements.ts     # Statement Handler
│   │   └── visitors.ts       # AST Visitors
│   ├── generator/
│   │   ├── index.ts          # Code Generator
│   │   └── printer.ts        # Code Formatter
│   └── runtime/
│       ├── index.ts          # py.* Namespace
│       ├── collections.ts    # list, dict, set, tuple
│       ├── itertools.ts      # range, enumerate, zip
│       ├── builtins.ts       # len, abs, min, max, etc.
│       └── operators.ts      # //, **, %, in, is
├── tests/
│   ├── parser.test.ts
│   ├── transformer.test.ts
│   ├── generator.test.ts
│   ├── runtime.test.ts
│   └── e2e/
│       ├── literals.test.ts
│       ├── operators.test.ts
│       ├── control-flow.test.ts
│       └── ...
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── PLAN.md
```

## Testing-Strategie

### Unit Tests
- Jede Komponente einzeln testen
- Parser: Korrekte AST-Generierung
- Transformer: Korrekte Node-Transformation
- Generator: Korrekter TypeScript-Output
- Runtime: Korrekte Python-Semantik

### Integration Tests (E2E)
```typescript
// Beispiel Test
test('arithmetic operators', () => {
  const python = `
x = 10 // 3
y = 2 ** 8
z = -7 % 3
`;
  const result = transpile(python);
  expect(result.code).toContain('py.floordiv(10, 3)');
  expect(result.code).toContain('py.pow(2, 8)');
  expect(result.code).toContain('py.mod(-7, 3)');

  // Ausführungstest
  const output = eval(result.code);
  expect(output.x).toBe(3);
  expect(output.y).toBe(256);
  expect(output.z).toBe(2); // Python % vs JS %
});
```

### Coverage-Ziel
- Minimum: 90% Line Coverage
- Ziel: 95%+ für kritische Pfade (Transformer, Runtime)

## Konventionen

### Git Commits (Conventional Commits)
```
feat: add slice operation support
fix: handle negative indices in py.slice
test: add comprehensive slice tests
refactor: extract common visitor logic
docs: update API documentation
chore: upgrade dependencies
```

### Code Style
- ESLint mit TypeScript-Regeln
- Prettier für Formatierung
- Strenge TypeScript-Einstellungen (`strict: true`)

## Nächste Schritte

1. **Projektsetup** - Package.json, TypeScript-Config, Vitest
2. **Parser-Integration** - Lezer-Python einbinden und testen
3. **Basis-Transformer** - Literale und einfache Ausdrücke
4. **Code Generator** - TypeScript-Output generieren
5. **Erste E2E-Tests** - Einfache Python → TS Konvertierung

---

*Letztes Update: 2026-01-16*

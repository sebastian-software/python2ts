import type { TransformContext } from "./types.js"

/**
 * JavaScript/TypeScript reserved keywords that cannot be used as variable names.
 * Python allows these as identifiers, so we need to rename them.
 */
export const JS_RESERVED_KEYWORDS = new Set([
  // ECMAScript reserved words
  "break",
  "case",
  "catch",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "finally",
  "for",
  "function",
  "if",
  "in",
  "instanceof",
  "new",
  "return",
  "switch",
  "this",
  "throw",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  // ECMAScript 6+ reserved words
  "class",
  "const",
  "enum",
  "export",
  "extends",
  "import",
  // Note: 'super' is intentionally NOT in this list as it's valid in JS class contexts
  // Strict mode reserved words
  "implements",
  "interface",
  "let",
  "package",
  "private",
  "protected",
  "public",
  "static",
  "yield",
  // TypeScript reserved words
  "abstract",
  "as",
  "async",
  "await",
  "declare",
  "is",
  "module",
  "namespace",
  "require",
  "type"
  // Note: 'get', 'set', 'from', 'of' are contextual keywords and valid as identifiers
])

/**
 * Escape a variable name if it's a reserved keyword.
 * Adds underscore prefix to reserved keywords.
 */
export function escapeReservedKeyword(name: string): string {
  return JS_RESERVED_KEYWORDS.has(name) ? `_${name}` : name
}

/**
 * Create a new transform context for processing Python source.
 */
export function createContext(source: string): TransformContext {
  return {
    source,
    indentLevel: 0,
    usesRuntime: new Set(),
    scopeStack: [new Set()], // Start with one global scope
    definedClasses: new Set(),
    insideFunctionBody: 0,
    insideTryBlock: 0,
    hoistedImports: []
  }
}

/** Push a new scope onto the stack */
export function pushScope(ctx: TransformContext): void {
  ctx.scopeStack.push(new Set())
}

/** Pop the current scope from the stack */
export function popScope(ctx: TransformContext): void {
  if (ctx.scopeStack.length > 1) {
    ctx.scopeStack.pop()
  }
}

/** Check if a variable is declared in any accessible scope */
export function isVariableDeclared(ctx: TransformContext, name: string): boolean {
  for (const scope of ctx.scopeStack) {
    if (scope.has(name)) return true
  }
  return false
}

/** Declare a variable in the current (top) scope */
export function declareVariable(ctx: TransformContext, name: string): void {
  const currentScope = ctx.scopeStack[ctx.scopeStack.length - 1]
  if (currentScope) {
    currentScope.add(name)
  }
}

/**
 * Strip outer parentheses from an expression if they're redundant.
 * Used to avoid double-parentheses in conditions like `if ((x === y))`.
 * Does NOT strip if the expression contains an assignment (walrus operator needs double parens).
 */
export function stripOuterParens(code: string): string {
  const trimmed = code.trim()
  if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
    // Don't strip if this contains an assignment expression (walrus operator)
    // Assignment in condition requires double parens: if ((x = getValue()))
    const inner = trimmed.slice(1, -1)
    // Check for assignment: = not preceded by !, =, <, > (to avoid ==, !=, <=, >=)
    if (/(?<![!=<>])=(?!=)/.test(inner)) {
      return code
    }

    // Check if the parens are balanced (not just opening and closing separately)
    let depth = 0
    for (let i = 0; i < trimmed.length; i++) {
      if (trimmed[i] === "(") depth++
      else if (trimmed[i] === ")") depth--
      // If depth reaches 0 before the end, the outer parens aren't matched
      if (depth === 0 && i < trimmed.length - 1) return code
    }
    // Safe to strip the outer parens
    return inner
  }
  return code
}

/** Map of Python built-in types to TypeScript types */
export const PYTHON_TO_TS_TYPES: Record<string, string> = {
  str: "string",
  int: "number",
  float: "number",
  bool: "boolean",
  bytes: "Uint8Array",
  None: "null",
  Any: "any",
  object: "object"
}

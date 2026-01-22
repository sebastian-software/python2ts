import type { SyntaxNode } from "@lezer/common"
import { getNodeText, getChildren, parse, type ParseResult } from "../parser/index.js"
import { toJsName } from "./name-mappings.js"

/**
 * JavaScript/TypeScript reserved keywords that cannot be used as variable names.
 * Python allows these as identifiers, so we need to rename them.
 */
const JS_RESERVED_KEYWORDS = new Set([
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
function escapeReservedKeyword(name: string): string {
  return JS_RESERVED_KEYWORDS.has(name) ? `_${name}` : name
}

export interface TransformContext {
  source: string
  indentLevel: number
  usesRuntime: Set<string>
  /** Stack of scopes - each scope is a set of variable names declared in that scope */
  scopeStack: Set<string>[]
  /** Set of class names defined in this module (for adding 'new' on instantiation) */
  definedClasses: Set<string>
  /** Whether currently processing an abstract class (ABC) */
  isAbstractClass?: boolean
  /** Depth counter for function bodies (0 = module level, 1+ = inside function) */
  insideFunctionBody: number
  /** Imports found inside function bodies that need to be hoisted to module level */
  hoistedImports: string[]
}

export interface TransformResult {
  code: string
  usesRuntime: Set<string>
  hoistedImports: string[]
}

function createContext(source: string): TransformContext {
  return {
    source,
    indentLevel: 0,
    usesRuntime: new Set(),
    scopeStack: [new Set()], // Start with one global scope
    definedClasses: new Set(),
    insideFunctionBody: 0,
    hoistedImports: []
  }
}

/** Push a new scope onto the stack */
function pushScope(ctx: TransformContext): void {
  ctx.scopeStack.push(new Set())
}

/** Pop the current scope from the stack */
function popScope(ctx: TransformContext): void {
  if (ctx.scopeStack.length > 1) {
    ctx.scopeStack.pop()
  }
}

/** Check if a variable is declared in any accessible scope */
function isVariableDeclared(ctx: TransformContext, name: string): boolean {
  for (const scope of ctx.scopeStack) {
    if (scope.has(name)) return true
  }
  return false
}

/** Declare a variable in the current (top) scope */
function declareVariable(ctx: TransformContext, name: string): void {
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
function stripOuterParens(code: string): string {
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

/** Check if a node or any of its descendants contain a yield statement */
function containsYield(node: SyntaxNode): boolean {
  if (node.name === "YieldStatement" || node.name === "YieldExpression") {
    return true
  }
  // Don't recurse into nested function definitions - their yields are for their own scope
  if (node.name === "FunctionDefinition" || node.name === "LambdaExpression") {
    return false
  }
  for (const child of getChildren(node)) {
    if (containsYield(child)) {
      return true
    }
  }
  return false
}

/** Map of Python built-in types to TypeScript types */
const PYTHON_TO_TS_TYPES: Record<string, string> = {
  str: "string",
  int: "number",
  float: "number",
  bool: "boolean",
  bytes: "Uint8Array",
  None: "null",
  Any: "any",
  object: "object"
}

/**
 * Transform a Python type annotation to TypeScript
 */
function transformPythonType(node: SyntaxNode, ctx: TransformContext): string {
  switch (node.name) {
    case "VariableName": {
      const typeName = getNodeText(node, ctx.source)
      return PYTHON_TO_TS_TYPES[typeName] ?? typeName
    }

    case "None":
      return "null"

    case "MemberExpression": {
      // Generic types like list[str], dict[str, int], Optional[T]
      const children = getChildren(node)
      const baseType = children[0]
      if (!baseType) return getNodeText(node, ctx.source)

      const baseName = getNodeText(baseType, ctx.source)

      // Extract type arguments between [ and ]
      const bracketStart = children.findIndex((c) => c.name === "[")
      const bracketEnd = children.findIndex((c) => c.name === "]")
      /* v8 ignore next 3 -- malformed type annotation fallback @preserve */
      if (bracketStart === -1 || bracketEnd === -1) {
        return PYTHON_TO_TS_TYPES[baseName] ?? baseName
      }

      // Raw type argument nodes (before transformation)
      const rawTypeArgNodes = children
        .slice(bracketStart + 1, bracketEnd)
        .filter((c) => c.name !== ",")

      // Special handling for Callable to get proper parameter types
      if (baseName === "Callable") {
        return transformCallableType(rawTypeArgNodes, ctx)
      }

      const typeArgs = rawTypeArgNodes.map((c) => transformPythonType(c, ctx))

      // Handle specific Python generic types
      const first = typeArgs[0] ?? "unknown"
      const second = typeArgs[1] ?? "unknown"
      const last = typeArgs[typeArgs.length - 1] ?? "unknown"

      switch (baseName) {
        case "list":
        case "List":
          return typeArgs.length > 0 ? `${first}[]` : "unknown[]"
        case "dict":
        case "Dict":
          return typeArgs.length >= 2 ? `Record<${first}, ${second}>` : "Record<string, unknown>"
        case "set":
        case "Set":
          return typeArgs.length > 0 ? `Set<${first}>` : "Set<unknown>"
        case "frozenset":
        case "FrozenSet":
          /* v8 ignore next -- rare type annotation @preserve */
          return typeArgs.length > 0 ? `ReadonlySet<${first}>` : "ReadonlySet<unknown>"
        case "tuple":
        case "Tuple":
          return `[${typeArgs.join(", ")}]`
        case "Optional":
          return typeArgs.length > 0 ? `${first} | null` : "unknown | null"
        case "Union":
          return typeArgs.join(" | ")
        case "Final":
          // Final[T] -> T (the 'const' or 'readonly' is handled at declaration level)
          return typeArgs.length > 0 ? first : "unknown"
        case "ClassVar":
          // ClassVar[T] -> T (the 'static' is handled at declaration level)
          return typeArgs.length > 0 ? first : "unknown"
        // Callable is handled specially before the switch via transformCallableType
        /* v8 ignore start -- rare typing module types @preserve */
        case "Iterable":
          return typeArgs.length > 0 ? `Iterable<${first}>` : "Iterable<unknown>"
        case "Iterator":
          return typeArgs.length > 0 ? `Iterator<${first}>` : "Iterator<unknown>"
        case "Generator":
          // Generator[YieldType, SendType, ReturnType]
          return typeArgs.length > 0 ? `Generator<${typeArgs.join(", ")}>` : "Generator<unknown>"
        case "AsyncGenerator":
          return typeArgs.length > 0
            ? `AsyncGenerator<${typeArgs.join(", ")}>`
            : "AsyncGenerator<unknown>"
        case "Awaitable":
          return typeArgs.length > 0 ? `Promise<${first}>` : "Promise<unknown>"
        case "Coroutine":
          return typeArgs.length > 0 ? `Promise<${last}>` : "Promise<unknown>"
        case "Type":
          return typeArgs.length > 0
            ? `new (...args: unknown[]) => ${first}`
            : "new (...args: unknown[]) => unknown"
        /* v8 ignore stop */
        /* v8 ignore start -- Literal type edge cases @preserve */
        case "Literal": {
          // Literal["a", "b"] -> "a" | "b"
          // Literal[1, 2, 3] -> 1 | 2 | 3
          const literalValues = typeArgs.map((arg) => {
            // If it's a number, keep as-is
            if (/^-?\d+(\.\d+)?$/.test(arg)) {
              return arg
            }
            // If it's already quoted, keep as-is
            if (arg.startsWith('"') || arg.startsWith("'")) {
              return arg
            }
            // Otherwise wrap in quotes (it was a string literal)
            return `"${arg}"`
          })
          return literalValues.join(" | ")
        }
        /* v8 ignore stop */
        /* v8 ignore next 3 -- generic fallback for custom types @preserve */
        default:
          // Generic class type: MyClass[T] -> MyClass<T>
          return typeArgs.length > 0 ? `${baseName}<${typeArgs.join(", ")}>` : baseName
      }
    }

    /* v8 ignore start -- rare type annotation patterns @preserve */
    case "BinaryExpression": {
      // Union types: int | str | None
      const children = getChildren(node)
      const left = children[0]
      const op = children[1]
      const right = children[2]

      if (op && getNodeText(op, ctx.source) === "|" && left && right) {
        const leftType = transformPythonType(left, ctx)
        const rightType = transformPythonType(right, ctx)
        return `${leftType} | ${rightType}`
      }
      return getNodeText(node, ctx.source)
    }

    case "String": {
      // Forward reference: "MyClass" -> MyClass
      const text = getNodeText(node, ctx.source)
      // Remove quotes
      return text.slice(1, -1)
    }

    case "TypeDef": {
      // TypeDef contains : and the actual type
      const children = getChildren(node)
      const typeNode = children.find((c) => c.name !== ":")
      if (typeNode) {
        return transformPythonType(typeNode, ctx)
      }
      return "unknown"
    }
    /* v8 ignore stop */

    /* v8 ignore next 2 -- fallback for unhandled type nodes @preserve */
    default:
      return getNodeText(node, ctx.source)
  }
}

/**
 * Extract type annotation from a TypeDef node, if present
 * Returns null if no type is found
 */
function extractTypeAnnotation(
  typeDef: SyntaxNode | undefined,
  ctx: TransformContext
): string | null {
  if (typeDef?.name !== "TypeDef") return null
  const children = getChildren(typeDef)
  const typeNode = children.find((c) => c.name !== ":" && c.name !== "->")
  if (typeNode) {
    return transformPythonType(typeNode, ctx)
  }
  return null
}

interface TypeModifiers {
  isFinal: boolean
  isClassVar: boolean
}

/**
 * Extract type modifiers (Final, ClassVar) from a TypeDef node
 * Returns the modifiers found in the type annotation
 */
function extractTypeModifiers(
  typeDef: SyntaxNode | undefined,
  ctx: TransformContext
): TypeModifiers {
  const result: TypeModifiers = { isFinal: false, isClassVar: false }
  if (typeDef?.name !== "TypeDef") return result

  const children = getChildren(typeDef)
  const typeNode = children.find((c) => c.name !== ":" && c.name !== "->")
  if (!typeNode) return result

  // Check if the type is a MemberExpression (generic type like Final[T])
  if (typeNode.name === "MemberExpression") {
    const typeChildren = getChildren(typeNode)
    const baseType = typeChildren[0]
    if (baseType) {
      const baseName = getNodeText(baseType, ctx.source)
      if (baseName === "Final") {
        result.isFinal = true
      } else if (baseName === "ClassVar") {
        result.isClassVar = true
      }
    }
  } else if (typeNode.name === "VariableName") {
    // Could be just "Final" without type argument (Final = Final[Any])
    const typeName = getNodeText(typeNode, ctx.source)
    if (typeName === "Final") {
      result.isFinal = true
    } else if (typeName === "ClassVar") {
      result.isClassVar = true
    }
  }

  return result
}

/**
 * Transform Callable type annotation to TypeScript function type
 * Callable[[int, str], bool] -> (arg0: number, arg1: string) => boolean
 */
function transformCallableType(rawTypeArgNodes: SyntaxNode[], ctx: TransformContext): string {
  if (rawTypeArgNodes.length < 2) {
    return "(...args: unknown[]) => unknown"
  }

  const paramListNode = rawTypeArgNodes[0]
  const returnTypeNode = rawTypeArgNodes[rawTypeArgNodes.length - 1]

  // Extract parameter types from the first argument (should be an array/list)
  let paramTypes: string[] = []
  if (paramListNode) {
    // The first argument should be a list: [int, str]
    const paramListChildren = getChildren(paramListNode)
    const innerTypes = paramListChildren.filter(
      (c) => c.name !== "[" && c.name !== "]" && c.name !== ","
    )

    if (innerTypes.length > 0) {
      paramTypes = innerTypes.map((c) => transformPythonType(c, ctx))
    }
  }

  const returnType = returnTypeNode ? transformPythonType(returnTypeNode, ctx) : "unknown"

  // If paramListNode was a proper list (has children like [ and ]), use explicit params
  // Otherwise, fall back to generic args
  if (paramListNode) {
    const paramListChildren = getChildren(paramListNode)
    const hasBrackets = paramListChildren.some((c) => c.name === "[" || c.name === "]")

    if (hasBrackets) {
      // It's a list notation - could be empty or have params
      const params = paramTypes.map((t, i) => `arg${String(i)}: ${t}`).join(", ")
      return `(${params}) => ${returnType}`
    }
  }

  // Fallback for malformed or bare Callable
  return `(...args: unknown[]) => ${returnType}`
}

// ============================================================================
// Docstring → JSDoc helpers
// ============================================================================

interface ParsedDocstring {
  description: string
  params: { name: string; description: string }[]
  returns: string | null
  throws: { type: string; description: string }[]
}

/**
 * Check if a node is a docstring (ExpressionStatement containing a String)
 */
function isDocstringNode(node: SyntaxNode, ctx: TransformContext): boolean {
  if (node.name !== "ExpressionStatement") return false
  const children = getChildren(node)
  const firstChild = children[0]
  if (firstChild?.name !== "String") return false

  const text = getNodeText(firstChild, ctx.source)
  // Must be a triple-quoted string (with optional r/R/u/U prefix for raw/unicode strings)
  return isTripleQuotedString(text)
}

/**
 * Check if a string literal is a triple-quoted string (docstring candidate)
 * Handles prefixes: r, R, u, U (raw and unicode strings)
 */
function isTripleQuotedString(text: string): boolean {
  // Strip optional prefix (r, R, u, U)
  let stripped = text
  if (/^[rRuU]/.test(text)) {
    stripped = text.slice(1)
  }
  return stripped.startsWith('"""') || stripped.startsWith("'''")
}

/**
 * Extract docstring content from a triple-quoted string
 * Handles prefixes: r, R, u, U (raw and unicode strings)
 */
function extractDocstringContent(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  const stringNode = children[0]
  if (!stringNode) return ""

  let text = getNodeText(stringNode, ctx.source)

  // Strip optional prefix (r, R, u, U) for raw/unicode strings
  if (/^[rRuU]/.test(text)) {
    text = text.slice(1)
  }

  // Remove triple quotes (""" or ''')
  let content = text
  if (content.startsWith('"""')) {
    content = content.slice(3, -3)
  } else if (content.startsWith("'''")) {
    content = content.slice(3, -3)
  }

  // Normalize line endings and trim
  content = content.replace(/\r\n/g, "\n").trim()

  return content
}

/**
 * Parse a docstring into structured components (Google-style or NumPy-style)
 */
function parseDocstring(content: string): ParsedDocstring {
  const result: ParsedDocstring = {
    description: "",
    params: [],
    returns: null,
    throws: []
  }

  const lines = content.split("\n")
  let currentSection: "description" | "params" | "returns" | "throws" = "description"
  const descriptionLines: string[] = []
  let currentParamName = ""
  let currentParamDesc: string[] = []
  let currentThrowsType = ""
  let currentThrowsDesc: string[] = []
  const returnsLines: string[] = []

  // Helper to flush current param
  const flushParam = () => {
    if (currentParamName) {
      result.params.push({
        name: currentParamName,
        description: currentParamDesc.join(" ").trim()
      })
      currentParamName = ""
      currentParamDesc = []
    }
  }

  // Helper to flush current throws
  const flushThrows = () => {
    if (currentThrowsType || currentThrowsDesc.length > 0) {
      result.throws.push({
        type: currentThrowsType || "Error",
        description: currentThrowsDesc.join(" ").trim()
      })
      currentThrowsType = ""
      currentThrowsDesc = []
    }
  }

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex] ?? ""
    const trimmed = line.trim()

    // Skip NumPy-style dashed underlines (e.g., "----------")
    if (/^-+$/.test(trimmed)) {
      continue
    }

    // Check for section headers (Google-style with colon, or NumPy-style without)
    // NumPy-style: section name followed by dashed underline on next line
    const nextLine = lines[lineIndex + 1]?.trim() ?? ""
    const isNumpySection = /^-+$/.test(nextLine)

    if (
      /^(Args|Arguments|Parameters):?$/i.test(trimmed) &&
      (trimmed.endsWith(":") || isNumpySection)
    ) {
      currentSection = "params"
      continue
    }
    if (/^(Returns?|Yields?):?$/i.test(trimmed) && (trimmed.endsWith(":") || isNumpySection)) {
      flushParam()
      currentSection = "returns"
      continue
    }
    if (
      /^(Raises?|Throws?|Exceptions?):?$/i.test(trimmed) &&
      (trimmed.endsWith(":") || isNumpySection)
    ) {
      flushParam()
      currentSection = "throws"
      continue
    }

    // Skip other section markers like "Examples:", "Notes:", "See Also:", etc.
    if (/^[A-Z][a-z]+:?$/.test(trimmed) && (trimmed.endsWith(":") || isNumpySection)) {
      continue
    }

    switch (currentSection) {
      case "description":
        descriptionLines.push(trimmed)
        break

      case "params": {
        // Google-style: "name (type): description" or "name: description"
        // NumPy-style: "name : type" (description on following indented lines)
        const googleMatch = /^(\w+)\s*(?:\([^)]*\))?\s*:\s*(.*)$/.exec(trimmed)
        if (googleMatch) {
          flushParam()
          currentParamName = googleMatch[1] ?? ""
          const afterColon = googleMatch[2] ?? ""
          // Check if this looks like a type (single word or type expression) vs description
          // NumPy puts type after colon, Google puts description
          // If it's a type (e.g., "str", "int", "array_like"), don't add to description
          const looksLikeType = /^[a-z_][a-z0-9_]*(?:\s+(?:of|or)\s+[a-z_][a-z0-9_]*)*$/i.test(
            afterColon
          )
          if (afterColon && !looksLikeType) {
            currentParamDesc.push(afterColon)
          }
        } else if (currentParamName && trimmed) {
          // Continuation line for current param
          currentParamDesc.push(trimmed)
        }
        break
      }

      case "returns": {
        // Skip NumPy-style type-only lines (e.g., "str", "int", "ndarray")
        const looksLikeType = /^[a-z_][a-z0-9_]*$/i.test(trimmed)
        if (looksLikeType && returnsLines.length === 0) {
          // Skip type annotation line in NumPy style
          continue
        }
        // Strip type prefix like "str: " or "(str): " in Google style
        const stripped = trimmed.replace(/^(?:\([^)]*\)|[^:]+):\s*/, "")
        if (stripped || trimmed) {
          returnsLines.push(stripped || trimmed)
        }
        break
      }

      case "throws": {
        // Google-style: "ValueError: description"
        const throwsMatch = /^(\w+)\s*:\s*(.*)$/.exec(trimmed)
        if (throwsMatch) {
          flushThrows()
          currentThrowsType = throwsMatch[1] ?? "Error"
          const desc = throwsMatch[2] ?? ""
          if (desc) currentThrowsDesc.push(desc)
        } else if (/^[A-Z][a-zA-Z]*(?:Error|Exception|Warning)?$/.test(trimmed)) {
          // NumPy-style: exception type on its own line (e.g., "ValueError")
          flushThrows()
          currentThrowsType = trimmed
        } else if (trimmed) {
          currentThrowsDesc.push(trimmed)
        }
        break
      }
    }
  }

  // Flush any remaining
  flushParam()
  flushThrows()

  result.description = descriptionLines.join("\n").trim()
  if (returnsLines.length > 0) {
    result.returns = returnsLines.join(" ").trim()
  }

  return result
}

/**
 * Convert a parsed docstring to JSDoc format
 */
function toJSDoc(parsed: ParsedDocstring, indent: string): string {
  const lines: string[] = []

  lines.push(`${indent}/**`)

  // Description
  if (parsed.description) {
    const descLines = parsed.description.split("\n")
    for (const line of descLines) {
      if (line.trim()) {
        lines.push(`${indent} * ${line}`)
      } else {
        lines.push(`${indent} *`)
      }
    }
  }

  // Add blank line if we have description and other tags
  if (
    parsed.description &&
    (parsed.params.length > 0 || parsed.returns || parsed.throws.length > 0)
  ) {
    lines.push(`${indent} *`)
  }

  // Params
  for (const param of parsed.params) {
    if (param.description) {
      lines.push(`${indent} * @param ${param.name} - ${param.description}`)
    } else {
      lines.push(`${indent} * @param ${param.name}`)
    }
  }

  // Returns
  if (parsed.returns) {
    lines.push(`${indent} * @returns ${parsed.returns}`)
  }

  // Throws
  for (const t of parsed.throws) {
    lines.push(`${indent} * @throws {${t.type}} ${t.description}`)
  }

  lines.push(`${indent} */`)

  return lines.join("\n")
}

/**
 * Extract docstring from a function/class body, returning the JSDoc and remaining body statements
 */
function extractDocstringFromBody(
  bodyNode: SyntaxNode,
  ctx: TransformContext,
  indent: string
): { jsdoc: string | null; skipFirstStatement: boolean } {
  const children = getChildren(bodyNode)
  const statements = children.filter((c) => c.name !== ":")

  const firstStatement = statements[0]
  if (firstStatement && isDocstringNode(firstStatement, ctx)) {
    const content = extractDocstringContent(firstStatement, ctx)
    const parsed = parseDocstring(content)
    const jsdoc = toJSDoc(parsed, indent)
    return { jsdoc, skipFirstStatement: true }
  }

  return { jsdoc: null, skipFirstStatement: false }
}

export function transform(input: string | ParseResult): TransformResult {
  const parseResult = typeof input === "string" ? parse(input) : input
  const ctx = createContext(parseResult.source)
  const code = transformNode(parseResult.tree.topNode, ctx)

  return {
    code,
    usesRuntime: ctx.usesRuntime,
    hoistedImports: ctx.hoistedImports
  }
}

function transformNode(node: SyntaxNode, ctx: TransformContext): string {
  switch (node.name) {
    case "Script":
      return transformScript(node, ctx)
    case "ExpressionStatement":
      return transformExpressionStatement(node, ctx)
    case "AssignStatement":
      return transformAssignStatement(node, ctx)
    case "UpdateStatement":
      return transformUpdateStatement(node, ctx)
    case "BinaryExpression":
      return transformBinaryExpression(node, ctx)
    case "UnaryExpression":
      return transformUnaryExpression(node, ctx)
    case "ParenthesizedExpression":
      return transformParenthesizedExpression(node, ctx)
    case "NamedExpression":
      return transformNamedExpression(node, ctx)
    case "ConditionalExpression":
      return transformConditionalExpression(node, ctx)
    case "Number":
      return transformNumber(node, ctx)
    case "String":
      return transformString(node, ctx)
    case "FormatString":
      return transformFormatString(node, ctx)
    case "ContinuedString":
      return transformContinuedString(node, ctx)
    case "Boolean":
      return transformBoolean(node, ctx)
    case "None":
      return "null"
    case "VariableName":
      return escapeReservedKeyword(getNodeText(node, ctx.source))
    case "CallExpression":
      return transformCallExpression(node, ctx)
    case "MemberExpression":
      return transformMemberExpression(node, ctx)
    case "ArrayExpression":
      return transformArrayExpression(node, ctx)
    case "ArrayComprehensionExpression":
      return transformArrayComprehension(node, ctx)
    case "DictionaryExpression":
      return transformDictionaryExpression(node, ctx)
    case "DictionaryComprehensionExpression":
      return transformDictComprehension(node, ctx)
    case "SetExpression":
      return transformSetExpression(node, ctx)
    case "SetComprehensionExpression":
      return transformSetComprehension(node, ctx)
    case "ComprehensionExpression":
      return transformGeneratorExpression(node, ctx)
    case "TupleExpression":
      return transformTupleExpression(node, ctx)
    case "IfStatement":
      return transformIfStatement(node, ctx)
    case "WhileStatement":
      return transformWhileStatement(node, ctx)
    case "ForStatement":
      return transformForStatement(node, ctx)
    case "PassStatement":
      return ""
    case "BreakStatement":
      return "break"
    case "ContinueStatement":
      return "continue"
    case "ReturnStatement":
      return transformReturnStatement(node, ctx)
    case "FunctionDefinition":
      return transformFunctionDefinition(node, ctx)
    case "ClassDefinition":
      return transformClassDefinition(node, ctx)
    case "DecoratedStatement":
      return transformDecoratedStatement(node, ctx)
    case "LambdaExpression":
      return transformLambdaExpression(node, ctx)
    case "Comment":
      return transformComment(node, ctx)
    case "TryStatement":
      return transformTryStatement(node, ctx)
    case "RaiseStatement":
      return transformRaiseStatement(node, ctx)
    case "ImportStatement":
      return transformImportStatement(node, ctx)
    case "AwaitExpression":
      return transformAwaitExpression(node, ctx)
    case "WithStatement":
      return transformWithStatement(node, ctx)
    case "MatchStatement":
      return transformMatchStatement(node, ctx)
    case "ScopeStatement":
      return transformScopeStatement(node, ctx)
    case "DeleteStatement":
      return transformDeleteStatement(node, ctx)
    case "AssertStatement":
      return transformAssertStatement(node, ctx)
    case "YieldStatement":
      return transformYieldStatement(node, ctx)
    case "Ellipsis":
      // Python's Ellipsis literal (...) - used in NumPy for multi-dimensional slicing
      ctx.usesRuntime.add("Ellipsis")
      return "Ellipsis"
    /* v8 ignore next 2 -- fallback for unknown AST nodes @preserve */
    default:
      return getNodeText(node, ctx.source)
  }
}

function transformScript(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)

  // Check for module-level docstring (first statement is a docstring)
  // Only treat as docstring if there's actual code following it
  let moduleDocstring = ""
  let startIndex = 0
  const filteredChildren = children.filter(
    (child) => child.name !== "Comment" || getNodeText(child, ctx.source).trim() !== ""
  )

  if (filteredChildren.length > 1) {
    const firstChild = filteredChildren[0]
    if (firstChild && isDocstringNode(firstChild, ctx)) {
      // Extract and convert to JSDoc @module comment
      const content = extractDocstringContent(firstChild, ctx)
      const parsed = parseDocstring(content)
      const jsdoc = toJSDoc(parsed, "")
      // Add @module tag
      moduleDocstring = jsdoc.replace(" */", " * @module\n */")
      startIndex = 1
    }
  }

  const statements = filteredChildren
    .slice(startIndex)
    .map((child) => {
      const transformed = transformNode(child, ctx)
      // Skip empty transformations (e.g., pass, TypeVar declarations)
      if (transformed === "") {
        return ""
      }
      if (
        child.name === "ExpressionStatement" ||
        child.name === "AssignStatement" ||
        child.name === "PassStatement" ||
        child.name === "BreakStatement" ||
        child.name === "ContinueStatement" ||
        child.name === "ReturnStatement" ||
        child.name === "RaiseStatement"
      ) {
        return transformed + ";"
      }
      return transformed
    })
    .filter((s) => s.trim() !== "")

  if (moduleDocstring) {
    return moduleDocstring + "\n" + statements.join("\n")
  }
  return statements.join("\n")
}

function transformExpressionStatement(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  if (children.length === 0) return ""
  const firstChild = children[0]
  if (!firstChild) return ""
  return transformNode(firstChild, ctx)
}

function transformAssignStatement(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  if (children.length < 3) return getNodeText(node, ctx.source)

  // Check for chained assignment: a = b = c = value
  // Multiple AssignOp nodes indicate chained assignment
  const assignOpIndices = children
    .map((c, i) => (c.name === "AssignOp" || c.name === "=" ? i : -1))
    .filter((i) => i !== -1)

  if (assignOpIndices.length > 1) {
    // Chained assignment: extract all targets and the final value
    // Pattern: target1 = target2 = ... = value
    const targets: SyntaxNode[] = []
    const lastAssignOpIndex = assignOpIndices[assignOpIndices.length - 1]
    if (lastAssignOpIndex === undefined) return getNodeText(node, ctx.source)

    for (let i = 0; i < assignOpIndices.length; i++) {
      const opIndex = assignOpIndices[i]
      if (opIndex === undefined) continue
      // Target is the node(s) before this AssignOp (after previous AssignOp or start)
      const prevOpIndex = i > 0 ? assignOpIndices[i - 1] : -1
      const startIdx = prevOpIndex !== undefined ? prevOpIndex + 1 : 0
      const targetNodes = children.slice(startIdx, opIndex).filter((c) => c.name !== ",")
      if (targetNodes.length === 1 && targetNodes[0]) {
        targets.push(targetNodes[0])
      }
    }

    // Value is everything after the last AssignOp
    const valueNodes = children.slice(lastAssignOpIndex + 1).filter((c) => c.name !== ",")
    if (valueNodes.length !== 1 || !valueNodes[0]) return getNodeText(node, ctx.source)

    const valueCode = transformNode(valueNodes[0], ctx)

    // Generate chained assignment: let b = value; let a = b;
    // Assign to targets in reverse order (rightmost first)
    const results: string[] = []
    let lastVarName = valueCode

    for (let i = targets.length - 1; i >= 0; i--) {
      const target = targets[i]
      if (!target) continue
      const targetCode = transformNode(target, ctx)
      const varName = getNodeText(target, ctx.source)

      // Determine declaration keyword
      let needsDeclaration = false
      if (target.name === "VariableName" && !isVariableDeclared(ctx, varName)) {
        needsDeclaration = true
        declareVariable(ctx, varName)
      }

      const keyword = needsDeclaration ? "let " : ""
      results.push(`${keyword}${targetCode} = ${lastVarName}`)
      lastVarName = targetCode
    }

    return results.join(";\n")
  }

  // Find the assignment operator
  const assignOpIndex = children.findIndex((c) => c.name === "AssignOp" || c.name === "=")
  if (assignOpIndex === -1) return getNodeText(node, ctx.source)

  // Find type annotation (TypeDef before AssignOp)
  const typeDef = children.slice(0, assignOpIndex).find((c) => c.name === "TypeDef")

  // Check for trailing comma before AssignOp (indicates tuple unpacking even for single target)
  const beforeAssign = children.slice(0, assignOpIndex)
  const hasTrailingComma = beforeAssign.some((c) => c.name === ",")

  // Collect targets (before =) and values (after =)
  // Filter out commas and TypeDef nodes (type annotations like `: int`)
  const targets = beforeAssign.filter((c) => c.name !== "," && c.name !== "TypeDef")
  const values = children.slice(assignOpIndex + 1).filter((c) => c.name !== ",")

  /* v8 ignore next 3 -- defensive: empty targets/values can't occur with valid Python @preserve */
  if (targets.length === 0 || values.length === 0) {
    return getNodeText(node, ctx.source)
  }

  // Strip TypeVar declarations - they're only needed for Python type checking
  if (values.length === 1 && values[0]?.name === "CallExpression") {
    const callChildren = getChildren(values[0])
    const funcNode = callChildren.find((c) => c.name === "VariableName")
    if (funcNode && getNodeText(funcNode, ctx.source) === "TypeVar") {
      return ""
    }
  }

  // Handle TypeAlias: Name: TypeAlias = Type → type Name = Type
  if (typeDef && targets.length === 1 && values.length === 1) {
    const typeDefText = getNodeText(typeDef, ctx.source)
    const target = targets[0]
    const value = values[0]
    if (typeDefText.includes("TypeAlias") && target && value) {
      const aliasName = getNodeText(target, ctx.source)
      const aliasType = transformPythonType(value, ctx)
      return `type ${aliasName} = ${aliasType}`
    }
  }

  // Single target assignment (but not if there's a trailing comma, which indicates tuple unpacking)
  if (targets.length === 1 && !hasTrailingComma) {
    const target = targets[0]
    /* v8 ignore next -- @preserve */
    if (!target) return getNodeText(node, ctx.source)

    // Check for slice assignment: arr[1:3] = values
    if (target.name === "MemberExpression" && isSliceExpression(target)) {
      return transformSliceAssignment(target, values, ctx)
    }

    const targetCode = transformNode(target, ctx)

    // Extract type annotation if present
    const tsType = extractTypeAnnotation(typeDef, ctx)
    const typeAnnotation = tsType ? `: ${tsType}` : ""

    // Extract type modifiers (Final, ClassVar) for declaration keyword
    const modifiers = extractTypeModifiers(typeDef, ctx)

    // Determine if we need a declaration keyword
    // - MemberExpression (obj.attr or arr[i]) never needs declaration
    // - VariableName needs declaration only if not already declared in an accessible scope
    let needsDeclaration = false
    if (target.name === "VariableName") {
      const varName = getNodeText(target, ctx.source)
      if (!isVariableDeclared(ctx, varName)) {
        needsDeclaration = true
        declareVariable(ctx, varName)
      }
    }

    // Use 'const' for Final, 'let' otherwise
    const declarationKeyword = modifiers.isFinal ? "const" : "let"

    if (values.length === 1) {
      const value = values[0]
      if (!value) return getNodeText(node, ctx.source)
      const valueCode = transformNode(value, ctx)
      if (needsDeclaration) {
        return `${declarationKeyword} ${targetCode}${typeAnnotation} = ${valueCode}`
      }
      return `${targetCode} = ${valueCode}`
    } else {
      // Multiple values into single target (creates array)
      // Handle spread operators: *expr becomes ...expr
      const valuesCodes = transformValuesWithSpread(values, ctx)
      if (needsDeclaration) {
        return `${declarationKeyword} ${targetCode}${typeAnnotation} = [${valuesCodes.join(", ")}]`
      }
      return `${targetCode} = [${valuesCodes.join(", ")}]`
    }
  }

  // Multiple target assignment (destructuring)
  const targetCodes = targets.map((t) => transformAssignTarget(t, ctx))
  const targetPattern = `[${targetCodes.join(", ")}]`

  // Track all variables in destructuring pattern
  const varNames = extractVariableNames(targets, ctx.source)
  // Check if all variables are already declared in accessible scopes
  const allDeclaredAtAccessibleScope = varNames.every((v) => isVariableDeclared(ctx, v))
  if (!allDeclaredAtAccessibleScope) {
    varNames.forEach((v) => {
      declareVariable(ctx, v)
    })
  }

  if (values.length === 1) {
    // Unpacking from single value: a, b = point
    const value = values[0]
    /* v8 ignore next -- @preserve */
    if (!value) return getNodeText(node, ctx.source)
    const valueCode = transformNode(value, ctx)
    return allDeclaredAtAccessibleScope
      ? `${targetPattern} = ${valueCode}`
      : `let ${targetPattern} = ${valueCode}`
  } else {
    // Multiple values: a, b = 1, 2
    // Handle spread operators: *expr becomes ...expr
    const valuesCodes = transformValuesWithSpread(values, ctx)
    return allDeclaredAtAccessibleScope
      ? `${targetPattern} = [${valuesCodes.join(", ")}]`
      : `let ${targetPattern} = [${valuesCodes.join(", ")}]`
  }
}

/**
 * Transform a list of value nodes, handling spread operators (* -> ...)
 * For assignments like: shape = *arr, 3 -> shape = [...arr, 3]
 */
function transformValuesWithSpread(values: SyntaxNode[], ctx: TransformContext): string[] {
  const result: string[] = []
  let i = 0

  while (i < values.length) {
    const value = values[i]
    if (!value) {
      i++
      continue
    }

    // Check for spread: * followed by an expression
    if (value.name === "*" || getNodeText(value, ctx.source) === "*") {
      const nextValue = values[i + 1]
      if (nextValue) {
        // This is a spread expression: *expr -> ...expr
        result.push(`...${transformNode(nextValue, ctx)}`)
        i += 2 // Skip both * and the expression
        continue
      }
    }

    // Regular value
    result.push(transformNode(value, ctx))
    i++
  }

  return result
}

function extractVariableNames(nodes: SyntaxNode[], source: string): string[] {
  const names: string[] = []
  for (const node of nodes) {
    if (node.name === "VariableName") {
      names.push(getNodeText(node, source))
    } else if (node.name === "TupleExpression") {
      const children = getChildren(node)
      names.push(
        ...extractVariableNames(
          children.filter((c) => c.name !== "(" && c.name !== ")" && c.name !== ","),
          source
        )
      )
    }
  }
  return names
}

/**
 * Transform Python's augmented assignment statement: x += value
 */
function transformUpdateStatement(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)

  // Structure: target UpdateOp value
  const target = children.find(
    (c) => c.name === "VariableName" || c.name === "MemberExpression" || c.name === "Subscript"
  )
  const op = children.find((c) => c.name === "UpdateOp")
  const value = children.find(
    (c) =>
      c !== target &&
      c.name !== "UpdateOp" &&
      c.name !== "(" &&
      c.name !== ")" &&
      c.name !== "," &&
      c.name !== ":"
  )

  if (!target || !op || !value) {
    return getNodeText(node, ctx.source)
  }

  const targetCode = transformNode(target, ctx)
  const opText = getNodeText(op, ctx.source)
  const valueCode = transformNode(value, ctx)

  return `${targetCode} ${opText} ${valueCode}`
}

/**
 * Check if a MemberExpression contains a slice (colon in the brackets)
 */
function isSliceExpression(node: SyntaxNode): boolean {
  const children = getChildren(node)
  // Look for a colon inside the brackets
  return children.some((c) => c.name === ":")
}

/**
 * Transform a slice assignment: arr[1:3] = values -> py.list.sliceAssign(arr, 1, 3, undefined, values)
 */
function transformSliceAssignment(
  target: SyntaxNode,
  values: SyntaxNode[],
  ctx: TransformContext
): string {
  const children = getChildren(target)

  // Find the object being sliced (first child before the bracket)
  const obj = children[0]
  if (!obj) return `/* slice assignment error */`

  const objCode = transformNode(obj, ctx)

  // Parse slice indices: [start:end:step]
  // Children after "[" and before "]" contain the slice parts
  const bracketStart = children.findIndex((c) => c.name === "[")
  const bracketEnd = children.findIndex((c) => c.name === "]")

  if (bracketStart === -1 || bracketEnd === -1) return `/* slice assignment error */`

  // Extract slice parts between brackets
  const sliceParts = children.slice(bracketStart + 1, bracketEnd)

  // Parse the slice notation
  // Possible patterns: [a:b], [:b], [a:], [:], [a:b:c], [::c], etc.
  let start: string | undefined
  let end: string | undefined
  let step: string | undefined

  const colonIndices: number[] = []
  for (let i = 0; i < sliceParts.length; i++) {
    if (sliceParts[i]?.name === ":") {
      colonIndices.push(i)
    }
  }

  if (colonIndices.length >= 1) {
    // Parts before first colon = start
    const beforeFirst = sliceParts.slice(0, colonIndices[0])
    if (beforeFirst.length > 0 && beforeFirst[0]?.name !== ":") {
      start = beforeFirst.map((n) => transformNode(n, ctx)).join("")
    }

    const firstColon = colonIndices[0] ?? 0
    const secondColon = colonIndices[1]

    if (colonIndices.length === 1) {
      // [start:end]
      const afterFirst = sliceParts.slice(firstColon + 1)
      if (afterFirst.length > 0) {
        end = afterFirst.map((n) => transformNode(n, ctx)).join("")
      }
    } else if (secondColon !== undefined) {
      // [start:end:step]
      const betweenColons = sliceParts.slice(firstColon + 1, secondColon)
      if (betweenColons.length > 0) {
        end = betweenColons.map((n) => transformNode(n, ctx)).join("")
      }
      const afterSecond = sliceParts.slice(secondColon + 1)
      if (afterSecond.length > 0) {
        step = afterSecond.map((n) => transformNode(n, ctx)).join("")
      }
    }
  }

  // Transform the values
  const firstValue = values[0]
  const valuesCode =
    values.length === 1 && firstValue
      ? transformNode(firstValue, ctx)
      : `[${values.map((v) => transformNode(v, ctx)).join(", ")}]`

  ctx.usesRuntime.add("list.sliceAssign")

  return `list.sliceAssign(${objCode}, ${start ?? "undefined"}, ${end ?? "undefined"}, ${step ?? "undefined"}, ${valuesCode})`
}

function transformAssignTarget(node: SyntaxNode, ctx: TransformContext): string {
  if (node.name === "VariableName") {
    // Escape reserved keywords in destructuring patterns
    return escapeReservedKeyword(getNodeText(node, ctx.source))
  } else if (node.name === "TupleExpression") {
    // Nested destructuring: (a, b) -> [a, b]
    const children = getChildren(node)
    const elements = children.filter((c) => c.name !== "(" && c.name !== ")" && c.name !== ",")
    return "[" + elements.map((e) => transformAssignTarget(e, ctx)).join(", ") + "]"
  }
  return transformNode(node, ctx)
}

function transformBinaryExpression(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  if (children.length < 3) return getNodeText(node, ctx.source)

  const left = children[0]
  const op = children[1]

  if (!left || !op) return getNodeText(node, ctx.source)

  const opText = getNodeText(op, ctx.source)

  // Handle 'is not' and 'not in' operators (4 children: left, is/not, not/in, right)
  if ((opText === "is" || opText === "not") && children.length >= 4) {
    const secondOp = children[2]
    const secondOpText = secondOp ? getNodeText(secondOp, ctx.source) : ""
    if (opText === "is" && secondOpText === "not") {
      // "is not" -> "!=="
      const right = children[3]
      if (!right) return getNodeText(node, ctx.source)
      const leftCode = transformNode(left, ctx)
      const rightCode = transformNode(right, ctx)
      return `(${leftCode} !== ${rightCode})`
    }
    if (opText === "not" && secondOpText === "in") {
      // "not in" -> "!contains()"
      const right = children[3]
      if (!right) return getNodeText(node, ctx.source)
      const leftCode = transformNode(left, ctx)
      const rightCode = transformNode(right, ctx)
      ctx.usesRuntime.add("contains")
      return `!contains(${leftCode}, ${rightCode})`
    }
  }

  const right = children[2]
  if (!right) return getNodeText(node, ctx.source)

  // Handle chained comparisons (e.g., 1 < 2 < 3 -> (1 < 2) && (2 < 3))
  if (isComparisonOperator(opText) && isChainedComparison(left)) {
    const leftComparison = transformNode(left, ctx)
    const middleValue = extractRightOperand(left, ctx)
    const rightCode = transformNode(right, ctx)
    return `(${leftComparison} && (${middleValue} ${opText} ${rightCode}))`
  }

  const leftCode = transformNode(left, ctx)
  const rightCode = transformNode(right, ctx)

  switch (opText) {
    case "//":
      ctx.usesRuntime.add("floorDiv")
      return `floorDiv(${leftCode}, ${rightCode})`
    case "**":
      ctx.usesRuntime.add("pow")
      return `pow(${leftCode}, ${rightCode})`
    case "%":
      // Check for string formatting (e.g., "Hello %s" % name)
      if (left.name === "String" || left.name === "FormatString") {
        ctx.usesRuntime.add("sprintf")
        return `sprintf(${leftCode}, ${rightCode})`
      }
      ctx.usesRuntime.add("mod")
      return `mod(${leftCode}, ${rightCode})`
    case "and":
      return `(${leftCode} && ${rightCode})`
    case "or":
      return `(${leftCode} || ${rightCode})`
    case "in":
      ctx.usesRuntime.add("contains")
      return `contains(${leftCode}, ${rightCode})`
    case "is":
      return `(${leftCode} === ${rightCode})`
    case "+":
      // Check for array concatenation
      if (isArrayLiteral(left) && isArrayLiteral(right)) {
        return `[...${leftCode}, ...${rightCode}]`
      }
      return `(${leftCode} + ${rightCode})`
    case "*":
      // Check for string/array repetition (e.g., 'ab' * 3 or [1, 2] * 3)
      if (isStringOrArrayLiteral(left) && isNumberLiteral(right)) {
        ctx.usesRuntime.add("repeatValue")
        return `repeatValue(${leftCode}, ${rightCode})`
      }
      if (isNumberLiteral(left) && isStringOrArrayLiteral(right)) {
        ctx.usesRuntime.add("repeatValue")
        return `repeatValue(${rightCode}, ${leftCode})`
      }
      return `(${leftCode} * ${rightCode})`
    /* v8 ignore next 2 -- pass-through for standard operators @preserve */
    default:
      return `(${leftCode} ${opText} ${rightCode})`
  }
}

function isArrayLiteral(node: SyntaxNode): boolean {
  return node.name === "ArrayExpression"
}

function isStringOrArrayLiteral(node: SyntaxNode): boolean {
  return node.name === "String" || node.name === "ArrayExpression"
}

function isNumberLiteral(node: SyntaxNode): boolean {
  return node.name === "Number"
}

function isComparisonOperator(op: string): boolean {
  return ["<", ">", "<=", ">=", "==", "!="].includes(op)
}

function isChainedComparison(node: SyntaxNode): boolean {
  // Check if node is a BinaryExpression with a comparison operator
  if (node.name !== "BinaryExpression") return false
  const children = getChildren(node)
  const op = children[1]
  if (op?.name !== "CompareOp") return false
  return true
}

function extractRightOperand(node: SyntaxNode, ctx: TransformContext): string {
  // Extract the right operand from a BinaryExpression
  const children = getChildren(node)
  const right = children[2]
  if (!right) return ""
  return transformNode(right, ctx)
}

function transformUnaryExpression(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  if (children.length < 2) return getNodeText(node, ctx.source)

  const op = children[0]
  const operand = children[1]

  if (!op || !operand) return getNodeText(node, ctx.source)

  const opText = getNodeText(op, ctx.source)
  const operandCode = transformNode(operand, ctx)

  switch (opText) {
    case "not":
      return `(!${operandCode})`
    /* v8 ignore next 2 -- pass-through for unary operators like - and + @preserve */
    default:
      return `(${opText}${operandCode})`
  }
}

function transformParenthesizedExpression(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  const inner = children.find((c) => c.name !== "(" && c.name !== ")")
  if (!inner) return "()"
  return `(${transformNode(inner, ctx)})`
}

function transformNamedExpression(node: SyntaxNode, ctx: TransformContext): string {
  // Walrus operator: (name := expr) → (name = expr)
  const children = getChildren(node)
  const varName = children.find((c) => c.name === "VariableName")
  const value = children.find((c) => c.name !== "VariableName" && c.name !== "AssignOp")

  /* v8 ignore next 3 -- defensive: walrus operator always has name and value @preserve */
  if (!varName || !value) {
    return getNodeText(node, ctx.source)
  }

  const name = getNodeText(varName, ctx.source)
  const valueCode = transformNode(value, ctx)

  return `${name} = ${valueCode}`
}

function transformConditionalExpression(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  // Python: value_if_true if condition else value_if_false
  // Format: TrueExpr 'if' Condition 'else' FalseExpr
  const exprs = children.filter((c) => c.name !== "if" && c.name !== "else" && c.name !== "Keyword")

  if (exprs.length >= 3) {
    const trueExpr = exprs[0]
    const condition = exprs[1]
    const falseExpr = exprs[2]

    /* v8 ignore next -- defensive: checked exprs.length >= 3 above @preserve */
    if (trueExpr && condition && falseExpr) {
      const condCode = stripOuterParens(transformNode(condition, ctx))
      const trueCode = transformNode(trueExpr, ctx)
      const falseCode = transformNode(falseExpr, ctx)

      return `(${condCode} ? ${trueCode} : ${falseCode})`
    }
  }

  /* v8 ignore next -- @preserve */
  return getNodeText(node, ctx.source)
}

function transformNumber(node: SyntaxNode, ctx: TransformContext): string {
  const text = getNodeText(node, ctx.source)
  // Handle Python numeric literals
  // Remove underscores (Python allows 1_000_000)
  return text.replace(/_/g, "")
}

function transformString(node: SyntaxNode, ctx: TransformContext): string {
  const text = getNodeText(node, ctx.source)

  // Handle bytes strings - remove the 'b' prefix
  // Python: b'hello' or b"hello" -> JS: 'hello' or "hello"
  // Escape sequences like \x03 work the same in JS
  if (text.startsWith('b"') || text.startsWith("b'")) {
    return text.slice(1)
  }
  if (text.startsWith('B"') || text.startsWith("B'")) {
    return text.slice(1)
  }
  // Handle raw bytes strings (br or rb prefix)
  if (
    text.startsWith('br"') ||
    text.startsWith("br'") ||
    text.startsWith('rb"') ||
    text.startsWith("rb'")
  ) {
    return text.slice(2)
  }
  if (
    text.startsWith('BR"') ||
    text.startsWith("BR'") ||
    text.startsWith('RB"') ||
    text.startsWith("RB'")
  ) {
    return text.slice(2)
  }
  if (
    text.startsWith('Br"') ||
    text.startsWith("Br'") ||
    text.startsWith('rB"') ||
    text.startsWith("rB'")
  ) {
    return text.slice(2)
  }
  if (
    text.startsWith('bR"') ||
    text.startsWith("bR'") ||
    text.startsWith('Rb"') ||
    text.startsWith("Rb'")
  ) {
    return text.slice(2)
  }

  // Handle raw strings
  if (text.startsWith('r"') || text.startsWith("r'")) {
    return text.slice(1)
  }
  if (text.startsWith('R"') || text.startsWith("R'")) {
    return text.slice(1)
  }

  // Handle unicode strings (Python 2 compatibility) - just remove the 'u' prefix
  if (text.startsWith('u"') || text.startsWith("u'")) {
    return text.slice(1)
  }
  if (text.startsWith('U"') || text.startsWith("U'")) {
    return text.slice(1)
  }

  // Handle triple-quoted strings
  if (text.startsWith('"""') || text.startsWith("'''")) {
    const content = text.slice(3, -3)
    return "`" + content.replace(/`/g, "\\`") + "`"
  }

  // Regular strings - convert to JS format
  // Python uses same string syntax as JS for basic cases
  return text
}

function transformFormatString(node: SyntaxNode, ctx: TransformContext): string {
  const text = getNodeText(node, ctx.source)
  const children = getChildren(node)

  // Find all FormatReplacement nodes
  const replacements = children.filter((c) => c.name === "FormatReplacement")

  // If no replacements, just convert to template literal
  if (replacements.length === 0) {
    // Handle escaped braces: {{ -> {, }} -> }
    // Remove the 'f' prefix and convert quotes to backticks
    let content: string
    if (text.startsWith('f"""') || text.startsWith("f'''")) {
      content = text.slice(4, -3)
    } else {
      content = text.slice(2, -1) // Remove f" and closing "
    }
    content = content.replace(/\{\{/g, "{").replace(/\}\}/g, "}")
    content = content.replace(/`/g, "\\`")
    return "`" + content + "`"
  }

  // Build template literal with replacements
  let result = "`"
  let pos = text.startsWith('f"""') || text.startsWith("f'''") ? 4 : 2 // Skip f" or f"""

  for (const replacement of replacements) {
    // Add static text before this replacement
    const staticText = text.slice(pos, replacement.from - node.from)
    // Handle escaped braces in static text
    result += staticText.replace(/\{\{/g, "{").replace(/\}\}/g, "}").replace(/`/g, "\\`")

    // Process the replacement
    const replChildren = getChildren(replacement)
    let expr: SyntaxNode | undefined
    let formatSpec: string | undefined
    let conversion: string | undefined

    for (const child of replChildren) {
      if (child.name === "{" || child.name === "}") continue
      if (child.name === "FormatSpec") {
        // Get the format spec without the leading colon
        formatSpec = getNodeText(child, ctx.source).slice(1)
      } else if (child.name === "FormatConversion") {
        // Get the conversion character (r, s, or a)
        conversion = getNodeText(child, ctx.source).slice(1) // Remove !
      } else {
        expr = child
      }
    }

    if (expr) {
      let exprCode = transformNode(expr, ctx)

      // Apply conversion first (!r, !s, !a)
      if (conversion === "r") {
        exprCode = `repr(${exprCode})`
        ctx.usesRuntime.add("repr")
      } else if (conversion === "s") {
        exprCode = `str(${exprCode})`
        ctx.usesRuntime.add("str")
      } else if (conversion === "a") {
        exprCode = `ascii(${exprCode})`
        ctx.usesRuntime.add("ascii")
      }

      // Apply format spec
      if (formatSpec) {
        ctx.usesRuntime.add("format")
        result += `\${format(${exprCode}, "${formatSpec}")}`
      } else {
        // Simple case - just the expression (with optional conversion already applied)
        result += `\${${exprCode}}`
      }
    }

    pos = replacement.to - node.from
  }

  // Add remaining static text
  const endPos =
    text.startsWith('f"""') || text.startsWith("f'''") ? text.length - 3 : text.length - 1
  const remainingText = text.slice(pos, endPos)
  result += remainingText.replace(/\{\{/g, "{").replace(/\}\}/g, "}").replace(/`/g, "\\`")

  result += "`"
  return result
}

/**
 * Transform Python's implicit string concatenation (ContinuedString).
 * In Python, adjacent string literals are automatically concatenated:
 *   msg = ("hello "
 *          "world")  # Same as "hello world"
 */
function transformContinuedString(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)

  // Check if any child is a FormatString (f-string)
  const hasFormatString = children.some((c) => c.name === "FormatString")

  if (hasFormatString) {
    // If we have f-strings, we need to concatenate template literals
    // Transform each part and join with +
    const parts = children
      .filter((c) => c.name === "String" || c.name === "FormatString")
      .map((c) => {
        if (c.name === "FormatString") {
          return transformFormatString(c, ctx)
        } else {
          // Convert regular string to template literal for consistency
          const text = getNodeText(c, ctx.source)
          let content: string

          // Handle raw strings
          if (/^[rR]['"]/.test(text)) {
            content = text.slice(2, -1)
          } else if (/^[rR]"""/.test(text) || /^[rR]'''/.test(text)) {
            content = text.slice(4, -3)
          } else if (text.startsWith('"""') || text.startsWith("'''")) {
            content = text.slice(3, -3)
          } else {
            content = text.slice(1, -1)
          }

          // Escape backticks and convert to template literal
          return "`" + content.replace(/`/g, "\\`") + "`"
        }
      })

    return parts.join(" + ")
  } else {
    // All regular strings - concatenate their contents into a single string
    const parts = children
      .filter((c) => c.name === "String")
      .map((c) => {
        const text = getNodeText(c, ctx.source)
        let content: string

        // Handle raw strings
        if (/^[rR]['"]/.test(text)) {
          content = text.slice(2, -1)
        } else if (/^[rR]"""/.test(text) || /^[rR]'''/.test(text)) {
          content = text.slice(4, -3)
        } else if (text.startsWith('"""') || text.startsWith("'''")) {
          content = text.slice(3, -3)
        } else {
          content = text.slice(1, -1)
        }

        return content
      })

    // Join and wrap in quotes - use double quotes by default
    const joined = parts.join("")
    // Check if content has double quotes, use single if so
    if (joined.includes('"') && !joined.includes("'")) {
      return "'" + joined + "'"
    }
    return '"' + joined + '"'
  }
}

function transformBoolean(node: SyntaxNode, ctx: TransformContext): string {
  const text = getNodeText(node, ctx.source)
  return text === "True" ? "true" : "false"
}

function transformCallExpression(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  const callee = children[0]
  const argList = children.find((c) => c.name === "ArgList")

  if (!callee) return getNodeText(node, ctx.source)

  const calleeName = getNodeText(callee, ctx.source)
  const args = argList ? transformArgList(argList, ctx) : ""

  // Handle method calls (obj.method())
  if (callee.name === "MemberExpression") {
    const methodResult = transformMethodCall(callee, args, ctx)
    if (methodResult !== null) {
      return methodResult
    }

    // Handle module-qualified calls (math.sqrt(), random.randint(), json.dumps())
    const moduleCallResult = transformModuleCall(calleeName, args, ctx)
    if (moduleCallResult !== null) {
      return moduleCallResult
    }
    // Fall through to regular call handling if no special mapping
  }

  // Check if this is a class instantiation (needs 'new')
  if (callee.name === "VariableName" && ctx.definedClasses.has(calleeName)) {
    return `new ${calleeName}(${args})`
  }

  // Map Python built-ins to JS/runtime equivalents
  switch (calleeName) {
    case "print":
      return `console.log(${args})`
    case "len":
      ctx.usesRuntime.add("len")
      return `len(${args})`
    case "range":
      ctx.usesRuntime.add("range")
      return `range(${args})`
    case "int":
      ctx.usesRuntime.add("int")
      return `int(${args})`
    case "float":
      ctx.usesRuntime.add("float")
      return `float(${args})`
    case "str":
      ctx.usesRuntime.add("str")
      return `str(${args})`
    case "bool":
      ctx.usesRuntime.add("bool")
      return `bool(${args})`
    case "abs":
      ctx.usesRuntime.add("abs")
      return `abs(${args})`
    case "min":
      ctx.usesRuntime.add("min")
      return `min(${args})`
    case "max":
      ctx.usesRuntime.add("max")
      return `max(${args})`
    case "sum":
      ctx.usesRuntime.add("sum")
      return `sum(${args})`
    case "list":
      ctx.usesRuntime.add("list")
      return `list(${args})`
    case "dict":
      ctx.usesRuntime.add("dict")
      return `dict(${args})`
    case "set":
      ctx.usesRuntime.add("set")
      return `set(${args})`
    case "tuple":
      ctx.usesRuntime.add("tuple")
      return `tuple(${args})`
    case "enumerate":
      ctx.usesRuntime.add("enumerate")
      return `enumerate(${args})`
    case "zip":
      ctx.usesRuntime.add("zip")
      return `zip(${args})`
    case "sorted":
      ctx.usesRuntime.add("sorted")
      return `sorted(${args})`
    case "reversed":
      ctx.usesRuntime.add("reversed")
      return `reversed(${args})`
    case "isinstance": {
      ctx.usesRuntime.add("isinstance")
      // Special handling: if second arg is a tuple, convert to array for multiple type check
      if (argList) {
        const argChildren = getChildren(argList).filter(
          (c) => c.name !== "(" && c.name !== ")" && c.name !== ","
        )
        if (argChildren.length >= 2) {
          const firstArg = argChildren[0]
          const secondArg = argChildren[1]
          if (firstArg && secondArg?.name === "TupleExpression") {
            // Convert tuple to array literal
            const tupleChildren = getChildren(secondArg).filter(
              (c) => c.name !== "(" && c.name !== ")" && c.name !== ","
            )
            const typesCodes = tupleChildren.map((el) => transformNode(el, ctx))
            return `isinstance(${transformNode(firstArg, ctx)}, [${typesCodes.join(", ")}])`
          }
        }
      }
      return `isinstance(${args})`
    }
    case "type":
      ctx.usesRuntime.add("type")
      return `type(${args})`
    case "input":
      ctx.usesRuntime.add("input")
      return `input(${args})`
    case "ord":
      ctx.usesRuntime.add("ord")
      return `ord(${args})`
    case "chr":
      ctx.usesRuntime.add("chr")
      return `chr(${args})`
    case "all":
      ctx.usesRuntime.add("all")
      return `all(${args})`
    case "any":
      ctx.usesRuntime.add("any")
      return `any(${args})`
    case "map":
      ctx.usesRuntime.add("map")
      return `map(${args})`
    case "filter":
      ctx.usesRuntime.add("filter")
      return `filter(${args})`
    case "repr":
      ctx.usesRuntime.add("repr")
      return `repr(${args})`
    case "round":
      ctx.usesRuntime.add("round")
      return `round(${args})`
    case "divmod":
      ctx.usesRuntime.add("divmod")
      return `divmod(${args})`
    case "hex":
      ctx.usesRuntime.add("hex")
      return `hex(${args})`
    case "oct":
      ctx.usesRuntime.add("oct")
      return `oct(${args})`
    case "bin":
      ctx.usesRuntime.add("bin")
      return `bin(${args})`
    case "getattr":
      ctx.usesRuntime.add("getattr")
      return `getattr(${args})`
    case "hasattr":
      ctx.usesRuntime.add("hasattr")
      return `hasattr(${args})`
    case "setattr":
      ctx.usesRuntime.add("setattr")
      return `setattr(${args})`

    // itertools functions
    case "chain":
      ctx.usesRuntime.add("itertools/chain")
      return `chain(${args})`
    case "combinations":
      ctx.usesRuntime.add("itertools/combinations")
      return `combinations(${args})`
    case "permutations":
      ctx.usesRuntime.add("itertools/permutations")
      return `permutations(${args})`
    case "product":
      ctx.usesRuntime.add("itertools/product")
      return `product(${args})`
    case "cycle":
      ctx.usesRuntime.add("itertools/cycle")
      return `cycle(${args})`
    case "repeat":
      ctx.usesRuntime.add("itertools/repeat")
      return `repeat(${args})`
    case "islice":
      ctx.usesRuntime.add("itertools/islice")
      return `islice(${args})`
    case "takewhile":
      ctx.usesRuntime.add("itertools/takeWhile")
      return `takeWhile(${args})`
    case "dropwhile":
      ctx.usesRuntime.add("itertools/dropWhile")
      return `dropWhile(${args})`
    case "zip_longest":
      ctx.usesRuntime.add("itertools/zipLongest")
      return `zipLongest(${args})`
    case "compress":
      ctx.usesRuntime.add("itertools/compress")
      return `compress(${args})`
    case "filterfalse":
      ctx.usesRuntime.add("itertools/filterFalse")
      return `filterFalse(${args})`
    case "accumulate":
      ctx.usesRuntime.add("itertools/accumulate")
      return `accumulate(${args})`
    case "groupby":
      ctx.usesRuntime.add("itertools/groupby")
      return `groupby(${args})`
    case "count":
      ctx.usesRuntime.add("itertools/count")
      return `count(${args})`
    case "tee":
      ctx.usesRuntime.add("itertools/tee")
      return `tee(${args})`
    case "pairwise":
      ctx.usesRuntime.add("itertools/pairwise")
      return `pairwise(${args})`
    case "combinations_with_replacement":
      ctx.usesRuntime.add("itertools/combinationsWithReplacement")
      return `combinationsWithReplacement(${args})`

    // collections classes/functions
    case "Counter":
      ctx.usesRuntime.add("collections/Counter")
      return `new Counter(${args})`
    case "defaultdict":
      ctx.usesRuntime.add("collections/defaultdict")
      return `defaultdict(${args})`
    case "deque":
      ctx.usesRuntime.add("collections/deque")
      return `new deque(${args})`

    // functools functions
    case "partial":
      ctx.usesRuntime.add("functools/partial")
      return `partial(${args})`
    case "reduce":
      ctx.usesRuntime.add("functools/reduce")
      return `reduce(${args})`
    case "lru_cache":
      ctx.usesRuntime.add("functools/lruCache")
      return `lruCache(${args})`
    case "cache":
      ctx.usesRuntime.add("functools/cache")
      return `cache(${args})`
    case "wraps":
      ctx.usesRuntime.add("functools/wraps")
      return `wraps(${args})`
    case "cmp_to_key":
      ctx.usesRuntime.add("functools/cmpToKey")
      return `cmpToKey(${args})`
    case "total_ordering":
      ctx.usesRuntime.add("functools/totalOrdering")
      return `totalOrdering(${args})`

    // json functions
    case "dumps":
      ctx.usesRuntime.add("json/dumps")
      return `dumps(${args})`
    case "loads":
      ctx.usesRuntime.add("json/loads")
      return `loads(${args})`
    case "dump":
      ctx.usesRuntime.add("json/dump")
      return `dump(${args})`
    case "load":
      ctx.usesRuntime.add("json/load")
      return `load(${args})`

    // datetime classes
    case "datetime":
      ctx.usesRuntime.add("datetime/datetime")
      return `new datetime(${args})`
    case "date":
      ctx.usesRuntime.add("datetime/date")
      return `new date(${args})`
    case "time":
      ctx.usesRuntime.add("datetime/time")
      return `new time(${args})`
    case "timedelta":
      ctx.usesRuntime.add("datetime/timedelta")
      return `new timedelta(${args})`

    // string module
    case "Template":
      ctx.usesRuntime.add("string/Template")
      return `new Template(${args})`
    case "capwords":
      ctx.usesRuntime.add("string/capWords")
      return `capWords(${args})`

    // glob module - async functions (direct import)
    case "glob":
      ctx.usesRuntime.add("glob/glob")
      return `await glob(${args})`
    case "iglob":
      ctx.usesRuntime.add("glob/iglob")
      return `await iglob(${args})`
    case "rglob":
      ctx.usesRuntime.add("glob/rglob")
      return `await rglob(${args})`

    // shutil module - async functions (direct import)
    case "copy":
      ctx.usesRuntime.add("shutil/copy")
      return `await copy(${args})`
    case "copy2":
      ctx.usesRuntime.add("shutil/copy2")
      return `await copy2(${args})`
    case "copytree":
      ctx.usesRuntime.add("shutil/copytree")
      return `await copytree(${args})`
    case "move":
      ctx.usesRuntime.add("shutil/move")
      return `await move(${args})`
    case "rmtree":
      ctx.usesRuntime.add("shutil/rmtree")
      return `await rmtree(${args})`
    case "which":
      ctx.usesRuntime.add("shutil/which")
      return `await which(${args})`

    // tempfile module - async functions (direct import)
    case "mkstemp":
      ctx.usesRuntime.add("tempfile/mkstemp")
      return `await mkstemp(${args})`
    case "mkdtemp":
      ctx.usesRuntime.add("tempfile/mkdtemp")
      return `await mkdtemp(${args})`
    case "NamedTemporaryFile":
      ctx.usesRuntime.add("tempfile/NamedTemporaryFile")
      return `await NamedTemporaryFile.create(${args})`
    case "TemporaryDirectory":
      ctx.usesRuntime.add("tempfile/TemporaryDirectory")
      return `await TemporaryDirectory.create(${args})`

    // pathlib module
    case "Path":
      ctx.usesRuntime.add("pathlib/Path")
      return `new Path(${args})`

    /* v8 ignore next 3 -- pass-through for user-defined functions @preserve */
    default:
      // Regular function call
      return `${transformNode(callee, ctx)}(${args})`
  }
}

/**
 * Transform module-qualified function calls (math.sqrt(), random.randint(), etc.)
 * Returns null if no special mapping is needed.
 */
function transformModuleCall(
  calleeName: string,
  args: string,
  ctx: TransformContext
): string | null {
  // Parse module.function pattern
  const dotIndex = calleeName.indexOf(".")
  if (dotIndex === -1) return null

  const moduleName = calleeName.slice(0, dotIndex)
  const funcName = calleeName.slice(dotIndex + 1)

  // math module
  if (moduleName === "math") {
    // Constants (no args) - these need special handling as they're properties not functions
    const mathConstants: Record<string, string> = {
      pi: "pi",
      e: "e",
      tau: "tau",
      inf: "inf",
      nan: "nan"
    }
    const mathConstant = mathConstants[funcName]
    if (mathConstant !== undefined) {
      ctx.usesRuntime.add(`math/${funcName}`)
      return mathConstant
    }

    // Functions
    ctx.usesRuntime.add(`math/${funcName}`)
    return `${funcName}(${args})`
  }

  // random module
  if (moduleName === "random") {
    const jsName = toJsName(funcName)
    ctx.usesRuntime.add(`random/${jsName}`)
    return `${jsName}(${args})`
  }

  // json module
  if (moduleName === "json") {
    ctx.usesRuntime.add(`json/${funcName}`)
    return `${funcName}(${args})`
  }

  // os module
  if (moduleName === "os") {
    // Async os.path.* functions
    const asyncPathFuncs = [
      "exists",
      "isfile",
      "isdir",
      "islink",
      "realpath",
      "getsize",
      "getmtime",
      "getatime",
      "getctime"
    ]
    // Async os.* functions
    const asyncOsFuncs = [
      "listdir",
      "mkdir",
      "makedirs",
      "remove",
      "unlink",
      "rmdir",
      "removedirs",
      "rename",
      "renames",
      "replace",
      "walk",
      "stat"
    ]

    // os.path.* functions - keep as namespace since path is a nested module
    if (funcName.startsWith("path.")) {
      const pathFuncName = funcName.slice(5)
      const jsPathFunc = toJsName(pathFuncName)
      ctx.usesRuntime.add("os/path")
      if (asyncPathFuncs.includes(pathFuncName.toLowerCase())) {
        return `await path.${jsPathFunc}(${args})`
      }
      return `path.${jsPathFunc}(${args})`
    }
    // os.* functions
    const jsName = toJsName(funcName)
    ctx.usesRuntime.add(`os/${jsName}`)
    if (asyncOsFuncs.includes(funcName.toLowerCase())) {
      return `await ${jsName}(${args})`
    }
    return `${jsName}(${args})`
  }

  // datetime module
  if (moduleName === "datetime") {
    const jsName = toJsName(funcName)
    ctx.usesRuntime.add(`datetime/${jsName}`)
    // Classes need 'new'
    if (["datetime", "date", "time", "timedelta"].includes(funcName)) {
      return `new ${jsName}(${args})`
    }
    return `${jsName}(${args})`
  }

  // re module
  if (moduleName === "re") {
    const jsName = toJsName(funcName)
    ctx.usesRuntime.add(`re/${jsName}`)
    return `${jsName}(${args})`
  }

  // string module - constants and functions
  if (moduleName === "string") {
    const jsName = toJsName(funcName)
    ctx.usesRuntime.add(`string/${jsName}`)
    // Template is a class
    if (funcName === "Template") {
      return `new Template(${args})`
    }
    return funcName.includes("(") ? `${jsName}(${args})` : jsName
  }

  // functools module
  if (moduleName === "functools") {
    const jsName = toJsName(funcName)
    ctx.usesRuntime.add(`functools/${jsName}`)
    return `${jsName}(${args})`
  }

  // itertools module (for itertools.chain() style calls)
  if (moduleName === "itertools") {
    const jsName = toJsName(funcName)
    ctx.usesRuntime.add(`itertools/${jsName}`)
    return `${jsName}(${args})`
  }

  // collections module
  if (moduleName === "collections") {
    ctx.usesRuntime.add(`collections/${funcName}`)
    // Classes need 'new'
    if (["Counter", "deque"].includes(funcName)) {
      return `new ${funcName}(${args})`
    }
    return `${funcName}(${args})`
  }

  // hashlib module
  if (moduleName === "hashlib") {
    const jsName = toJsName(funcName)
    ctx.usesRuntime.add(`hashlib/${jsName}`)
    // Async functions need await
    if (["pbkdf2_hmac", "scrypt", "compare_digest", "file_digest"].includes(funcName)) {
      const asyncJsName = toJsName(funcName)
      return `await ${asyncJsName}(${args})`
    }
    return `${jsName}(${args})`
  }

  // shutil module - all main functions are async
  if (moduleName === "shutil") {
    const asyncShutilFuncs = [
      "copy",
      "copy2",
      "copytree",
      "move",
      "rmtree",
      "which",
      "disk_usage",
      "copymode",
      "copystat",
      "copyfile"
    ]
    const jsName = toJsName(funcName)
    ctx.usesRuntime.add(`shutil/${jsName}`)
    if (asyncShutilFuncs.includes(funcName.toLowerCase())) {
      return `await ${jsName}(${args})`
    }
    return `${jsName}(${args})`
  }

  // glob module - all main functions are async
  if (moduleName === "glob") {
    const asyncGlobFuncs = ["glob", "iglob", "rglob"]
    const jsName = toJsName(funcName)
    ctx.usesRuntime.add(`glob/${jsName}`)
    if (asyncGlobFuncs.includes(funcName.toLowerCase())) {
      return `await ${jsName}(${args})`
    }
    return `${jsName}(${args})`
  }

  // tempfile module
  if (moduleName === "tempfile") {
    const asyncTempfileFuncs = ["mkstemp", "mkdtemp"]
    const jsName = toJsName(funcName)
    ctx.usesRuntime.add(`tempfile/${jsName}`)
    // Classes use static create() method
    if (funcName === "NamedTemporaryFile") {
      return `await NamedTemporaryFile.create(${args})`
    }
    if (funcName === "TemporaryDirectory") {
      return `await TemporaryDirectory.create(${args})`
    }
    if (asyncTempfileFuncs.includes(funcName.toLowerCase())) {
      return `await ${jsName}(${args})`
    }
    return `${jsName}(${args})`
  }

  // pathlib module
  if (moduleName === "pathlib") {
    const jsName = toJsName(funcName)
    ctx.usesRuntime.add(`pathlib/${jsName}`)
    // Path class instantiation
    if (funcName === "Path") {
      return `new Path(${args})`
    }
    return `${jsName}(${args})`
  }

  return null
}

/**
 * Transform Python method calls to JavaScript equivalents.
 * Returns null if no special mapping is needed.
 */
function transformMethodCall(
  callee: SyntaxNode,
  args: string,
  ctx: TransformContext
): string | null {
  const children = getChildren(callee)
  if (children.length < 2) return null

  const obj = children[0]
  const methodNode = children[children.length - 1]
  if (!obj || !methodNode) return null

  // Skip transformation for module-like paths (e.g., os.path.join)
  // These are MemberExpressions that look like module references, not method calls on values
  if (obj.name === "MemberExpression") {
    // Could be module.submodule.method() - don't transform
    return null
  }

  // Skip transformation for known module names to let transformModuleCall handle them
  // This prevents e.g. shutil.copy() from being treated as list.copy()
  if (obj.name === "VariableName") {
    const objName = getNodeText(obj, ctx.source)
    const knownModules = [
      "shutil",
      "glob",
      "tempfile",
      "pathlib",
      "os",
      "math",
      "random",
      "json",
      "datetime",
      "re",
      "string",
      "functools",
      "itertools",
      "collections",
      "hashlib"
    ]
    if (knownModules.includes(objName)) {
      return null
    }
  }

  const objCode = transformNode(obj, ctx)
  const methodName = getNodeText(methodNode, ctx.source)

  // String methods
  switch (methodName) {
    // String case conversion
    case "upper":
      return `${objCode}.toUpperCase()`
    case "lower":
      return `${objCode}.toLowerCase()`
    case "capitalize":
      ctx.usesRuntime.add("string")
      return `string.capitalize(${objCode})`
    case "title":
      ctx.usesRuntime.add("string")
      return `string.title(${objCode})`
    case "swapcase":
      ctx.usesRuntime.add("string")
      return `string.swapCase(${objCode})`
    case "casefold":
      return `${objCode}.toLowerCase()`

    // String whitespace
    case "strip":
      return args ? `${objCode}.split(${args}).join("")` : `${objCode}.trim()`
    case "lstrip":
      return args
        ? `${objCode}.replace(new RegExp('^[' + ${args} + ']+'), '')`
        : `${objCode}.trimStart()`
    case "rstrip":
      return args
        ? `${objCode}.replace(new RegExp('[' + ${args} + ']+$'), '')`
        : `${objCode}.trimEnd()`

    // String search
    case "startswith":
      return `${objCode}.startsWith(${args})`
    case "endswith":
      return `${objCode}.endsWith(${args})`
    case "find":
      return `${objCode}.indexOf(${args})`
    case "rfind":
      return `${objCode}.lastIndexOf(${args})`
    case "index":
      ctx.usesRuntime.add("string")
      return `string.index(${objCode}, ${args})`
    case "rindex":
      ctx.usesRuntime.add("string")
      return `string.rIndex(${objCode}, ${args})`
    case "count":
      ctx.usesRuntime.add("string")
      return `string.count(${objCode}, ${args})`

    // String testing
    case "isalpha":
      return `/^[a-zA-Z]+$/.test(${objCode})`
    case "isdigit":
      return `/^[0-9]+$/.test(${objCode})`
    case "isalnum":
      return `/^[a-zA-Z0-9]+$/.test(${objCode})`
    case "isspace":
      return `/^\\s+$/.test(${objCode})`
    case "isupper":
      return `(${objCode} === ${objCode}.toUpperCase() && ${objCode} !== ${objCode}.toLowerCase())`
    case "islower":
      return `(${objCode} === ${objCode}.toLowerCase() && ${objCode} !== ${objCode}.toUpperCase())`

    // String modification
    case "replace":
      ctx.usesRuntime.add("string")
      return `string.replace(${objCode}, ${args})`
    case "zfill":
      ctx.usesRuntime.add("string")
      return `string.zFill(${objCode}, ${args})`
    case "center":
      ctx.usesRuntime.add("string")
      return `string.center(${objCode}, ${args})`
    case "ljust":
      return `${objCode}.padEnd(${args})`
    case "rjust":
      return `${objCode}.padStart(${args})`

    // String split/join - join is special: "sep".join(arr) -> arr.join("sep")
    // If the argument is a generator expression, convert to array with spread
    case "join":
      // Check if args contains a generator IIFE pattern
      if (args.includes("function*")) {
        return `[...${args}].join(${objCode})`
      }
      return `(${args}).join(${objCode})`
    case "split":
      return args ? `${objCode}.split(${args})` : `${objCode}.split(/\\s+/)`
    case "rsplit":
      ctx.usesRuntime.add("string")
      return `string.rSplit(${objCode}, ${args})`
    case "splitlines":
      return `${objCode}.split(/\\r?\\n/)`
    case "partition":
      ctx.usesRuntime.add("string")
      return `string.partition(${objCode}, ${args})`
    case "rpartition":
      ctx.usesRuntime.add("string")
      return `string.rPartition(${objCode}, ${args})`

    // String format method
    case "format":
      ctx.usesRuntime.add("strFormat")
      return `strFormat(${objCode}, ${args})`

    // List methods
    case "append":
      return `${objCode}.push(${args})`
    case "extend":
      return `${objCode}.push(...${args})`
    case "insert": {
      const insertArgs = args.split(",")
      const index = insertArgs[0] ?? "0"
      const value = insertArgs.slice(1).join(",")
      return `${objCode}.splice(${index}, 0, ${value})`
    }
    case "remove":
      ctx.usesRuntime.add("list")
      return `list.remove(${objCode}, ${args})`
    case "pop":
      // pop() with no args works the same, pop(0) needs shift()
      if (!args) return `${objCode}.pop()`
      if (args.trim() === "0") return `${objCode}.shift()`
      return `${objCode}.splice(${args}, 1)[0]`
    case "clear":
      return `${objCode}.length = 0`
    case "copy":
      return `[...${objCode}]`
    case "reverse":
      return `${objCode}.reverse()`
    case "sort":
      ctx.usesRuntime.add("list")
      return args ? `list.sort(${objCode}, ${args})` : `${objCode}.sort()`

    // Dict methods
    case "keys":
      return `Object.keys(${objCode})`
    case "values":
      return `Object.values(${objCode})`
    case "items":
      return `Object.entries(${objCode})`
    case "get":
      ctx.usesRuntime.add("dict")
      return `dict.get(${objCode}, ${args})`
    case "setdefault":
      ctx.usesRuntime.add("dict")
      return `dict.setdefault(${objCode}, ${args})`
    case "update":
      return `Object.assign(${objCode}, ${args})`
    case "fromkeys":
      ctx.usesRuntime.add("dict")
      return `dict.fromkeys(${args})`

    // Set methods
    case "add":
      return `${objCode}.add(${args})`
    case "discard":
      return `${objCode}.delete(${args})`
    case "union":
      return `new Set([...${objCode}, ...${args}])`
    case "intersection":
      ctx.usesRuntime.add("set")
      return `set.intersection(${objCode}, ${args})`
    case "difference":
      ctx.usesRuntime.add("set")
      return `set.difference(${objCode}, ${args})`
    case "symmetric_difference":
      ctx.usesRuntime.add("set")
      return `set.symmetricDifference(${objCode}, ${args})`
    case "issubset":
      ctx.usesRuntime.add("set")
      return `set.issubset(${objCode}, ${args})`
    case "issuperset":
      ctx.usesRuntime.add("set")
      return `set.issuperset(${objCode}, ${args})`

    // Hash object methods (hashlib) - async
    case "digest":
      return `await ${objCode}.digest()`
    case "hexdigest":
      return `await ${objCode}.hexdigest()`

    // Path object methods (pathlib) - async
    // Only handle snake_case methods that are unique to Path
    case "is_file":
    case "is_dir":
    case "is_symlink":
    case "read_text":
    case "write_text":
    case "read_bytes":
    case "write_bytes":
    case "symlink_to":
    case "link_to":
    case "iterdir": {
      const jsMethod = toJsName(methodName)
      return `await ${objCode}.${jsMethod}(${args})`
    }

    /* v8 ignore next 2 -- unknown method, let caller handle @preserve */
    default:
      return null
  }
}

function transformArgList(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  const items = children.filter((c) => c.name !== "(" && c.name !== ")" && c.name !== "ArgList")

  // Check if this is a generator expression inside the arglist (e.g., sum(x for x in items))
  const hasForKeyword = items.some(
    (c) => c.name === "for" || (c.name === "Keyword" && getNodeText(c, ctx.source) === "for")
  )

  if (hasForKeyword) {
    // This is a generator expression - parse it
    const nonCommaItems = items.filter((c) => c.name !== ",")
    const { outputExpr, clauses } = parseComprehensionClauses(nonCommaItems, ctx)
    return buildGeneratorChain(outputExpr, clauses)
  }

  // Process arguments, handling keyword arguments (name=value)
  const args: string[] = []
  const kwArgs: { name: string; value: string }[] = []
  let i = 0

  while (i < items.length) {
    const item = items[i]
    /* v8 ignore next 4 -- defensive: items from parser are never null @preserve */
    if (!item) {
      i++
      continue
    }

    // Skip commas
    if (item.name === ",") {
      i++
      continue
    }

    // Handle spread operators: *args and **kwargs
    if (item.name === "*" || (item.name === "ArithOp" && getNodeText(item, ctx.source) === "*")) {
      const nextItem = items[i + 1]
      if (nextItem) {
        args.push(`...${transformNode(nextItem, ctx)}`)
        i += 2
        continue
      }
    }

    if (item.name === "**" || (item.name === "ArithOp" && getNodeText(item, ctx.source) === "**")) {
      const nextItem = items[i + 1]
      if (nextItem) {
        // **kwargs passes object as keyword arguments
        // In TypeScript, we pass the object directly (functions expecting **kwargs
        // are transpiled to accept a Record<string, unknown> parameter)
        kwArgs.push({ name: "__spread__", value: transformNode(nextItem, ctx) })
        i += 2
        continue
      }
    }

    // Check for keyword argument: VariableName AssignOp Value
    if (item.name === "VariableName") {
      const nextItem = items[i + 1]
      if (nextItem?.name === "AssignOp") {
        const valueItem = items[i + 2]
        if (valueItem) {
          const name = getNodeText(item, ctx.source)
          const value = transformNode(valueItem, ctx)
          kwArgs.push({ name, value })
          i += 3
          continue
        }
      }
    }

    // Regular positional argument
    args.push(transformNode(item, ctx))
    i++
  }

  // Combine positional and keyword arguments
  // Keyword arguments are passed as an options object: { key: value }
  if (kwArgs.length > 0) {
    // Separate spread kwargs from regular keyword args
    const spreadKwargs = kwArgs.filter((kw) => kw.name === "__spread__")
    const regularKwargs = kwArgs.filter((kw) => kw.name !== "__spread__")

    if (regularKwargs.length > 0 && spreadKwargs.length > 0) {
      // Combine regular kwargs with spread: { ...spread, key: value }
      const regularStr = regularKwargs.map((kw) => `${kw.name}: ${kw.value}`).join(", ")
      const spreadStr = spreadKwargs.map((kw) => `...${kw.value}`).join(", ")
      args.push(`{ ${spreadStr}, ${regularStr} }`)
    } else if (spreadKwargs.length > 0) {
      // Only spread kwargs - pass the object directly if single, or merge if multiple
      const firstSpread = spreadKwargs[0]
      if (spreadKwargs.length === 1 && firstSpread) {
        args.push(firstSpread.value)
      } else {
        const spreadStr = spreadKwargs.map((kw) => `...${kw.value}`).join(", ")
        args.push(`{ ${spreadStr} }`)
      }
    } else {
      // Only regular kwargs
      const kwArgsStr = regularKwargs.map((kw) => `${kw.name}: ${kw.value}`).join(", ")
      args.push(`{ ${kwArgsStr} }`)
    }
  }

  return args.join(", ")
}

function transformMemberExpression(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  if (children.length < 2) return getNodeText(node, ctx.source)

  const obj = children[0]
  if (!obj) return getNodeText(node, ctx.source)

  // Check if this is subscript syntax (arr[index]) or dot syntax (obj.attr)
  const hasOpenBracket = children.some((c) => c.name === "[")

  if (hasOpenBracket) {
    // Subscript access: arr[index]
    const objCode = transformNode(obj, ctx)

    // Check for slice syntax
    const text = getNodeText(node, ctx.source)
    if (text.includes(":")) {
      return transformSliceFromMember(obj, children, ctx)
    }

    // Simple index access - handle comma-separated indices (NumPy-style multi-dimensional)
    const indexElements = children.filter(
      (c) => c.name !== "[" && c.name !== "]" && c.name !== "," && c !== obj
    )

    if (indexElements.length === 0) return `${objCode}[]`

    // Single index
    if (indexElements.length === 1) {
      const index = indexElements[0]
      if (!index) return `${objCode}[]`

      const indexCode = transformNode(index, ctx)

      // Check if the index is a negative number literal (for py.at() support)
      if (isNegativeIndexLiteral(index, ctx)) {
        ctx.usesRuntime.add("at")
        return `at(${objCode}, ${indexCode})`
      }

      return `${objCode}[${indexCode}]`
    }

    // Multiple indices (NumPy-style): arr[i, j] or arr[..., 0]
    // Convert to tuple for runtime handling
    ctx.usesRuntime.add("tuple")
    const indices = indexElements.map((el) => transformNode(el, ctx))
    return `${objCode}[tuple(${indices.join(", ")})]`
  } else {
    // Dot access: obj.attr
    const prop = children[children.length - 1]
    if (!prop) return getNodeText(node, ctx.source)

    const objName = getNodeText(obj, ctx.source)
    const propName = getNodeText(prop, ctx.source)

    // Handle module constants (math.pi, math.e, etc.)
    if (objName === "math") {
      ctx.usesRuntime.add(`math/${propName}`)
      return propName
    }

    // os module constants (os.sep, os.path, etc.)
    if (objName === "os") {
      // os.path is a nested module, needs special handling
      if (propName === "path") {
        ctx.usesRuntime.add("os/path")
        return "path"
      }
      ctx.usesRuntime.add(`os/${propName}`)
      return propName
    }

    // string module (constants like ascii_lowercase, digits, etc.)
    if (objName === "string") {
      ctx.usesRuntime.add(`string/${propName}`)
      return propName
    }

    // re module flags
    if (objName === "re") {
      ctx.usesRuntime.add(`re/${propName}`)
      return propName
    }

    // datetime module
    if (objName === "datetime") {
      ctx.usesRuntime.add(`datetime/${propName}`)
      return propName
    }

    const objCode = transformNode(obj, ctx)

    // Map Python special attributes to JavaScript equivalents
    const attrMap: Record<string, string> = {
      __name__: "name",
      __class__: "constructor",
      __dict__: "this" // Rough equivalent
      // Note: __doc__ is kept as-is since it's a valid JS property name
    }

    const mappedProp = attrMap[propName] ?? propName
    return `${objCode}.${mappedProp}`
  }
}

function transformSliceFromMember(
  obj: SyntaxNode,
  children: SyntaxNode[],
  ctx: TransformContext
): string {
  ctx.usesRuntime.add("slice")
  const objCode = transformNode(obj, ctx)

  // Extract slice content between brackets
  const bracketStart = children.findIndex((c) => c.name === "[")
  const bracketEnd = children.findIndex((c) => c.name === "]")

  /* v8 ignore next 3 -- defensive: subscript always has brackets @preserve */
  if (bracketStart === -1 || bracketEnd === -1) {
    return `slice(${objCode})`
  }

  // Get all elements between brackets
  const sliceElements = children.slice(bracketStart + 1, bracketEnd)

  // Check for multi-dimensional slicing (comma-separated)
  const hasComma = sliceElements.some((el) => el.name === ",")

  if (hasComma) {
    // Multi-dimensional slice: [:, :0] -> slice(obj, [null, null], [null, 0])
    // Split by commas to get each dimension
    const dimensions: SyntaxNode[][] = []
    let currentDim: SyntaxNode[] = []

    for (const el of sliceElements) {
      if (el.name === ",") {
        dimensions.push(currentDim)
        currentDim = []
      } else {
        currentDim.push(el)
      }
    }
    dimensions.push(currentDim)

    // Process each dimension as a slice
    const dimSlices = dimensions.map((dimElements) => {
      return parseSliceDimension(dimElements, ctx)
    })

    return `slice(${objCode}, ${dimSlices.join(", ")})`
  }

  // Single-dimension slice: parse slice notation (start:stop:step)
  const parts = parseSliceParts(sliceElements, ctx)
  return `slice(${objCode}, ${parts.join(", ")})`
}

/**
 * Parse a single dimension's slice notation (start:stop:step)
 * Returns an array of strings: ["start", "stop"] or ["start", "stop", "step"]
 * For multi-dimensional slices, use wrapAsArray=true to get "[start, stop]" format
 */
function parseSliceParts(elements: SyntaxNode[], ctx: TransformContext): string[] {
  const colonIndices: number[] = []
  elements.forEach((el, i) => {
    if (el.name === ":") colonIndices.push(i)
  })

  // If no colons, it's just an index, not a slice
  if (colonIndices.length === 0) {
    if (elements.length > 0 && elements[0]) {
      return [transformNode(elements[0], ctx)]
    }
    return ["undefined"]
  }

  // Build slice parts [start, stop, step?]
  const parts: string[] = []
  let lastIdx = 0

  for (const colonIdx of colonIndices) {
    const beforeColon = elements.slice(lastIdx, colonIdx)
    if (beforeColon.length > 0 && beforeColon[0]) {
      parts.push(transformNode(beforeColon[0], ctx))
    } else {
      parts.push("undefined")
    }
    lastIdx = colonIdx + 1
  }

  // Handle remaining after last colon
  const afterLastColon = elements.slice(lastIdx)
  if (afterLastColon.length > 0 && afterLastColon[0] && afterLastColon[0].name !== ":") {
    parts.push(transformNode(afterLastColon[0], ctx))
  } else if (colonIndices.length > 0) {
    parts.push("undefined")
  }

  return parts
}

/**
 * Parse a single dimension's slice notation for multi-dimensional slices
 * Returns a string like "[null, null]" or "[1, 5]" or index like "0"
 */
function parseSliceDimension(elements: SyntaxNode[], ctx: TransformContext): string {
  const parts = parseSliceParts(elements, ctx)
  // If only one part (index, not a slice), return it directly
  if (parts.length === 1) {
    return parts[0] ?? "undefined"
  }
  // Otherwise wrap in array brackets for multi-dimensional slice notation
  return `[${parts.join(", ")}]`
}

function transformArrayExpression(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)

  // Handle spread operators (*) in array literals
  // [*a, *b, 3] -> [...a, ...b, 3]
  const elementCodes: string[] = []
  let i = 0

  while (i < children.length) {
    const child = children[i]
    if (!child) {
      i++
      continue
    }

    // Skip brackets and commas
    if (child.name === "[" || child.name === "]" || child.name === ",") {
      i++
      continue
    }

    // Check for spread: * followed by an expression
    if (child.name === "*" || getNodeText(child, ctx.source) === "*") {
      const nextChild = children[i + 1]
      if (nextChild && nextChild.name !== "," && nextChild.name !== "]") {
        // This is a spread expression
        elementCodes.push(`...${transformNode(nextChild, ctx)}`)
        i += 2 // Skip both * and the expression
        continue
      }
    }

    // Regular element
    elementCodes.push(transformNode(child, ctx))
    i++
  }

  return `[${elementCodes.join(", ")}]`
}

function transformDictionaryExpression(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)

  // Filter out braces and commas
  const items = children.filter(
    (c) => c.name !== "{" && c.name !== "}" && c.name !== "," && c.name !== ":"
  )

  // Check if all keys are valid TypeScript object literal keys (strings, numbers)
  // If any key is a complex expression (function call, etc.), use Map instead
  const keyNodes: SyntaxNode[] = []
  for (let i = 0; i < items.length; i += 2) {
    const key = items[i]
    if (key) keyNodes.push(key)
  }

  const allKeysValidForObjectLiteral = keyNodes.every(
    (key) => key.name === "String" || key.name === "Number" || key.name === "VariableName"
  )

  // If any key is not a valid object literal key (e.g., function call), use Map
  if (!allKeysValidForObjectLiteral) {
    const mapPairs: string[] = []
    for (let i = 0; i < items.length; i += 2) {
      const key = items[i]
      const value = items[i + 1]
      if (key && value) {
        const keyCode = transformNode(key, ctx)
        const valueCode = transformNode(value, ctx)
        mapPairs.push(`[${keyCode}, ${valueCode}]`)
      }
    }
    return `new Map([${mapPairs.join(", ")}])`
  }

  // Standard object literal for simple keys
  const pairs: string[] = []
  for (let i = 0; i < items.length; i += 2) {
    const key = items[i]
    const value = items[i + 1]

    if (key && value) {
      const keyCode = transformNode(key, ctx)
      const valueCode = transformNode(value, ctx)

      // Check if key needs to be computed
      if (key.name === "VariableName") {
        pairs.push(`[${keyCode}]: ${valueCode}`)
      } else {
        pairs.push(`${keyCode}: ${valueCode}`)
      }
    }
  }

  return `{ ${pairs.join(", ")} }`
}

function transformTupleExpression(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)

  // Check for spread operators (*) in the tuple
  // AST: ( * VariableName , * VariableName )
  const elementCodes: string[] = []
  let hasSpread = false
  let i = 0

  while (i < children.length) {
    const child = children[i]
    if (!child) {
      i++
      continue
    }

    // Skip parentheses, commas, and comments (inline comments break single-line output)
    if (
      child.name === "(" ||
      child.name === ")" ||
      child.name === "," ||
      child.name === "Comment"
    ) {
      i++
      continue
    }

    // Check for spread: * followed by an expression
    if (child.name === "*" || getNodeText(child, ctx.source) === "*") {
      const nextChild = children[i + 1]
      if (nextChild && nextChild.name !== "," && nextChild.name !== ")") {
        // This is a spread expression
        hasSpread = true
        elementCodes.push(`...${transformNode(nextChild, ctx)}`)
        i += 2 // Skip both * and the expression
        continue
      }
    }

    // Regular element
    elementCodes.push(transformNode(child, ctx))
    i++
  }

  // If we have spreads, use array literal instead of tuple()
  // because tuple() can't handle spread syntax
  if (hasSpread) {
    return `[${elementCodes.join(", ")}]`
  }

  ctx.usesRuntime.add("tuple")
  return `tuple(${elementCodes.join(", ")})`
}

function isNegativeIndexLiteral(node: SyntaxNode, ctx: TransformContext): boolean {
  // Check for a UnaryExpression with - operator and a Number
  if (node.name === "UnaryExpression") {
    const children = getChildren(node)
    const hasMinusOp = children.some(
      (c) => c.name === "ArithOp" && getNodeText(c, ctx.source) === "-"
    )
    const hasNumber = children.some((c) => c.name === "Number")
    return hasMinusOp && hasNumber
  }
  return false
}

function transformIfStatement(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  const parts: string[] = []

  let i = 0
  while (i < children.length) {
    const child = children[i]
    if (!child) {
      i++
      continue
    }

    if (
      child.name === "if" ||
      (child.name === "Keyword" && getNodeText(child, ctx.source) === "if")
    ) {
      // Main if
      const condition = children[i + 1]
      const body = children.find((c, idx) => idx > i && c.name === "Body")

      if (condition && body) {
        const condCode = stripOuterParens(transformNode(condition, ctx))
        const bodyCode = transformBody(body, ctx)
        parts.push(`if (${condCode}) {\n${bodyCode}\n}`)
      }
    } else if (
      child.name === "elif" ||
      (child.name === "Keyword" && getNodeText(child, ctx.source) === "elif")
    ) {
      const condition = children[i + 1]
      const body = children.find((c, idx) => idx > i + 1 && c.name === "Body")

      if (condition && body) {
        const condCode = stripOuterParens(transformNode(condition, ctx))
        const bodyCode = transformBody(body, ctx)
        parts.push(` else if (${condCode}) {\n${bodyCode}\n}`)
      }
    } else if (
      child.name === "else" ||
      (child.name === "Keyword" && getNodeText(child, ctx.source) === "else")
    ) {
      const body = children.find((c, idx) => idx > i && c.name === "Body")

      if (body) {
        const bodyCode = transformBody(body, ctx)
        parts.push(` else {\n${bodyCode}\n}`)
      }
    }
    i++
  }

  return parts.join("")
}

function transformWhileStatement(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  const condition = children.find(
    (c) => c.name !== "while" && c.name !== "Body" && c.name !== "Keyword" && c.name !== ":"
  )
  const body = children.find((c) => c.name === "Body")

  if (!condition || !body) return getNodeText(node, ctx.source)

  const condCode = stripOuterParens(transformNode(condition, ctx))
  const bodyCode = transformBody(body, ctx)

  return `while (${condCode}) {\n${bodyCode}\n}`
}

function transformMatchStatement(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)

  // Find the subject (what we're matching) and the body (containing clauses)
  let subject: SyntaxNode | null = null
  let matchBody: SyntaxNode | null = null

  for (const child of children) {
    if (child.name === "match" || child.name === ":") continue
    if (child.name === "MatchBody") {
      matchBody = child
    } else {
      subject ??= child
    }
  }

  if (!subject || !matchBody) return getNodeText(node, ctx.source)

  const subjectCode = transformNode(subject, ctx)

  // Collect all clauses and check if any have complex patterns
  const matchBodyChildren = getChildren(matchBody)
  const clauseNodes = matchBodyChildren.filter((c) => c.name === "MatchClause")

  const hasComplexPatterns = clauseNodes.some((clause) => {
    const clauseChildren = getChildren(clause)
    const pattern = clauseChildren.find(
      (c) => c.name !== "case" && c.name !== ":" && c.name !== "Body" && c.name !== "Guard"
    )
    const hasGuard = clauseChildren.some((c) => c.name === "Guard")

    if (hasGuard) return true
    if (!pattern) return false

    // Complex patterns that need if/else
    if (
      pattern.name === "SequencePattern" ||
      pattern.name === "MappingPattern" ||
      pattern.name === "ClassPattern" ||
      pattern.name === "AsPattern"
    ) {
      return true
    }

    // OrPattern with complex sub-patterns needs if/else
    if (pattern.name === "OrPattern") {
      const orChildren = getChildren(pattern)
      return orChildren.some(
        (c) =>
          c.name === "SequencePattern" ||
          c.name === "MappingPattern" ||
          c.name === "ClassPattern" ||
          c.name === "AsPattern"
      )
    }

    return false
  })

  if (hasComplexPatterns) {
    // Use if/else chain for complex patterns
    return transformMatchAsIfElse(subjectCode, clauseNodes, ctx)
  }

  // Use switch for simple patterns
  const clauses = transformMatchBody(matchBody, ctx)
  return `switch (${subjectCode}) {\n${clauses}\n}`
}

function transformMatchAsIfElse(
  subjectCode: string,
  clauses: SyntaxNode[],
  ctx: TransformContext
): string {
  const parts: string[] = []
  const indent = "  ".repeat(ctx.indentLevel)

  for (let i = 0; i < clauses.length; i++) {
    const clause = clauses[i]
    if (!clause) continue

    const children = getChildren(clause)

    let pattern: SyntaxNode | null = null
    let body: SyntaxNode | null = null
    let guard: SyntaxNode | null = null

    for (const child of children) {
      if (child.name === "case" || child.name === ":") continue
      if (child.name === "Body") {
        body = child
      } else if (child.name === "Guard") {
        guard = child
      } else {
        pattern ??= child
      }
    }

    if (!pattern || !body) continue

    ctx.indentLevel++
    const bodyCode = transformBody(body, ctx)
    ctx.indentLevel--

    const patternText = getNodeText(pattern, ctx.source)
    const isWildcard =
      patternText === "_" || (pattern.name === "CapturePattern" && patternText === "_")

    // Extract guard condition if present
    let guardCondition: string | null = null
    if (guard) {
      const guardChildren = getChildren(guard)
      const guardExpr = guardChildren.find((c) => c.name !== "if")
      if (guardExpr) {
        let guardCode = transformNode(guardExpr, ctx)
        // If pattern is a CapturePattern, substitute the variable with the subject in the guard
        if (pattern.name === "CapturePattern") {
          const captureVar = getNodeText(pattern, ctx.source)
          if (captureVar !== "_") {
            // Replace the captured variable with the subject in the guard condition
            // Use word boundary regex to avoid partial matches
            const varRegex = new RegExp(`\\b${captureVar}\\b`, "g")
            guardCode = guardCode.replace(varRegex, subjectCode)
          }
        }
        guardCondition = guardCode
      }
    }

    if (isWildcard && !guardCondition) {
      // Wildcard/default case without guard
      if (i === 0) {
        parts.push(`${indent}${bodyCode.trim()}`)
      } else {
        parts.push(` else {\n${indent}  ${bodyCode.trim()}\n${indent}}`)
      }
    } else {
      const { condition, bindings } = transformComplexPattern(pattern, subjectCode, ctx)

      // Combine pattern condition with guard condition
      let fullCondition = condition
      if (guardCondition) {
        if (condition === "true") {
          fullCondition = guardCondition
        } else {
          fullCondition = `${condition} && ${guardCondition}`
        }
      }

      const keyword = i === 0 ? "if" : " else if"
      const bindingsCode =
        bindings.length > 0 ? `\n${indent}  ${bindings.join(`\n${indent}  `)}` : ""

      parts.push(
        `${keyword} (${fullCondition}) {${bindingsCode}\n${indent}  ${bodyCode.trim()}\n${indent}}`
      )
    }
  }

  return parts.join("")
}

interface PatternResult {
  condition: string
  bindings: string[]
}

function transformComplexPattern(
  pattern: SyntaxNode,
  subject: string,
  ctx: TransformContext
): PatternResult {
  switch (pattern.name) {
    case "SequencePattern":
      return transformSequencePattern(pattern, subject, ctx)
    case "MappingPattern":
      return transformMappingPattern(pattern, subject, ctx)
    case "ClassPattern":
      return transformClassPattern(pattern, subject, ctx)
    case "OrPattern":
      return transformOrPattern(pattern, subject, ctx)
    case "AsPattern":
      return transformAsPattern(pattern, subject, ctx)
    case "LiteralPattern": {
      const children = getChildren(pattern)
      const literal = children[0]
      const value = literal ? transformNode(literal, ctx) : getNodeText(pattern, ctx.source)
      return { condition: `${subject} === ${value}`, bindings: [] }
    }
    case "CapturePattern": {
      const varName = getNodeText(pattern, ctx.source)
      if (varName === "_") {
        return { condition: "true", bindings: [] }
      }
      return { condition: "true", bindings: [`const ${varName} = ${subject};`] }
    }
    /* v8 ignore next 3 -- fallback for unknown match patterns @preserve */
    default:
      // Fallback for unknown patterns
      return { condition: `${subject} === ${getNodeText(pattern, ctx.source)}`, bindings: [] }
  }
}

function transformSequencePattern(
  pattern: SyntaxNode,
  subject: string,
  ctx: TransformContext
): PatternResult {
  const children = getChildren(pattern)
  const elements = children.filter((c) => c.name !== "[" && c.name !== "]" && c.name !== ",")

  const conditions: string[] = [`Array.isArray(${subject})`]
  const bindings: string[] = []

  // Check for exact length (unless there's a starred pattern)
  const hasStarred = elements.some((e) => e.name === "StarPattern")
  if (!hasStarred) {
    conditions.push(`${subject}.length === ${String(elements.length)}`)
  }

  // Process each element
  elements.forEach((elem, idx) => {
    const idxStr = String(idx)
    if (elem.name === "CapturePattern") {
      const varName = getNodeText(elem, ctx.source)
      if (varName !== "_") {
        bindings.push(`const ${varName} = ${subject}[${idxStr}];`)
      }
    } else if (elem.name === "LiteralPattern") {
      const childNodes = getChildren(elem)
      const literal = childNodes[0]
      const value = literal ? transformNode(literal, ctx) : getNodeText(elem, ctx.source)
      conditions.push(`${subject}[${idxStr}] === ${value}`)
    }
  })

  return { condition: conditions.join(" && "), bindings }
}

function transformMappingPattern(
  pattern: SyntaxNode,
  subject: string,
  ctx: TransformContext
): PatternResult {
  const children = getChildren(pattern)
  const conditions: string[] = [`typeof ${subject} === "object"`, `${subject} !== null`]
  const bindings: string[] = []

  // Process key-value pairs
  let i = 0
  while (i < children.length) {
    const child = children[i]
    if (child?.name === "LiteralPattern" || child?.name === "String") {
      // This is a key
      const keyNode = child.name === "LiteralPattern" ? getChildren(child)[0] : child
      const key = keyNode ? transformNode(keyNode, ctx) : getNodeText(child, ctx.source)

      // Look for the colon and then the value pattern
      const valuePattern = children[i + 2]
      if (children[i + 1]?.name === ":" && valuePattern) {
        conditions.push(`${key} in ${subject}`)

        if (valuePattern.name === "CapturePattern") {
          const varName = getNodeText(valuePattern, ctx.source)
          if (varName !== "_") {
            bindings.push(`const ${varName} = ${subject}[${key}];`)
          }
        } else if (valuePattern.name === "LiteralPattern") {
          const valueChildren = getChildren(valuePattern)
          const literal = valueChildren[0]
          const value = literal
            ? transformNode(literal, ctx)
            : getNodeText(valuePattern, ctx.source)
          conditions.push(`${subject}[${key}] === ${value}`)
        }
        i += 3
        continue
      }
    }
    i++
  }

  return { condition: conditions.join(" && "), bindings }
}

function transformClassPattern(
  pattern: SyntaxNode,
  subject: string,
  ctx: TransformContext
): PatternResult {
  const children = getChildren(pattern)
  const className = children.find((c) => c.name === "VariableName")
  const argList = children.find((c) => c.name === "PatternArgList")

  const conditions: string[] = []
  const bindings: string[] = []

  if (className) {
    const classNameText = getNodeText(className, ctx.source)
    conditions.push(`${subject} instanceof ${classNameText}`)
  }

  if (argList) {
    const argChildren = getChildren(argList)
    for (const arg of argChildren) {
      if (arg.name === "KeywordPattern") {
        const kwChildren = getChildren(arg)
        const attrName = kwChildren.find((c) => c.name === "VariableName")
        const valuePattern = kwChildren.find(
          (c) => c.name === "LiteralPattern" || c.name === "CapturePattern"
        )

        if (attrName && valuePattern) {
          const attrNameText = getNodeText(attrName, ctx.source)

          if (valuePattern.name === "LiteralPattern") {
            const litChildren = getChildren(valuePattern)
            const literal = litChildren[0]
            const value = literal
              ? transformNode(literal, ctx)
              : getNodeText(valuePattern, ctx.source)
            conditions.push(`${subject}.${attrNameText} === ${value}`)
          } else if (valuePattern.name === "CapturePattern") {
            const varName = getNodeText(valuePattern, ctx.source)
            if (varName !== "_") {
              bindings.push(`const ${varName} = ${subject}.${attrNameText};`)
            }
          }
        }
      }
    }
  }

  return { condition: conditions.length > 0 ? conditions.join(" && ") : "true", bindings }
}

function transformOrPattern(
  pattern: SyntaxNode,
  subject: string,
  ctx: TransformContext
): PatternResult {
  const children = getChildren(pattern)
  // Filter out LogicOp (|) tokens, keep only actual patterns
  const subPatterns = children.filter((c) => c.name !== "LogicOp")

  const conditions: string[] = []
  // OR patterns cannot have bindings (each alternative must bind the same variables)
  // For simplicity, we just create OR conditions
  for (const subPattern of subPatterns) {
    const { condition } = transformComplexPattern(subPattern, subject, ctx)
    conditions.push(condition)
  }

  return { condition: conditions.join(" || "), bindings: [] }
}

function transformAsPattern(
  pattern: SyntaxNode,
  subject: string,
  ctx: TransformContext
): PatternResult {
  const children = getChildren(pattern)
  // AsPattern: [inner_pattern, "as", VariableName]
  const innerPattern = children.find(
    (c) => c.name !== "as" && c.name !== "VariableName" && c.name !== "⚠"
  )
  const asName = children.find((c) => c.name === "VariableName")

  if (!innerPattern) {
    return { condition: "true", bindings: [] }
  }

  // Transform the inner pattern
  const { condition, bindings } = transformComplexPattern(innerPattern, subject, ctx)

  // Add the "as" binding for the whole subject
  if (asName) {
    const varName = getNodeText(asName, ctx.source)
    bindings.push(`const ${varName} = ${subject};`)
  }

  return { condition, bindings }
}

function transformMatchBody(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  const clauses: string[] = []
  const indent = "  ".repeat(ctx.indentLevel + 1)

  for (const child of children) {
    if (child.name === "MatchClause") {
      clauses.push(transformMatchClause(child, ctx, indent))
    }
  }

  return clauses.join("\n")
}

function transformMatchClause(node: SyntaxNode, ctx: TransformContext, indent: string): string {
  const children = getChildren(node)

  let pattern: SyntaxNode | null = null
  let body: SyntaxNode | null = null

  for (const child of children) {
    if (child.name === "case" || child.name === ":") continue
    if (child.name === "Body") {
      body = child
    } else {
      pattern ??= child
    }
  }

  if (!pattern || !body) return ""

  const patternText = getNodeText(pattern, ctx.source)

  // Increase indent for body content
  ctx.indentLevel++
  const bodyCode = transformBody(body, ctx)
  ctx.indentLevel--

  const bodyIndent = indent + "  "

  // Handle wildcard pattern (_) as default
  if (patternText === "_" || pattern.name === "CapturePattern") {
    const captureVar = getNodeText(pattern, ctx.source)
    if (captureVar === "_") {
      return `${indent}default:\n${bodyIndent}${bodyCode.trim()}\n${bodyIndent}break;`
    }
  }

  // Handle OR patterns with multiple case labels
  if (pattern.name === "OrPattern") {
    const orChildren = getChildren(pattern)
    const subPatterns = orChildren.filter((c) => c.name !== "LogicOp")
    const caseLabels = subPatterns.map((p) => {
      const caseValue = transformMatchPatternSimple(p, ctx)
      return `${indent}case ${caseValue}:`
    })
    // Join all case labels, then add the body after the last one
    return `${caseLabels.join("\n")}\n${bodyIndent}${bodyCode.trim()}\n${bodyIndent}break;`
  }

  // Handle literal patterns
  const caseValue = transformMatchPatternSimple(pattern, ctx)
  return `${indent}case ${caseValue}:\n${bodyIndent}${bodyCode.trim()}\n${bodyIndent}break;`
}

function transformMatchPatternSimple(node: SyntaxNode, ctx: TransformContext): string {
  switch (node.name) {
    case "LiteralPattern": {
      const children = getChildren(node)
      const literal = children[0]
      if (literal) {
        return transformNode(literal, ctx)
      }
      return getNodeText(node, ctx.source)
    }
    case "CapturePattern":
      // Variable capture - in switch this would be default
      return getNodeText(node, ctx.source)
    /* v8 ignore next 2 -- fallback for unknown case patterns @preserve */
    default:
      return getNodeText(node, ctx.source)
  }
}

function transformForStatement(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)

  // Check for async for
  const isAsync = children.some(
    (c) => c.name === "async" || (c.name === "Keyword" && getNodeText(c, ctx.source) === "async")
  )

  // Find the variables (between 'for' and 'in'), iterable (after 'in'), and body
  const varNodes: SyntaxNode[] = []
  let iterableNode: SyntaxNode | null = null
  let bodyNode: SyntaxNode | null = null

  let foundFor = false
  let foundIn = false

  for (const child of children) {
    if (
      child.name === "for" ||
      (child.name === "Keyword" && getNodeText(child, ctx.source) === "for")
    ) {
      foundFor = true
    } else if (
      child.name === "in" ||
      (child.name === "Keyword" && getNodeText(child, ctx.source) === "in")
    ) {
      foundIn = true
    } else if (child.name === "Body") {
      bodyNode = child
    } else if (
      child.name !== ":" &&
      child.name !== "Keyword" &&
      child.name !== "," &&
      child.name !== "async"
    ) {
      if (foundFor && !foundIn) {
        varNodes.push(child)
      } else if (foundIn && !bodyNode) {
        iterableNode = child
      }
    }
  }

  if (varNodes.length === 0 || !iterableNode || !bodyNode) {
    return getNodeText(node, ctx.source)
  }

  // Build the variable pattern
  let varCode: string
  if (varNodes.length === 1 && varNodes[0]) {
    const singleVar = varNodes[0]
    // Check if it's a TupleExpression (parenthesized tuple like `(i, x)`)
    if (singleVar.name === "TupleExpression") {
      // Use transformForLoopVar to get array destructuring pattern
      varCode = transformForLoopVar(singleVar, ctx)
    } else {
      // Single variable
      varCode = transformNode(singleVar, ctx)
    }
  } else {
    // Tuple unpacking: [x, y] or [i, [a, b]]
    varCode = "[" + varNodes.map((v) => transformForLoopVar(v, ctx)).join(", ") + "]"
  }

  // Declare all for-loop variables in context (including escaped reserved keywords)
  // This ensures reassignments inside the loop body don't get 'let' prefix
  const forLoopVarNames = extractForLoopVarNames(varNodes, ctx.source)
  for (const varName of forLoopVarNames) {
    declareVariable(ctx, varName)
    // Also declare the escaped name if it's a reserved keyword
    const escapedName = escapeReservedKeyword(varName)
    if (escapedName !== varName) {
      declareVariable(ctx, escapedName)
    }
  }

  let iterableCode = transformNode(iterableNode, ctx)
  const bodyCode = transformBody(bodyNode, ctx)

  // Wrap plain variable names with py.iter() to handle dict iteration
  // Arrays/strings remain iterable, but dicts need Object.keys()
  if (iterableNode.name === "VariableName" && !isAsync) {
    ctx.usesRuntime.add("iter")
    iterableCode = `iter(${iterableCode})`
  }

  // Use 'for await' for async iteration
  const forKeyword = isAsync ? "for await" : "for"
  return `${forKeyword} (const ${varCode} of ${iterableCode}) {\n${bodyCode}\n}`
}

function transformForLoopVar(node: SyntaxNode, ctx: TransformContext): string {
  if (node.name === "VariableName") {
    // Escape reserved keywords in destructuring patterns
    return escapeReservedKeyword(getNodeText(node, ctx.source))
  } else if (node.name === "TupleExpression") {
    // Nested tuple: (a, b) -> [a, b]
    const children = getChildren(node)
    const elements = children.filter((c) => c.name !== "(" && c.name !== ")" && c.name !== ",")
    return "[" + elements.map((e) => transformForLoopVar(e, ctx)).join(", ") + "]"
  }
  return transformNode(node, ctx)
}

/**
 * Extract all variable names from for-loop variable nodes
 * Handles simple variables and nested tuple unpacking
 */
function extractForLoopVarNames(varNodes: SyntaxNode[], source: string): string[] {
  const names: string[] = []
  for (const node of varNodes) {
    if (node.name === "VariableName") {
      names.push(getNodeText(node, source))
    } else if (node.name === "TupleExpression") {
      const children = getChildren(node)
      const elements = children.filter((c) => c.name !== "(" && c.name !== ")" && c.name !== ",")
      names.push(...extractForLoopVarNames(elements, source))
    }
  }
  return names
}

function transformTryStatement(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  const baseIndent = "  ".repeat(ctx.indentLevel)

  let tryBody: SyntaxNode | null = null
  const exceptBodies: { type: string | null; varName: string | null; body: SyntaxNode }[] = []
  let finallyBody: SyntaxNode | null = null

  let i = 0
  while (i < children.length) {
    const child = children[i]
    if (!child) {
      i++
      continue
    }

    if (child.name === "try") {
      // Next Body is the try block
      const nextBody = children[i + 1]
      if (nextBody?.name === "Body") {
        tryBody = nextBody
        i += 2
        continue
      }
    }

    if (child.name === "except") {
      // Parse except clause: except [Type] [as name]:
      let exceptType: string | null = null
      let exceptVar: string | null = null
      let exceptBody: SyntaxNode | null = null

      let j = i + 1
      while (j < children.length) {
        const next = children[j]
        if (!next) break

        if (next.name === "Body") {
          exceptBody = next
          j++
          break
        } else if (next.name === "VariableName") {
          if (exceptType === null) {
            exceptType = getNodeText(next, ctx.source)
          } else {
            exceptVar = getNodeText(next, ctx.source)
          }
        } else if (next.name === "as") {
          // skip 'as' keyword
        } else if (next.name === "except" || next.name === "finally") {
          break
        }
        j++
      }

      if (exceptBody) {
        exceptBodies.push({ type: exceptType, varName: exceptVar, body: exceptBody })
      }
      i = j
      continue
    }

    if (child.name === "finally") {
      // Next Body is the finally block
      const nextBody = children[i + 1]
      if (nextBody?.name === "Body") {
        finallyBody = nextBody
        i += 2
        continue
      }
    }

    i++
  }

  if (!tryBody) {
    return getNodeText(node, ctx.source)
  }

  // Build the try/catch/finally
  const tryCode = transformBody(tryBody, ctx)
  let result = `try {\n${tryCode}\n${baseIndent}}`

  // Transform except clauses to catch
  if (exceptBodies.length > 0) {
    const firstExcept = exceptBodies[0]
    if (firstExcept) {
      const catchVar = firstExcept.varName ?? "e"
      let catchBody = transformBody(firstExcept.body, ctx)
      const isEmpty = !catchBody.trim()

      // Add comment for empty catch blocks (ESLint no-empty rule)
      if (isEmpty) {
        const innerIndent = "  ".repeat(ctx.indentLevel + 1)
        const exceptionComment = firstExcept.type ? ` - ${firstExcept.type} expected` : ""
        catchBody = `${innerIndent}// Intentionally empty${exceptionComment}`
      }

      // Omit catch variable if body is empty and no variable was explicitly named
      const catchClause = isEmpty && !firstExcept.varName ? "catch" : `catch (${catchVar})`

      if (exceptBodies.length === 1 && !firstExcept.type) {
        // Simple catch-all
        result += ` ${catchClause} {\n${catchBody}\n${baseIndent}}`
      } else if (exceptBodies.length === 1) {
        // Single typed except - we still catch everything but could add instanceof check
        result += ` ${catchClause} {\n${catchBody}\n${baseIndent}}`
      } else {
        // Multiple except clauses - generate if/else chain
        const innerIndent = "  ".repeat(ctx.indentLevel + 1)
        let catchBodyCode = ""
        for (let idx = 0; idx < exceptBodies.length; idx++) {
          const exc = exceptBodies[idx]
          if (!exc) continue
          const excBodyCode = transformBody(exc.body, ctx)
          const excVar = exc.varName ?? catchVar

          if (exc.type) {
            const condition = idx === 0 ? "if" : "} else if"
            const mappedType = mapExceptionType(exc.type)
            catchBodyCode += `${innerIndent}${condition} (${catchVar} instanceof ${mappedType}) {\n`
            if (excVar !== catchVar) {
              catchBodyCode += `${innerIndent}  const ${excVar} = ${catchVar};\n`
            }
            catchBodyCode += excBodyCode
              .split("\n")
              .map((line) => "  " + line)
              .join("\n")
            catchBodyCode += "\n"
          } else {
            // Catch-all (except without type)
            if (idx > 0) {
              catchBodyCode += `${innerIndent}} else {\n`
            }
            catchBodyCode += excBodyCode
              .split("\n")
              .map((line) => "  " + line)
              .join("\n")
            catchBodyCode += "\n"
          }
        }
        if (exceptBodies.some((e) => e.type)) {
          catchBodyCode += `${innerIndent}}`
        }
        result += ` catch (${catchVar}) {\n${catchBodyCode}${baseIndent}}`
      }
    }
  }

  // Add finally block
  if (finallyBody) {
    const finallyCode = transformBody(finallyBody, ctx)
    result += ` finally {\n${finallyCode}\n${baseIndent}}`
  }

  return result
}

function mapExceptionType(pythonType: string): string {
  // Map Python exception types to JavaScript equivalents
  const mapping: Record<string, string> = {
    Exception: "Error",
    BaseException: "Error",
    ValueError: "Error",
    TypeError: "TypeError",
    KeyError: "Error",
    IndexError: "RangeError",
    AttributeError: "Error",
    RuntimeError: "Error",
    StopIteration: "Error",
    ZeroDivisionError: "Error",
    FileNotFoundError: "Error",
    IOError: "Error",
    OSError: "Error",
    NameError: "ReferenceError",
    SyntaxError: "SyntaxError"
  }
  return mapping[pythonType] ?? "Error"
}

function transformRaiseStatement(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)

  // Find the expression after 'raise'
  const exprNode = children.find((c) => c.name !== "raise")

  if (!exprNode) {
    // raise without argument - re-throw
    return "throw"
  }

  const expr = transformNode(exprNode, ctx)

  // Check if it's a call to an exception type
  if (exprNode.name === "CallExpression") {
    const callChildren = getChildren(exprNode)
    const funcName = callChildren.find((c) => c.name === "VariableName")
    if (funcName) {
      const name = getNodeText(funcName, ctx.source)
      // Map Python exception to Error
      if (isExceptionType(name)) {
        // Extract message from args
        const argList = callChildren.find((c) => c.name === "ArgList")
        if (argList) {
          const args = getChildren(argList).filter(
            (c) => c.name !== "(" && c.name !== ")" && c.name !== ","
          )
          if (args.length > 0 && args[0]) {
            const message = transformNode(args[0], ctx)
            return `throw new Error(${message})`
          }
        }
        return "throw new Error()"
      }
    }
  }

  // For other expressions, wrap in Error if it's a string
  if (exprNode.name === "String") {
    return `throw new Error(${expr})`
  }

  return `throw ${expr}`
}

function isExceptionType(name: string): boolean {
  const exceptionTypes = [
    "Exception",
    "BaseException",
    "ValueError",
    "TypeError",
    "KeyError",
    "IndexError",
    "AttributeError",
    "RuntimeError",
    "StopIteration",
    "ZeroDivisionError",
    "FileNotFoundError",
    "IOError",
    "OSError",
    "NameError",
    "SyntaxError",
    "AssertionError",
    "NotImplementedError",
    "ImportError",
    "ModuleNotFoundError"
  ]
  return exceptionTypes.includes(name)
}

function transformImportStatement(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)

  // Determine if this is a "from X import Y" or "import X" style
  const hasFrom = children.some((c) => c.name === "from")

  let importCode: string
  if (hasFrom) {
    importCode = transformFromImport(children, ctx)
  } else {
    importCode = transformSimpleImport(children, ctx)
  }

  // If we're inside a function body, hoist the import to module level
  if (ctx.insideFunctionBody > 0 && importCode) {
    ctx.hoistedImports.push(importCode)
    return "" // Don't include the import in the function body
  }

  return importCode
}

function transformSimpleImport(children: SyntaxNode[], ctx: TransformContext): string {
  // import os -> import * as os from "os"
  // import numpy as np -> import * as np from "numpy"

  const names: { module: string; alias: string | null }[] = []
  let i = 0

  while (i < children.length) {
    const child = children[i]
    if (!child) {
      i++
      continue
    }

    if (child.name === "import" || child.name === ",") {
      i++
      continue
    }

    if (child.name === "VariableName") {
      const moduleName = getNodeText(child, ctx.source)
      let alias: string | null = null

      // Check for "as" alias
      const nextChild = children[i + 1]
      if (nextChild?.name === "as") {
        const aliasChild = children[i + 2]
        if (aliasChild?.name === "VariableName") {
          alias = getNodeText(aliasChild, ctx.source)
          i += 3
          names.push({ module: moduleName, alias })
          continue
        }
      }

      names.push({ module: moduleName, alias: null })
      i++
      continue
    }

    i++
  }

  // Filter out runtime modules (provided by py runtime) and typing modules
  const filteredNames = names.filter(
    ({ module }) => !RUNTIME_MODULES.has(module) && !TYPING_MODULES.has(module)
  )

  if (filteredNames.length === 0) {
    return ""
  }

  // Generate import statements
  return filteredNames
    .map(({ module, alias }) => {
      const importName = alias ?? module
      return `import * as ${importName} from "${module}"`
    })
    .join("\n")
}

/** Modules whose imports should be ignored (type-only modules) */
const TYPING_MODULES = new Set([
  "typing",
  "typing_extensions",
  "collections.abc",
  "__future__",
  "abc"
])

/** Runtime modules whose imports should be stripped (provided by runtime) */
const RUNTIME_MODULES = new Set([
  "itertools",
  "collections",
  "math",
  "random",
  "json",
  "os",
  "datetime",
  "re",
  "string",
  "functools"
])

function transformFromImport(children: SyntaxNode[], ctx: TransformContext): string {
  // from os import path -> import { path } from "os"
  // from os import path, getcwd -> import { path, getcwd } from "os"
  // from collections import defaultdict as dd -> import { defaultdict as dd } from "collections"
  // from math import * -> import * from "math"
  // from . import utils -> import * as utils from "./utils"
  // from ..utils import helper -> import { helper } from "../utils"

  // First pass: find the module name to check if it's a typing module
  let preCheckModule = ""
  for (const child of children) {
    if (child.name === "VariableName") {
      const prevChild = children[children.indexOf(child) - 1]
      // Check if this is after "from" (not after "import")
      if (prevChild?.name === "from" || prevChild?.name === ".") {
        preCheckModule = getNodeText(child, ctx.source)
        break
      }
    }
  }

  // Strip typing module imports entirely - TypeScript has its own type system
  if (TYPING_MODULES.has(preCheckModule)) {
    return ""
  }

  // Strip runtime module imports - provided by py runtime
  if (RUNTIME_MODULES.has(preCheckModule)) {
    return ""
  }

  let moduleName = ""
  let relativeDots = 0
  const imports: { name: string; alias: string | null }[] = []
  let hasStar = false

  let phase: "from" | "module" | "import" | "names" = "from"

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (!child) continue

    if (child.name === "from") {
      phase = "module"
      continue
    }

    if (child.name === ".") {
      relativeDots++
      continue
    }

    if (child.name === "Ellipsis") {
      // ... is parsed as Ellipsis, treat as 3 dots
      relativeDots += 3
      continue
    }

    if (child.name === "import") {
      phase = "names"
      continue
    }

    if (phase === "module" && child.name === "VariableName") {
      moduleName = getNodeText(child, ctx.source)
      continue
    }

    if (phase === "names") {
      if (child.name === "*") {
        hasStar = true
        continue
      }

      if (child.name === "VariableName") {
        const name = getNodeText(child, ctx.source)

        // Check for "as" alias
        const nextChild = children[i + 1]
        if (nextChild?.name === "as") {
          const aliasChild = children[i + 2]
          if (aliasChild?.name === "VariableName") {
            imports.push({ name, alias: getNodeText(aliasChild, ctx.source) })
            i += 2
            continue
          }
        }

        imports.push({ name, alias: null })
        continue
      }

      if (child.name === ",") {
        continue
      }
    }
  }

  // Build module path
  let modulePath = ""
  if (relativeDots > 0) {
    // Relative import
    if (relativeDots === 1) {
      modulePath = "./"
    } else {
      modulePath = "../".repeat(relativeDots - 1)
    }
    if (moduleName) {
      modulePath += moduleName
    } else if (imports.length > 0) {
      // from . import utils -> import from "./utils"
      modulePath += imports[0]?.name ?? ""
    }
  } else {
    modulePath = moduleName
  }

  // Generate import statement
  if (hasStar) {
    return `import * as ${moduleName || "_"} from "${modulePath}"`
  }

  if (relativeDots > 0 && !moduleName && imports.length === 1) {
    // from . import utils -> import * as utils from "./utils"
    const imp = imports[0]
    if (imp) {
      const importName = imp.alias ?? imp.name
      return `import * as ${importName} from "${modulePath}"`
    }
  }

  const importNames = imports
    .map(({ name, alias }) => (alias ? `${name} as ${alias}` : name))
    .join(", ")

  return `import { ${importNames} } from "${modulePath}"`
}

function transformAwaitExpression(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)

  // Find the expression after 'await'
  const exprNode = children.find((c) => c.name !== "await")

  if (!exprNode) {
    return "await"
  }

  return `await ${transformNode(exprNode, ctx)}`
}

function transformWithStatement(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)

  // Check if this is an async with
  const isAsync = children.some((c) => c.name === "async")

  // Parse context managers: with expr as name, expr2 as name2:
  const contextManagers: { expr: SyntaxNode; varName: string | null }[] = []
  let body: SyntaxNode | null = null

  let i = 0
  while (i < children.length) {
    const child = children[i]
    if (!child) {
      i++
      continue
    }

    // Skip keywords
    if (child.name === "with" || child.name === "async" || child.name === ",") {
      i++
      continue
    }

    // Body marks the end of context managers
    if (child.name === "Body") {
      body = child
      break
    }

    // This should be an expression (the context manager)
    // It can be a CallExpression, MemberExpression, or even a simple VariableName
    // Skip 'as' and ':' tokens, but handle VariableName specially
    if (child.name === "as" || child.name === ":") {
      i++
      continue
    }

    // Check if this is a context manager expression (not a binding variable after 'as')
    // A VariableName is a context manager if the next child is 'as' or Body
    const isContextManagerExpr =
      child.name !== "VariableName" ||
      children[i + 1]?.name === "as" ||
      children[i + 1]?.name === "Body" ||
      children[i + 1]?.name === ","

    if (isContextManagerExpr) {
      const expr = child
      let varName: string | null = null

      // Check if next is 'as' followed by variable name
      const nextChild = children[i + 1]
      if (nextChild?.name === "as") {
        const varChild = children[i + 2]
        if (varChild?.name === "VariableName") {
          varName = getNodeText(varChild, ctx.source)
          i += 3
        } else {
          i++
        }
      } else {
        i++
      }

      contextManagers.push({ expr, varName })
      continue
    }

    i++
  }

  if (contextManagers.length === 0 || !body) {
    return getNodeText(node, ctx.source)
  }

  // Generate try/finally structure
  // For multiple context managers, we nest them
  const bodyCode = transformBody(body, ctx)

  // Build from inside out for multiple context managers
  let result = bodyCode

  for (let j = contextManagers.length - 1; j >= 0; j--) {
    const cm = contextManagers[j]
    if (!cm) continue

    const exprCode = transformNode(cm.expr, ctx)
    const innerIndent = "  ".repeat(ctx.indentLevel + j)
    const innerIndent2 = "  ".repeat(ctx.indentLevel + j + 1)

    if (cm.varName) {
      // with expr as name: -> const name = expr; try { ... } finally { name.close?.() }
      const assignment = `${innerIndent}const ${cm.varName} = ${exprCode};\n`
      const tryBlock = `${innerIndent}try {\n${result}\n${innerIndent}}`
      const finallyBlock = ` finally {\n${innerIndent2}${cm.varName}[Symbol.dispose]?.() ?? ${cm.varName}.close?.();\n${innerIndent}}`

      if (isAsync && j === 0) {
        // For async with, use await on dispose
        const asyncFinallyBlock = ` finally {\n${innerIndent2}await (${cm.varName}[Symbol.asyncDispose]?.() ?? ${cm.varName}[Symbol.dispose]?.() ?? ${cm.varName}.close?.());\n${innerIndent}}`
        result = assignment + tryBlock + asyncFinallyBlock
      } else {
        result = assignment + tryBlock + finallyBlock
      }
    } else {
      // with expr: (no variable) -> const _resource = expr; try { ... } finally { _resource.close?.() }
      const tempVar = j > 0 ? `_resource${String(j)}` : "_resource"
      const assignment = `${innerIndent}const ${tempVar} = ${exprCode};\n`
      const tryBlock = `${innerIndent}try {\n${result}\n${innerIndent}}`
      const finallyBlock = ` finally {\n${innerIndent2}${tempVar}[Symbol.dispose]?.() ?? ${tempVar}.close?.();\n${innerIndent}}`
      result = assignment + tryBlock + finallyBlock
    }
  }

  return result
}

/**
 * Extract parameter names from a ParamList node for scope tracking
 */
function extractParamNames(node: SyntaxNode, source: string): string[] {
  const children = getChildren(node)
  const names: string[] = []
  let i = 0

  while (i < children.length) {
    const child = children[i]
    if (!child) {
      i++
      continue
    }

    // Skip parentheses, commas, and operators
    if (
      child.name === "(" ||
      child.name === ")" ||
      child.name === "," ||
      child.name === "/" ||
      child.name === ":"
    ) {
      i++
      continue
    }

    // Handle *args
    if (child.name === "*" || getNodeText(child, source) === "*") {
      const nextChild = children[i + 1]
      if (nextChild?.name === "VariableName") {
        names.push(escapeReservedKeyword(getNodeText(nextChild, source)))
        i += 2
        continue
      }
      i++
      continue
    }

    // Handle **kwargs
    if (child.name === "**" || getNodeText(child, source) === "**") {
      const nextChild = children[i + 1]
      if (nextChild?.name === "VariableName") {
        names.push(escapeReservedKeyword(getNodeText(nextChild, source)))
        i += 2
        continue
      }
      i++
      continue
    }

    // Regular parameter
    if (child.name === "VariableName") {
      names.push(escapeReservedKeyword(getNodeText(child, source)))
      i++
      continue
    }

    // Parameter wrapped in AssignParam or DefaultParam
    if (child.name === "AssignParam" || child.name === "DefaultParam") {
      const paramChildren = getChildren(child)
      const name = paramChildren.find((c) => c.name === "VariableName")
      if (name) {
        names.push(escapeReservedKeyword(getNodeText(name, source)))
      }
      i++
      continue
    }

    i++
  }

  return names
}

function transformBody(
  node: SyntaxNode,
  ctx: TransformContext,
  skipFirst = false,
  predeclaredVars: string[] = []
): string {
  ctx.indentLevel++
  pushScope(ctx) // Each block body gets its own scope

  // Pre-declare variables (e.g., function parameters) so reassignments don't create new 'let' declarations
  for (const v of predeclaredVars) {
    declareVariable(ctx, v)
  }
  const children = getChildren(node)
  const indent = "  ".repeat(ctx.indentLevel)

  let filteredChildren = children.filter((child) => child.name !== ":")
  if (skipFirst && filteredChildren.length > 0) {
    filteredChildren = filteredChildren.slice(1)
  }

  const statements = filteredChildren
    .map((child) => {
      const transformed = transformNode(child, ctx)
      // Skip empty transformations (e.g., pass, TypeVar declarations)
      if (transformed === "") {
        return ""
      }
      if (
        child.name === "ExpressionStatement" ||
        child.name === "AssignStatement" ||
        child.name === "PassStatement" ||
        child.name === "BreakStatement" ||
        child.name === "ContinueStatement" ||
        child.name === "ReturnStatement" ||
        child.name === "RaiseStatement"
      ) {
        return indent + transformed + ";"
      }
      return indent + transformed
    })
    .filter((s) => s.trim() !== "")

  popScope(ctx)
  ctx.indentLevel--
  return statements.join("\n")
}

function transformReturnStatement(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  const value = children.find((c) => c.name !== "return" && c.name !== "Keyword")

  if (!value) {
    return "return"
  }

  return `return ${transformNode(value, ctx)}`
}

function transformFunctionDefinition(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)

  let isAsync = false
  let funcName = ""
  let paramList: SyntaxNode | null = null
  let body: SyntaxNode | null = null
  let returnTypeDef: SyntaxNode | null = null

  for (const child of children) {
    if (child.name === "async") {
      isAsync = true
    } else if (child.name === "VariableName") {
      funcName = escapeReservedKeyword(getNodeText(child, ctx.source))
    } else if (child.name === "ParamList") {
      paramList = child
    } else if (child.name === "Body") {
      body = child
    } else if (child.name === "TypeDef") {
      // Return type annotation (comes after ParamList, before Body)
      returnTypeDef = child
    }
  }

  // Extract docstring and convert to JSDoc
  const indent = "  ".repeat(ctx.indentLevel)
  const { jsdoc, skipFirstStatement } = body
    ? extractDocstringFromBody(body, ctx, indent)
    : { jsdoc: null, skipFirstStatement: false }

  const params = paramList ? transformParamList(paramList, ctx) : ""
  // Extract parameter names to pre-declare them in the function body scope
  const paramNames = paramList ? extractParamNames(paramList, ctx.source) : []
  // Track that we're inside a function body for import hoisting
  ctx.insideFunctionBody++
  const bodyCode = body ? transformBody(body, ctx, skipFirstStatement, paramNames) : ""
  ctx.insideFunctionBody--

  // Check if function is a generator (contains yield)
  const isGenerator = body ? containsYield(body) : false

  // Get return type annotation
  let returnType = ""
  if (returnTypeDef) {
    const typeChildren = getChildren(returnTypeDef)
    const typeNode = typeChildren.find((c) => c.name !== ":" && c.name !== "->")
    if (typeNode) {
      const tsType = transformPythonType(typeNode, ctx)
      // Convert None return type to void for functions
      returnType = `: ${tsType === "null" ? "void" : tsType}`
    }
  }

  const asyncPrefix = isAsync ? "async " : ""
  const generatorStar = isGenerator ? "*" : ""
  const funcDecl = `${asyncPrefix}function${generatorStar} ${funcName}(${params})${returnType} {\n${bodyCode}\n}`

  return jsdoc ? `${jsdoc}\n${funcDecl}` : funcDecl
}

function transformClassDefinition(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)

  let className = ""
  const parentClasses: string[] = []
  let body: SyntaxNode | null = null

  for (const child of children) {
    if (child.name === "VariableName") {
      className = getNodeText(child, ctx.source)
      // Track class name for 'new' keyword on instantiation
      ctx.definedClasses.add(className)
    } else if (child.name === "ArgList") {
      // Inheritance: class Child(Parent) or class Child(A, B, C) or class Child(Generic[T])
      const argChildren = getChildren(child)
      for (const argChild of argChildren) {
        if (argChild.name === "VariableName") {
          parentClasses.push(getNodeText(argChild, ctx.source))
        } else if (argChild.name === "MemberExpression") {
          // Handle Generic[T], Generic[K, V] etc.
          parentClasses.push(getNodeText(argChild, ctx.source))
        }
      }
    } else if (child.name === "Body") {
      body = child
    }
  }

  // Extract class docstring and convert to JSDoc
  const indent = "  ".repeat(ctx.indentLevel)
  const { jsdoc, skipFirstStatement } = body
    ? extractDocstringFromBody(body, ctx, indent)
    : { jsdoc: null, skipFirstStatement: false }

  // Build class header
  let classHeader = `class ${className}`
  let multipleInheritanceWarning = ""

  const firstParent = parentClasses[0]
  if (firstParent) {
    // Special handling for NamedTuple
    if (firstParent === "NamedTuple") {
      return transformNamedTuple(className, body, ctx)
    }

    // Special handling for Enum types
    if (firstParent === "Enum" || firstParent === "IntEnum" || firstParent === "StrEnum") {
      return transformEnum(className, firstParent, body, ctx)
    }

    // Special handling for TypedDict
    if (firstParent === "TypedDict") {
      const totalFalse = checkTypedDictTotalFalse(node, ctx)
      return transformTypedDict(className, body, totalFalse, ctx)
    }

    // Special handling for Protocol
    if (firstParent === "Protocol") {
      return transformProtocol(className, parentClasses, body, ctx)
    }

    // Special handling for ABC (Abstract Base Class)
    if (firstParent === "ABC" || parentClasses.includes("ABC")) {
      return transformAbstractClass(className, parentClasses, body, ctx, jsdoc)
    }

    // Check for Generic[T] in parent classes
    const genericParams = extractGenericParams(parentClasses)
    if (genericParams.length > 0) {
      // Filter out Generic[...] from extends
      const filteredParents = parentClasses.filter((p) => !p.startsWith("Generic["))
      return transformGenericClass(className, genericParams, filteredParents, body, ctx, jsdoc)
    }

    // Use first parent for extends
    classHeader += ` extends ${firstParent}`

    // Warn about multiple inheritance
    if (parentClasses.length > 1) {
      const ignoredParents = parentClasses.slice(1).join(", ")
      multipleInheritanceWarning = `/* WARNING: Multiple inheritance not fully supported. Only extends ${firstParent}. Mixins needed for: ${ignoredParents} */\n`
    }
  }

  // Transform class body
  const bodyCode = body ? transformClassBody(body, ctx, skipFirstStatement) : ""

  const classDecl = `${multipleInheritanceWarning}${classHeader} {\n${bodyCode}\n}`
  return jsdoc ? `${jsdoc}\n${classDecl}` : classDecl
}

function transformClassBody(node: SyntaxNode, ctx: TransformContext, skipFirst = false): string {
  ctx.indentLevel++
  const children = getChildren(node)
  const indent = "  ".repeat(ctx.indentLevel)
  const members: string[] = []

  let filteredChildren = children.filter((c) => c.name !== ":")
  if (skipFirst && filteredChildren.length > 0) {
    filteredChildren = filteredChildren.slice(1)
  }

  for (const child of filteredChildren) {
    if (child.name === "FunctionDefinition") {
      members.push(transformClassMethod(child, ctx, null))
    } else if (child.name === "DecoratedStatement") {
      members.push(transformClassDecoratedMethod(child, ctx))
    } else if (child.name === "AssignStatement") {
      // Class-level assignment (class property)
      const transformed = transformClassProperty(child, ctx, indent)
      if (transformed) {
        members.push(transformed)
      }
    } else if (child.name === "ExpressionStatement") {
      // Non-docstring expressions (docstrings at class level are handled by transformClassDefinition)
      // Skip any remaining triple-quoted strings that look like docstrings
      if (!isDocstringNode(child, ctx)) {
        const transformed = transformNode(child, ctx)
        if (transformed.trim()) {
          members.push(indent + transformed + ";")
        }
      }
    } else if (child.name === "PassStatement") {
      // Skip pass in class body
    }
  }

  ctx.indentLevel--
  return members.filter((m) => m.trim()).join("\n\n")
}

/**
 * Transform a class property assignment
 * Handles Final (readonly) and ClassVar (static) modifiers
 */
function transformClassProperty(node: SyntaxNode, ctx: TransformContext, indent: string): string {
  const children = getChildren(node)
  if (children.length < 2) return ""

  // Skip __doc__ assignments - they're not valid in JS class bodies
  // Pattern: method.__doc__ = something
  const nodeText = getNodeText(node, ctx.source)
  if (nodeText.includes(".__doc__")) {
    return ""
  }

  // Find the assignment operator
  const assignOpIndex = children.findIndex((c) => c.name === "AssignOp" || c.name === "=")

  // Find type annotation
  const typeDef = children.find((c) => c.name === "TypeDef")

  // Handle type-only declarations (no assignment): value: T
  if (assignOpIndex === -1) {
    // No assignment, just type annotation
    const targets = children.filter((c) => c.name !== "," && c.name !== "TypeDef" && c.name !== ":")
    const target = targets[0]
    if (!target) return ""

    const targetCode = transformNode(target, ctx)
    const tsType = extractTypeAnnotation(typeDef, ctx)
    const typeAnnotation = tsType ? `: ${tsType}` : ""

    // Extract type modifiers (Final, ClassVar)
    const modifiers = extractTypeModifiers(typeDef, ctx)

    // Build property prefix: static for ClassVar, readonly for Final
    let prefix = ""
    if (modifiers.isClassVar) {
      prefix = "static "
    }
    if (modifiers.isFinal) {
      prefix += "readonly "
    }

    return `${indent}${prefix}${targetCode}${typeAnnotation};`
  }

  // Handle assignments: value: T = default
  const typeDefBeforeAssign = children.slice(0, assignOpIndex).find((c) => c.name === "TypeDef")

  // Collect targets (before =) and values (after =)
  const targets = children
    .slice(0, assignOpIndex)
    .filter((c) => c.name !== "," && c.name !== "TypeDef")
  const values = children.slice(assignOpIndex + 1).filter((c) => c.name !== ",")

  if (targets.length === 0 || values.length === 0) return ""

  const target = targets[0]
  if (!target) return ""

  const targetCode = transformNode(target, ctx)

  // Extract type annotation if present
  const tsType = extractTypeAnnotation(typeDefBeforeAssign, ctx)
  const typeAnnotation = tsType ? `: ${tsType}` : ""

  // Extract type modifiers (Final, ClassVar)
  const modifiers = extractTypeModifiers(typeDefBeforeAssign, ctx)

  // Build property prefix: static for ClassVar, readonly for Final
  let prefix = ""
  if (modifiers.isClassVar) {
    prefix = "static "
  }
  if (modifiers.isFinal) {
    prefix += "readonly "
  }

  // Transform value
  const value = values[0]
  const valueCode = value ? transformNode(value, ctx) : ""

  return `${indent}${prefix}${targetCode}${typeAnnotation} = ${valueCode};`
}

function transformClassMethod(
  node: SyntaxNode,
  ctx: TransformContext,
  decorator: string | null
): string {
  const children = getChildren(node)
  const indent = "  ".repeat(ctx.indentLevel)

  let methodName = ""
  let paramList: SyntaxNode | null = null
  let body: SyntaxNode | null = null

  for (const child of children) {
    if (child.name === "VariableName") {
      // Method names don't need escaping - reserved words are valid as method names in ES6+
      methodName = getNodeText(child, ctx.source)
    } else if (child.name === "ParamList") {
      paramList = child
    } else if (child.name === "Body") {
      body = child
    }
  }

  // Extract method docstring and convert to JSDoc
  const { jsdoc, skipFirstStatement } = body
    ? extractDocstringFromBody(body, ctx, indent)
    : { jsdoc: null, skipFirstStatement: false }

  // Transform parameters, removing 'self' or 'cls'
  const params = paramList ? transformMethodParamList(paramList, ctx) : ""
  // Extract parameter names (excluding self/cls) for scope tracking
  const paramNames = paramList
    ? extractParamNames(paramList, ctx.source).filter((n) => n !== "self" && n !== "cls")
    : []

  // Transform body, replacing 'self' with 'this'
  // Track that we're inside a function body for import hoisting
  ctx.insideFunctionBody++
  const bodyCode = body ? transformClassMethodBody(body, ctx, skipFirstStatement, paramNames) : ""
  ctx.insideFunctionBody--

  // Check if method is a generator (contains yield)
  const isGenerator = body ? containsYield(body) : false
  const generatorStar = isGenerator ? "*" : ""

  // Handle special methods
  if (methodName === "__init__") {
    const methodDecl = `${indent}constructor(${params}) {\n${bodyCode}\n${indent}}`
    return jsdoc ? `${jsdoc}\n${methodDecl}` : methodDecl
  }

  if (methodName === "__str__" || methodName === "__repr__") {
    const methodDecl = `${indent}toString() {\n${bodyCode}\n${indent}}`
    return jsdoc ? `${jsdoc}\n${methodDecl}` : methodDecl
  }

  // Handle decorators
  let prefix = ""
  if (decorator === "staticmethod" || decorator === "classmethod") {
    prefix = "static "
  } else if (decorator === "property") {
    prefix = "get "
  } else if (decorator === "setter") {
    prefix = "set "
  } else if (decorator === "abstractmethod") {
    // Abstract method: no body, just signature with return type and typed params
    const typedParams = paramList ? transformMethodParamListWithTypes(paramList, ctx) : ""
    const returnType = extractMethodReturnType(node, ctx)
    const returnTypeStr = returnType ? `: ${returnType === "null" ? "void" : returnType}` : ""
    const methodDecl = `${indent}abstract ${methodName}(${typedParams})${returnTypeStr}`
    return jsdoc ? `${jsdoc}\n${methodDecl}` : methodDecl
  }

  const methodDecl = `${indent}${prefix}${generatorStar}${methodName}(${params}) {\n${bodyCode}\n${indent}}`
  return jsdoc ? `${jsdoc}\n${methodDecl}` : methodDecl
}

/**
 * Extract return type from a method's TypeDef (-> ReturnType)
 */
function extractMethodReturnType(node: SyntaxNode, ctx: TransformContext): string | null {
  const children = getChildren(node)
  for (const child of children) {
    if (child.name === "TypeDef") {
      return extractTypeAnnotation(child, ctx)
    }
  }
  return null
}

function transformClassDecoratedMethod(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)

  let decorator: string | null = null
  let funcDef: SyntaxNode | null = null

  for (const child of children) {
    if (child.name === "Decorator") {
      const decChildren = getChildren(child)
      // Check for member expression pattern: @x.setter or @x.deleter
      const varNames = decChildren.filter((c) => c.name === "VariableName")
      const hasDot = decChildren.some((c) => c.name === ".")
      if (varNames.length >= 2 && hasDot) {
        // It's a member expression like @x.setter
        const propName = varNames[varNames.length - 1]
        if (propName) {
          decorator = getNodeText(propName, ctx.source) // "setter" or "deleter"
        }
      } else {
        // Simple decorator like @property or @staticmethod
        const nameNode = varNames[0]
        if (nameNode) {
          decorator = getNodeText(nameNode, ctx.source)
        }
      }
    } else if (child.name === "FunctionDefinition") {
      funcDef = child
    }
  }

  if (!funcDef) {
    return getNodeText(node, ctx.source)
  }

  return transformClassMethod(funcDef, ctx, decorator)
}

function transformMethodParamList(node: SyntaxNode, ctx: TransformContext): string {
  return transformMethodParamListImpl(node, ctx, false)
}

/**
 * Transform method parameter list with type annotations (for abstract methods)
 */
function transformMethodParamListWithTypes(node: SyntaxNode, ctx: TransformContext): string {
  return transformMethodParamListImpl(node, ctx, true)
}

function transformMethodParamListImpl(
  node: SyntaxNode,
  ctx: TransformContext,
  includeTypes: boolean
): string {
  const children = getChildren(node)
  const params: string[] = []
  let i = 0
  let isFirstParam = true

  while (i < children.length) {
    const child = children[i]
    if (!child) {
      i++
      continue
    }

    // Skip parentheses and commas
    if (child.name === "(" || child.name === ")" || child.name === ",") {
      i++
      continue
    }

    // Skip 'self' and 'cls' (first parameter in instance/class methods)
    if (child.name === "VariableName" && isFirstParam) {
      const name = getNodeText(child, ctx.source)
      if (name === "self" || name === "cls") {
        i++
        isFirstParam = false
        continue
      }
    }
    isFirstParam = false

    // Check for *args (rest parameter)
    if (child.name === "*" || getNodeText(child, ctx.source) === "*") {
      const nextChild = children[i + 1]
      if (nextChild?.name === "VariableName") {
        const name = escapeReservedKeyword(getNodeText(nextChild, ctx.source))
        params.push(`...${name}`)
        i += 2
        continue
      }
      i++
      continue
    }

    // Check for **kwargs
    if (child.name === "**" || getNodeText(child, ctx.source) === "**") {
      const nextChild = children[i + 1]
      if (nextChild?.name === "VariableName") {
        const name = escapeReservedKeyword(getNodeText(nextChild, ctx.source))
        params.push(name)
        i += 2
        continue
      }
      i++
      continue
    }

    // Check for parameter with default value or type annotation
    if (child.name === "VariableName") {
      const nameCode = escapeReservedKeyword(getNodeText(child, ctx.source))
      let typeStr = ""
      let defaultStr = ""
      let consumed = 1

      // Check for type annotation
      const nextChild = children[i + 1]
      if (nextChild?.name === "TypeDef" && includeTypes) {
        const t = extractTypeAnnotation(nextChild, ctx)
        if (t) typeStr = `: ${t}`
        consumed++

        // Check for default after type
        const afterType = children[i + 2]
        if (afterType?.name === "AssignOp") {
          const defaultVal = children[i + 3]
          if (defaultVal) {
            defaultStr = ` = ${transformNode(defaultVal, ctx)}`
            consumed += 2
          }
        }
      } else if (nextChild?.name === "AssignOp") {
        const defaultValChild = children[i + 2]
        if (defaultValChild) {
          defaultStr = ` = ${transformNode(defaultValChild, ctx)}`
          consumed += 2
        }
      }

      params.push(`${nameCode}${typeStr}${defaultStr}`)
      i += consumed
      continue
    }

    i++
  }

  return params.join(", ")
}

function transformClassMethodBody(
  node: SyntaxNode,
  ctx: TransformContext,
  skipFirst = false,
  predeclaredVars: string[] = []
): string {
  ctx.indentLevel++
  pushScope(ctx) // Each method body gets its own scope

  // Pre-declare variables (e.g., method parameters) so reassignments don't create new 'let' declarations
  for (const v of predeclaredVars) {
    declareVariable(ctx, v)
  }

  const children = getChildren(node)
  const indent = "  ".repeat(ctx.indentLevel)

  let filteredChildren = children.filter((child) => child.name !== ":")
  if (skipFirst && filteredChildren.length > 0) {
    filteredChildren = filteredChildren.slice(1)
  }

  const statements = filteredChildren
    .map((child) => {
      let transformed: string

      // Special handling for AssignStatement to avoid "let" on self.x assignments
      if (child.name === "AssignStatement") {
        transformed = transformClassAssignment(child, ctx)
      } else {
        transformed = transformNode(child, ctx)
      }

      // Skip empty transformations (e.g., pass, TypeVar declarations)
      if (transformed === "") {
        return ""
      }

      // Replace self. and cls. with this.
      transformed = transformed.replace(/\bself\./g, "this.")
      transformed = transformed.replace(/\bcls\./g, "this.")

      // Handle super().__init__(...) -> super(...)
      transformed = transformed.replace(/super\(\)\.__init__\(/g, "super(")

      // Handle cls() -> this() for classmethod
      transformed = transformed.replace(/\bcls\(\)/g, "new this()")

      if (
        child.name === "ExpressionStatement" ||
        child.name === "AssignStatement" ||
        child.name === "PassStatement" ||
        child.name === "BreakStatement" ||
        child.name === "ContinueStatement" ||
        child.name === "ReturnStatement"
      ) {
        return indent + transformed + ";"
      }
      return indent + transformed
    })
    .filter((s) => s.trim() !== "")

  popScope(ctx)
  ctx.indentLevel--
  return statements.join("\n")
}

function transformClassAssignment(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  if (children.length < 3) return getNodeText(node, ctx.source)

  // Check for chained assignment: a = b = c = value
  // Multiple AssignOp nodes indicate chained assignment
  const assignOpIndices = children
    .map((c, i) => (c.name === "AssignOp" || c.name === "=" ? i : -1))
    .filter((i) => i !== -1)

  if (assignOpIndices.length > 1) {
    // Chained assignment: extract all targets and the final value
    // Pattern: target1 = target2 = ... = value
    const chainTargets: SyntaxNode[] = []
    const lastAssignOpIndex = assignOpIndices[assignOpIndices.length - 1]
    if (lastAssignOpIndex === undefined) return getNodeText(node, ctx.source)

    for (let i = 0; i < assignOpIndices.length; i++) {
      const opIndex = assignOpIndices[i]
      if (opIndex === undefined) continue
      // Target is the node(s) before this AssignOp (after previous AssignOp or start)
      const prevOpIndex = i > 0 ? assignOpIndices[i - 1] : -1
      const startIdx = prevOpIndex !== undefined ? prevOpIndex + 1 : 0
      const targetNodes = children.slice(startIdx, opIndex).filter((c) => c.name !== ",")
      if (targetNodes.length === 1 && targetNodes[0]) {
        chainTargets.push(targetNodes[0])
      }
    }

    // Value is everything after the last AssignOp
    const valueNodes = children.slice(lastAssignOpIndex + 1).filter((c) => c.name !== ",")
    if (valueNodes.length !== 1 || !valueNodes[0]) return getNodeText(node, ctx.source)

    const valueCode = transformNode(valueNodes[0], ctx)

    // Generate chained assignment: let b = value; let a = b;
    // Assign to targets in reverse order (rightmost first)
    const results: string[] = []
    let lastVarName = valueCode
    const indent = "  ".repeat(ctx.indentLevel)

    for (let i = chainTargets.length - 1; i >= 0; i--) {
      const target = chainTargets[i]
      if (!target) continue
      const targetCode = transformNode(target, ctx)
      const varName = getNodeText(target, ctx.source)

      // Check if target is a member expression (like self.x)
      const isMemberAssignment = target.name === "MemberExpression"

      // Determine declaration keyword
      let needsDeclaration = false
      if (
        !isMemberAssignment &&
        target.name === "VariableName" &&
        !isVariableDeclared(ctx, varName)
      ) {
        needsDeclaration = true
        declareVariable(ctx, varName)
      }

      const keyword = needsDeclaration ? "let " : ""
      results.push(`${keyword}${targetCode} = ${lastVarName}`)
      lastVarName = targetCode
    }

    // Join with semicolons and indent (except first line which gets indented by caller)
    // The caller adds indent + ";" around the result, so we need to:
    // - Not add final semicolon (caller adds it)
    // - Add indent to all lines except first
    return results.join(`;\n${indent}`)
  }

  const assignOpIndex = children.findIndex((c) => c.name === "AssignOp" || c.name === "=")
  if (assignOpIndex === -1) return getNodeText(node, ctx.source)

  const targets = children.slice(0, assignOpIndex).filter((c) => c.name !== ",")
  const values = children.slice(assignOpIndex + 1).filter((c) => c.name !== ",")

  if (targets.length === 0 || values.length === 0) {
    return getNodeText(node, ctx.source)
  }

  if (targets.length === 1) {
    const target = targets[0]
    if (!target) return getNodeText(node, ctx.source)

    const targetCode = transformNode(target, ctx)

    // Check if target is a member expression (like self.x)
    const isMemberAssignment = target.name === "MemberExpression"

    if (values.length === 1) {
      const value = values[0]
      if (!value) return getNodeText(node, ctx.source)
      // No "let" for member expressions (self.x = y -> this.x = y)
      if (isMemberAssignment) {
        return `${targetCode} = ${transformNode(value, ctx)}`
      }
      return `let ${targetCode} = ${transformNode(value, ctx)}`
    } else {
      const valuesCodes = values.map((v) => transformNode(v, ctx))
      if (isMemberAssignment) {
        return `${targetCode} = [${valuesCodes.join(", ")}]`
      }
      return `let ${targetCode} = [${valuesCodes.join(", ")}]`
    }
  }

  // Multiple target assignment (destructuring)
  const targetCodes = targets.map((t) => transformAssignTarget(t, ctx))
  const targetPattern = `[${targetCodes.join(", ")}]`

  if (values.length === 1) {
    const value = values[0]
    if (!value) return getNodeText(node, ctx.source)
    return `let ${targetPattern} = ${transformNode(value, ctx)}`
  } else {
    const valuesCodes = values.map((v) => transformNode(v, ctx))
    return `let ${targetPattern} = [${valuesCodes.join(", ")}]`
  }
}

function transformDecoratedStatement(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)

  // Collect decorators and find the function/class definition
  const decorators: { name: string; args: string | null }[] = []
  let funcDef: SyntaxNode | null = null
  let classDef: SyntaxNode | null = null

  for (const child of children) {
    if (child.name === "Decorator") {
      const decChildren = getChildren(child)
      let decoratorName = ""
      let decoratorArgs: string | null = null

      // Build decorator name from possibly dotted path: @app.route("/api")
      // AST: At, VariableName("app"), ".", VariableName("route"), ArgList
      const nameParts: string[] = []
      for (const decChild of decChildren) {
        if (decChild.name === "VariableName") {
          nameParts.push(getNodeText(decChild, ctx.source))
        } else if (decChild.name === "MemberExpression") {
          // Fallback for nested member expressions
          decoratorName = transformNode(decChild, ctx)
        } else if (decChild.name === "ArgList") {
          decoratorArgs = transformArgList(decChild, ctx)
        } else if (decChild.name === "CallExpression") {
          // Handle nested call expressions if they occur
          const callChildren = getChildren(decChild)
          for (const callChild of callChildren) {
            if (callChild.name === "VariableName") {
              nameParts.push(getNodeText(callChild, ctx.source))
            } else if (callChild.name === "MemberExpression") {
              decoratorName = transformNode(callChild, ctx)
            } else if (callChild.name === "ArgList") {
              decoratorArgs = transformArgList(callChild, ctx)
            }
          }
        }
      }
      // If we collected name parts, join them with dots
      if (nameParts.length > 0) {
        decoratorName = nameParts.join(".")
      }

      if (decoratorName) {
        decorators.push({ name: decoratorName, args: decoratorArgs })
      }
    } else if (child.name === "FunctionDefinition") {
      funcDef = child
    } else if (child.name === "ClassDefinition") {
      classDef = child
    }
  }

  // Handle decorated class
  if (classDef) {
    return transformDecoratedClass(classDef, decorators, ctx)
  }

  if (!funcDef) {
    return getNodeText(node, ctx.source)
  }

  // Get function details
  const funcChildren = getChildren(funcDef)
  let funcName = ""
  let paramList: SyntaxNode | null = null
  let body: SyntaxNode | null = null

  for (const child of funcChildren) {
    if (child.name === "VariableName") {
      // Escape reserved keywords like 'var' -> '_var'
      funcName = escapeReservedKeyword(getNodeText(child, ctx.source))
    } else if (child.name === "ParamList") {
      paramList = child
    } else if (child.name === "Body") {
      body = child
    }
  }

  const params = paramList ? transformParamList(paramList, ctx) : ""
  const paramNames = paramList ? extractParamNames(paramList, ctx.source) : []

  // Handle @overload: generate only function signature (no body)
  if (decorators.length === 1 && decorators[0]?.name === "overload") {
    const returnType = extractMethodReturnType(funcDef, ctx)
    const returnTypeStr = returnType ? `: ${returnType === "null" ? "void" : returnType}` : ""
    return `function ${funcName}(${params})${returnTypeStr}`
  }

  // Extract docstring and convert to JSDoc (to be placed above the const declaration)
  const indent = "  ".repeat(ctx.indentLevel)
  const { jsdoc, skipFirstStatement } = body
    ? extractDocstringFromBody(body, ctx, indent)
    : { jsdoc: null, skipFirstStatement: false }

  // Track that we're inside a function body for import hoisting
  ctx.insideFunctionBody++
  const bodyCode = body ? transformBody(body, ctx, skipFirstStatement, paramNames) : ""
  ctx.insideFunctionBody--

  // Build the decorated function
  // @decorator def func(): ... -> const func = decorator(function func() { ... })
  // @decorator(args) def func(): ... -> const func = decorator(args)(function func() { ... })
  let funcExpr = `function ${funcName}(${params}) {\n${bodyCode}\n}`

  // Apply decorators from bottom to top (innermost first)
  for (let i = decorators.length - 1; i >= 0; i--) {
    const dec = decorators[i]
    if (!dec) continue

    if (dec.args !== null) {
      funcExpr = `${dec.name}(${dec.args})(${funcExpr})`
    } else {
      funcExpr = `${dec.name}(${funcExpr})`
    }
  }

  // Prepend JSDoc if docstring was found
  const declaration = `const ${funcName} = ${funcExpr}`
  return jsdoc ? `${jsdoc}\n${declaration}` : declaration
}

// ============================================================================
// Class decorator and @dataclass helpers
// ============================================================================

interface DataclassField {
  name: string
  tsType: string
  hasDefault: boolean
  defaultValue: string | null
  isFieldFactory: boolean
}

interface DataclassOptions {
  frozen: boolean
}

/**
 * Handle decorated class definitions
 * Routes to either @dataclass special handling or generic class decorator wrapping
 */
function transformDecoratedClass(
  classDef: SyntaxNode,
  decorators: { name: string; args: string | null }[],
  ctx: TransformContext
): string {
  // Check for @dataclass decorator
  const dataclassDecorator = decorators.find(
    (d) => d.name === "dataclass" || d.name === "dataclasses.dataclass"
  )

  if (dataclassDecorator) {
    // Filter out the dataclass decorator, apply remaining decorators if any
    const otherDecorators = decorators.filter((d) => d !== dataclassDecorator)
    const dataclassCode = transformDataclass(classDef, dataclassDecorator, ctx)

    if (otherDecorators.length === 0) {
      return dataclassCode
    }

    // Wrap dataclass with remaining decorators
    const children = getChildren(classDef)
    let className = ""
    for (const child of children) {
      if (child.name === "VariableName") {
        className = getNodeText(child, ctx.source)
        break
      }
    }

    let expr = dataclassCode
    for (let i = otherDecorators.length - 1; i >= 0; i--) {
      const dec = otherDecorators[i]
      if (!dec) continue
      if (dec.args !== null) {
        expr = `${dec.name}(${dec.args})(${expr})`
      } else {
        expr = `${dec.name}(${expr})`
      }
    }
    return `const ${className} = ${expr}`
  }

  // Generic class decorator wrapping
  return transformGenericDecoratedClass(classDef, decorators, ctx)
}

/**
 * Wrap a class with decorators (non-dataclass)
 * @decorator class MyClass: pass -> const MyClass = decorator(class MyClass { })
 */
function transformGenericDecoratedClass(
  classDef: SyntaxNode,
  decorators: { name: string; args: string | null }[],
  ctx: TransformContext
): string {
  const children = getChildren(classDef)
  let className = ""

  for (const child of children) {
    if (child.name === "VariableName") {
      className = getNodeText(child, ctx.source)
      ctx.definedClasses.add(className)
      break
    }
  }

  // Transform the class definition using existing logic
  let classExpr = transformClassDefinition(classDef, ctx)

  // Apply decorators from bottom to top (innermost first)
  for (let i = decorators.length - 1; i >= 0; i--) {
    const dec = decorators[i]
    if (!dec) continue

    if (dec.args !== null) {
      classExpr = `${dec.name}(${dec.args})(${classExpr})`
    } else {
      classExpr = `${dec.name}(${classExpr})`
    }
  }

  return `const ${className} = ${classExpr}`
}

/**
 * Parse @dataclass decorator options
 */
function parseDataclassOptions(args: string | null): DataclassOptions {
  const options: DataclassOptions = {
    frozen: false
  }

  if (!args) return options

  // Parse keyword arguments - args is already transformed
  // e.g., "frozen: true" or "frozen=True" before transformation
  if (
    args.includes("frozen: true") ||
    args.includes("frozen=True") ||
    args.includes("frozen=true")
  ) {
    options.frozen = true
  }

  return options
}

/**
 * Extract dataclass fields from class body
 * Only considers typed assignments: name: type or name: type = default
 */
function extractDataclassFields(body: SyntaxNode, ctx: TransformContext): DataclassField[] {
  const fields: DataclassField[] = []
  const children = getChildren(body)

  for (const child of children) {
    if (child.name === ":") continue

    // Handle typed assignment: name: type = value
    if (child.name === "AssignStatement") {
      const field = parseDataclassFieldFromAssignment(child, ctx)
      if (field) fields.push(field)
    }
    // Handle bare type annotation: name: type (ExpressionStatement wrapping TypeAnnotation)
    else if (child.name === "ExpressionStatement") {
      const field = parseDataclassFieldFromExpression(child, ctx)
      if (field) fields.push(field)
    }
  }

  return fields
}

/**
 * Parse a field from an assignment statement: name: type = value
 */
function parseDataclassFieldFromAssignment(
  node: SyntaxNode,
  ctx: TransformContext
): DataclassField | null {
  const children = getChildren(node)

  // Look for pattern: VariableName TypeDef AssignOp Value
  let varName: SyntaxNode | null = null
  let typeDef: SyntaxNode | null = null
  let assignOpIndex = -1

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (!child) continue

    if (child.name === "VariableName" && !varName) {
      varName = child
    } else if (child.name === "TypeDef") {
      typeDef = child
    } else if (child.name === "AssignOp" || child.name === "=") {
      assignOpIndex = i
    }
  }

  // Must have type annotation to be a dataclass field
  if (!varName || !typeDef) {
    return null
  }

  const name = getNodeText(varName, ctx.source)
  const tsType = extractTypeAnnotation(typeDef, ctx) ?? "unknown"

  let hasDefault = false
  let defaultValue: string | null = null
  let isFieldFactory = false

  if (assignOpIndex !== -1) {
    hasDefault = true
    const valueNodes = children.slice(assignOpIndex + 1).filter((c) => c.name !== ",")
    const firstValue = valueNodes[0]

    if (firstValue) {
      // Check for field(default_factory=...) pattern
      if (firstValue.name === "CallExpression") {
        const callText = getNodeText(firstValue, ctx.source)
        if (callText.startsWith("field(")) {
          isFieldFactory = true
          defaultValue = parseFieldDefaultFactory(firstValue, ctx)
        } else {
          defaultValue = transformNode(firstValue, ctx)
        }
      } else {
        defaultValue = transformNode(firstValue, ctx)
      }
    }
  }

  return { name, tsType, hasDefault, defaultValue, isFieldFactory }
}

/**
 * Parse a field from an expression statement (bare type annotation): name: type
 */
function parseDataclassFieldFromExpression(
  node: SyntaxNode,
  ctx: TransformContext
): DataclassField | null {
  const children = getChildren(node)

  // Look for VariableName and TypeDef (or a pattern like "name: type")
  for (const child of children) {
    // Check if this is an annotated name expression
    if (child.name === "VariableName") {
      // Look for TypeDef sibling
      const typeDef = children.find((c) => c.name === "TypeDef")
      if (typeDef) {
        const name = getNodeText(child, ctx.source)
        const tsType = extractTypeAnnotation(typeDef, ctx) ?? "unknown"
        return { name, tsType, hasDefault: false, defaultValue: null, isFieldFactory: false }
      }
    }
  }

  return null
}

/**
 * Parse field(default_factory=...) to extract the default value
 */
function parseFieldDefaultFactory(callNode: SyntaxNode, ctx: TransformContext): string {
  const text = getNodeText(callNode, ctx.source)

  // Extract the factory from field(default_factory=X)
  const factoryMatch = /default_factory\s*=\s*(\w+)/.exec(text)
  if (factoryMatch) {
    const factory = factoryMatch[1]
    if (factory === "list") return "[]"
    if (factory === "dict") return "{}"
    if (factory === "set") return "new Set()"
    // For other factories, return the factory call
    if (factory) return `${factory}()`
  }

  // Check for default= pattern
  const defaultMatch = /default\s*=\s*([^,)]+)/.exec(text)
  if (defaultMatch) {
    return defaultMatch[1]?.trim() ?? "undefined"
  }

  return "undefined"
}

/**
 * Transform @dataclass decorated class
 */
function transformDataclass(
  classDef: SyntaxNode,
  decorator: { name: string; args: string | null },
  ctx: TransformContext
): string {
  const children = getChildren(classDef)

  let className = ""
  let body: SyntaxNode | null = null
  const parentClasses: string[] = []

  for (const child of children) {
    if (child.name === "VariableName") {
      className = getNodeText(child, ctx.source)
      ctx.definedClasses.add(className)
    } else if (child.name === "ArgList") {
      // Inheritance
      const argChildren = getChildren(child)
      const parentNodes = argChildren.filter((c) => c.name === "VariableName")
      for (const parentNode of parentNodes) {
        parentClasses.push(getNodeText(parentNode, ctx.source))
      }
    } else if (child.name === "Body") {
      body = child
    }
  }

  // Extract dataclass options
  const options = parseDataclassOptions(decorator.args)

  // Extract fields from body
  const fields = body ? extractDataclassFields(body, ctx) : []

  // Extract docstring
  const indent = "  ".repeat(ctx.indentLevel)
  const { jsdoc } = body ? extractDocstringFromBody(body, ctx, indent) : { jsdoc: null }

  // Generate class code
  return generateDataclassCode(className, parentClasses, fields, options, body, ctx, jsdoc)
}

/**
 * Generate TypeScript class code from dataclass fields
 */
function generateDataclassCode(
  className: string,
  parentClasses: string[],
  fields: DataclassField[],
  options: DataclassOptions,
  body: SyntaxNode | null,
  ctx: TransformContext,
  jsdoc: string | null
): string {
  const memberIndent = "  "
  const bodyIndent = "    "
  const members: string[] = []

  // 1. Generate field declarations
  for (const field of fields) {
    const readonly = options.frozen ? "readonly " : ""
    if (field.hasDefault && field.defaultValue !== null && !field.isFieldFactory) {
      members.push(
        `${memberIndent}${readonly}${field.name}: ${field.tsType} = ${field.defaultValue};`
      )
    } else {
      members.push(`${memberIndent}${readonly}${field.name}: ${field.tsType};`)
    }
  }

  // 2. Generate constructor
  const constructorParams = fields
    .map((f) => {
      if (f.hasDefault && f.defaultValue !== null) {
        return `${f.name}: ${f.tsType} = ${f.defaultValue}`
      }
      return `${f.name}: ${f.tsType}`
    })
    .join(", ")

  const constructorAssignments = fields
    .map((f) => `${bodyIndent}this.${f.name} = ${f.name};`)
    .join("\n")

  let constructorBody = ""
  if (parentClasses.length > 0) {
    constructorBody += `${bodyIndent}super();\n`
  }
  constructorBody += constructorAssignments
  if (options.frozen) {
    constructorBody += `\n${bodyIndent}Object.freeze(this);`
  }

  members.push(
    `\n${memberIndent}constructor(${constructorParams}) {\n${constructorBody}\n${memberIndent}}`
  )

  // 3. Extract and add any methods defined in the class body
  if (body) {
    const methodMembers = extractNonFieldMembers(body, ctx, fields)
    if (methodMembers.length > 0) {
      members.push(...methodMembers)
    }
  }

  // Build class header
  let classHeader = `class ${className}`
  const firstParent = parentClasses[0]
  if (firstParent) {
    classHeader += ` extends ${firstParent}`
  }

  const classCode = `${classHeader} {\n${members.join("\n")}\n}`

  if (jsdoc) {
    return `${jsdoc}\n${classCode}`
  }
  return classCode
}

/**
 * Extract non-field members (methods) from dataclass body
 */
function extractNonFieldMembers(
  body: SyntaxNode,
  ctx: TransformContext,
  fields: DataclassField[]
): string[] {
  const members: string[] = []
  const children = getChildren(body)
  const fieldNames = new Set(fields.map((f) => f.name))

  // Track if we've seen the docstring already (it's always first)
  let skipFirst = false
  const firstChild = children.find((c) => c.name !== ":")
  if (firstChild && isDocstringNode(firstChild, ctx)) {
    skipFirst = true
  }

  let isFirst = true
  for (const child of children) {
    if (child.name === ":") continue
    if (isFirst && skipFirst) {
      isFirst = false
      continue
    }
    isFirst = false

    // Skip field declarations (AssignStatement and ExpressionStatement with type annotations)
    if (child.name === "AssignStatement" || child.name === "ExpressionStatement") {
      // Check if this is a field we already processed
      const childChildren = getChildren(child)
      const varName = childChildren.find((c) => c.name === "VariableName")
      if (varName && fieldNames.has(getNodeText(varName, ctx.source))) {
        continue
      }
      // Check for type annotation (indicates it's a field)
      const hasTypeDef = childChildren.some((c) => c.name === "TypeDef")
      if (hasTypeDef) {
        continue
      }
    }

    // Process methods
    if (child.name === "FunctionDefinition") {
      const methodName = getMethodName(child, ctx)
      // Skip __init__ as we generate our own constructor
      if (methodName !== "__init__") {
        ctx.indentLevel++
        members.push("\n" + transformClassMethod(child, ctx, null))
        ctx.indentLevel--
      }
    } else if (child.name === "DecoratedStatement") {
      ctx.indentLevel++
      members.push("\n" + transformClassDecoratedMethod(child, ctx))
      ctx.indentLevel--
    }
  }

  return members
}

/**
 * Get method name from a FunctionDefinition node
 */
function getMethodName(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  for (const child of children) {
    if (child.name === "VariableName") {
      return getNodeText(child, ctx.source)
    }
  }
  return ""
}

// ============================================================================
// NamedTuple Transformation
// ============================================================================

/**
 * Transform a NamedTuple class to a TypeScript class with readonly fields
 * NamedTuple is essentially a frozen dataclass
 */
function transformNamedTuple(
  className: string,
  body: SyntaxNode | null,
  ctx: TransformContext
): string {
  // Extract fields (reuse dataclass field extraction)
  const fields = body ? extractDataclassFields(body, ctx) : []

  // Generate like frozen dataclass (readonly + Object.freeze)
  return generateDataclassCode(
    className,
    [], // no parent classes in output
    fields,
    { frozen: true }, // always frozen
    body,
    ctx,
    null // jsdoc
  )
}

// ============================================================================
// Enum Transformation
// ============================================================================

interface EnumMember {
  name: string
  value: string
  isString: boolean
  numericValue: number | null
}

/**
 * Transform a Python Enum class to TypeScript
 * - String values → type union from values
 * - Sequential numeric values → type union from names
 * - Meaningful numeric values → as const object + union type
 */
function transformEnum(
  className: string,
  enumType: string,
  body: SyntaxNode | null,
  ctx: TransformContext
): string {
  const members = extractEnumMembers(body, ctx)

  if (members.length === 0) {
    return `type ${className} = never`
  }

  // Determine output format based on enum type and values
  const allStrings = members.every((m) => m.isString)

  // StrEnum or all string values → string union from values
  if (enumType === "StrEnum" || allStrings) {
    return generateStringUnionEnum(className, members)
  }

  // Check if values are sequential (1, 2, 3...) starting from any number
  const isSequential = checkSequentialEnum(members)

  // Sequential values → string union from names (values are meaningless)
  if (isSequential) {
    return generateNameUnionEnum(className, members)
  }

  // Meaningful numeric values → as const object + union type
  return generateConstObjectEnum(className, members)
}

/**
 * Extract enum members from class body
 */
function extractEnumMembers(body: SyntaxNode | null, ctx: TransformContext): EnumMember[] {
  if (!body) return []

  const members: EnumMember[] = []
  const children = getChildren(body)

  for (const child of children) {
    if (child.name === "AssignStatement") {
      const member = parseEnumMember(child, ctx)
      if (member) {
        members.push(member)
      }
    }
  }

  return members
}

/**
 * Parse a single enum member from an assignment statement
 */
function parseEnumMember(node: SyntaxNode, ctx: TransformContext): EnumMember | null {
  const children = getChildren(node)
  let name = ""
  let value = ""
  let isString = false
  let numericValue: number | null = null

  for (const child of children) {
    if (child.name === "VariableName" && !name) {
      name = getNodeText(child, ctx.source)
    } else if (child.name === "Number") {
      value = getNodeText(child, ctx.source)
      numericValue = parseFloat(value)
      isString = false
    } else if (child.name === "String") {
      const rawValue = getNodeText(child, ctx.source)
      // Remove quotes and get the actual string content
      value = rawValue.slice(1, -1)
      isString = true
    } else if (child.name === "CallExpression") {
      // Handle auto() - treat as sequential
      const callText = getNodeText(child, ctx.source)
      if (callText === "auto()") {
        value = "auto"
        numericValue = null
        isString = false
      } else {
        // Complex expression, use as-is
        value = callText
        isString = false
      }
    }
  }

  if (!name) return null

  return { name, value, isString, numericValue }
}

/**
 * Check if enum values are sequential (1, 2, 3... or any starting point)
 */
function checkSequentialEnum(members: EnumMember[]): boolean {
  if (members.length === 0) return true

  // If any member uses auto(), treat as sequential
  if (members.some((m) => m.value === "auto")) return true

  // Check if all values are numeric and sequential
  const values = members.map((m) => m.numericValue).filter((v): v is number => v !== null)
  if (values.length !== members.length) return false

  // Check for sequential pattern
  const firstValue = values[0]
  if (firstValue === undefined) return false

  for (let i = 1; i < values.length; i++) {
    if (values[i] !== firstValue + i) return false
  }

  return true
}

/**
 * Generate string union from enum member values
 * type Status = "pending" | "active"
 */
function generateStringUnionEnum(className: string, members: EnumMember[]): string {
  const values = members.map((m) => `"${m.value}"`).join(" | ")
  return `type ${className} = ${values}`
}

/**
 * Generate string union from enum member names
 * type Color = "RED" | "GREEN" | "BLUE"
 */
function generateNameUnionEnum(className: string, members: EnumMember[]): string {
  const names = members.map((m) => `"${m.name}"`).join(" | ")
  return `type ${className} = ${names}`
}

/**
 * Generate as const object with union type
 * const HttpStatus = { OK: 200, NOT_FOUND: 404 } as const
 * type HttpStatus = typeof HttpStatus[keyof typeof HttpStatus]
 */
function generateConstObjectEnum(className: string, members: EnumMember[]): string {
  const entries = members.map((m) => `  ${m.name}: ${m.value}`).join(",\n")
  return `const ${className} = {\n${entries}\n} as const\ntype ${className} = typeof ${className}[keyof typeof ${className}]`
}

// ============================================================================
// TypedDict Transformation
// ============================================================================

/**
 * Check if TypedDict has total=False in parent list
 */
function checkTypedDictTotalFalse(node: SyntaxNode, ctx: TransformContext): boolean {
  const children = getChildren(node)
  for (const child of children) {
    if (child.name === "ArgList") {
      const argText = getNodeText(child, ctx.source)
      // Check for total=False or total: False
      if (argText.includes("total=False") || argText.includes("total: False")) {
        return true
      }
    }
  }
  return false
}

/**
 * Transform a TypedDict class to a TypeScript interface
 */
function transformTypedDict(
  className: string,
  body: SyntaxNode | null,
  totalFalse: boolean,
  ctx: TransformContext
): string {
  const fields = body ? extractDataclassFields(body, ctx) : []
  const memberIndent = "  "

  const members = fields.map((f) => {
    const optional = totalFalse ? "?" : ""
    return `${memberIndent}${f.name}${optional}: ${f.tsType}`
  })

  if (members.length === 0) {
    return `interface ${className} {}`
  }

  return `interface ${className} {\n${members.join("\n")}\n}`
}

// ============================================================================
// Abstract Class Transformation
// ============================================================================

/**
 * Transform an ABC (Abstract Base Class) to a TypeScript abstract class
 */
function transformAbstractClass(
  className: string,
  parentClasses: string[],
  body: SyntaxNode | null,
  ctx: TransformContext,
  jsdoc: string | null
): string {
  // Filter out ABC from parent classes
  const filteredParents = parentClasses.filter((p) => p !== "ABC")

  // Build class header
  let classHeader = `abstract class ${className}`
  const firstParent = filteredParents[0]
  if (firstParent) {
    classHeader += ` extends ${firstParent}`
  }

  // Transform class body with abstract method support
  ctx.isAbstractClass = true
  const bodyCode = body ? transformClassBody(body, ctx, false) : ""
  ctx.isAbstractClass = false

  const classDecl = `${classHeader} {\n${bodyCode}\n}`
  return jsdoc ? `${jsdoc}\n${classDecl}` : classDecl
}

// ============================================================================
// Protocol Transformation
// ============================================================================

/**
 * Transform a Protocol class to a TypeScript interface
 */
function transformProtocol(
  className: string,
  parentClasses: string[],
  body: SyntaxNode | null,
  ctx: TransformContext
): string {
  const memberIndent = "  "
  const members: string[] = []

  // Check for Generic[T] in parent classes
  const genericParams = extractGenericParams(parentClasses)
  const genericStr = genericParams.length > 0 ? `<${genericParams.join(", ")}>` : ""

  // Find other parent protocols (excluding Protocol and Generic[...])
  const otherParents = parentClasses.filter((p) => p !== "Protocol" && !p.startsWith("Generic["))

  if (body) {
    const children = getChildren(body)
    for (const child of children) {
      if (child.name === ":") continue
      if (child.name === "PassStatement") continue

      // Handle method definitions
      if (child.name === "FunctionDefinition") {
        const sig = extractProtocolMethodSignature(child, ctx)
        if (sig) {
          members.push(`${memberIndent}${sig}`)
        }
      }
      // Handle typed fields
      else if (child.name === "ExpressionStatement" || child.name === "AssignStatement") {
        const field =
          parseDataclassFieldFromExpression(child, ctx) ??
          parseDataclassFieldFromAssignment(child, ctx)
        if (field) {
          members.push(`${memberIndent}${field.name}: ${field.tsType}`)
        }
      }
    }
  }

  // Build interface header
  let header = `interface ${className}${genericStr}`
  if (otherParents.length > 0) {
    header += ` extends ${otherParents.join(", ")}`
  }

  if (members.length === 0) {
    return `${header} {}`
  }

  return `${header} {\n${members.join("\n")}\n}`
}

/**
 * Extract method signature from a FunctionDefinition for Protocol interface
 */
function extractProtocolMethodSignature(node: SyntaxNode, ctx: TransformContext): string | null {
  const children = getChildren(node)
  let methodName = ""
  let params: string[] = []
  let returnType = "void"

  for (const child of children) {
    if (child.name === "def") continue

    if (child.name === "VariableName" && !methodName) {
      methodName = getNodeText(child, ctx.source)
    } else if (child.name === "ParamList") {
      params = extractProtocolParams(child, ctx)
    } else if (child.name === "TypeDef") {
      const rt = extractTypeAnnotation(child, ctx)
      if (rt) returnType = rt === "null" ? "void" : rt
    }
  }

  if (!methodName || methodName === "__init__") return null

  return `${methodName}(${params.join(", ")}): ${returnType}`
}

/**
 * Extract parameter list for Protocol method (excluding self)
 */
function extractProtocolParams(node: SyntaxNode, ctx: TransformContext): string[] {
  const children = getChildren(node)
  const params: string[] = []

  let i = 0
  while (i < children.length) {
    const child = children[i]
    if (!child || child.name === "(" || child.name === ")" || child.name === ",") {
      i++
      continue
    }

    if (child.name === "VariableName") {
      const paramName = getNodeText(child, ctx.source)
      // Skip self/cls
      if (paramName === "self" || paramName === "cls") {
        i++
        continue
      }

      // Check for type annotation
      let paramType = "unknown"
      const nextChild = children[i + 1]
      if (nextChild?.name === "TypeDef") {
        const t = extractTypeAnnotation(nextChild, ctx)
        if (t) paramType = t
        i++
      }

      params.push(`${paramName}: ${paramType}`)
    }
    i++
  }

  return params
}

// ============================================================================
// Generic Class Transformation
// ============================================================================

/**
 * Extract generic type parameters from parent classes
 * e.g., ["Generic[T, V]"] -> ["T", "V"]
 */
function extractGenericParams(parentClasses: string[]): string[] {
  for (const parent of parentClasses) {
    if (parent.startsWith("Generic[") && parent.endsWith("]")) {
      // Extract "T, V" from "Generic[T, V]"
      const inner = parent.slice(8, -1) // Remove "Generic[" and "]"
      return inner.split(",").map((p) => p.trim())
    }
  }
  return []
}

/**
 * Transform a generic class (class Foo(Generic[T])) to TypeScript
 */
function transformGenericClass(
  className: string,
  genericParams: string[],
  parentClasses: string[],
  body: SyntaxNode | null,
  ctx: TransformContext,
  jsdoc: string | null
): string {
  // Build generic parameters string
  const genericStr = `<${genericParams.join(", ")}>`

  // Build class header
  let classHeader = `class ${className}${genericStr}`

  // Add extends if there are other parent classes
  const firstParent = parentClasses[0]
  if (firstParent) {
    classHeader += ` extends ${firstParent}`
  }

  // Transform class body
  const bodyCode = body ? transformClassBody(body, ctx, false) : ""

  const classDecl = `${classHeader} {\n${bodyCode}\n}`
  return jsdoc ? `${jsdoc}\n${classDecl}` : classDecl
}

interface ParsedParam {
  name: string
  type: string | null
  defaultValue: string | null
}

function transformParamList(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  const params: string[] = []
  const kwOnlyParams: ParsedParam[] = []
  let restParam: string | null = null
  let kwargsParam: string | null = null
  let inKeywordOnly = false
  let i = 0

  // Helper to parse a single parameter
  const parseParam = (startIndex: number): { param: ParsedParam; consumed: number } | null => {
    const child = children[startIndex]
    if (child?.name !== "VariableName") return null

    const nameCode = escapeReservedKeyword(getNodeText(child, ctx.source))
    let tsType: string | null = null
    let defaultValue: string | null = null
    let offset = 1

    // Check for type annotation
    const nextChild = children[startIndex + 1]
    if (nextChild?.name === "TypeDef") {
      tsType = extractTypeAnnotation(nextChild, ctx)
      offset = 2
    }

    // Check for default value
    const afterType = children[startIndex + offset]
    if (afterType?.name === "AssignOp") {
      const defaultValChild = children[startIndex + offset + 1]
      if (defaultValChild) {
        defaultValue = transformNode(defaultValChild, ctx)
        offset += 2
      }
    }

    return {
      param: { name: nameCode, type: tsType, defaultValue },
      consumed: offset
    }
  }

  // Helper to format a regular parameter
  const formatParam = (p: ParsedParam): string => {
    const typeAnnotation = p.type ? `: ${p.type}` : ""
    if (p.defaultValue !== null) {
      return `${p.name}${typeAnnotation} = ${p.defaultValue}`
    }
    return `${p.name}${typeAnnotation}`
  }

  while (i < children.length) {
    const child = children[i]
    if (!child) {
      i++
      continue
    }

    // Skip parentheses, commas, and positional-only marker (/)
    if (child.name === "(" || child.name === ")" || child.name === "," || child.name === "/") {
      i++
      continue
    }

    // Check for * (either *args or keyword-only marker)
    if (child.name === "*" || getNodeText(child, ctx.source) === "*") {
      const nextChild = children[i + 1]
      if (nextChild?.name === "VariableName") {
        // This is *args (rest parameter)
        const name = escapeReservedKeyword(getNodeText(nextChild, ctx.source))
        const typeChild = children[i + 2]
        if (typeChild?.name === "TypeDef") {
          const tsType = extractTypeAnnotation(typeChild, ctx)
          restParam = tsType ? `...${name}: ${tsType}[]` : `...${name}`
          i += 3
        } else {
          restParam = `...${name}`
          i += 2
        }
        // After *args, remaining params are keyword-only
        inKeywordOnly = true
        continue
      }
      // Bare * - keyword-only marker
      inKeywordOnly = true
      i++
      continue
    }

    // Check for **kwargs
    if (child.name === "**" || getNodeText(child, ctx.source) === "**") {
      const nextChild = children[i + 1]
      if (nextChild?.name === "VariableName") {
        kwargsParam = escapeReservedKeyword(getNodeText(nextChild, ctx.source))
        i += 2
        continue
      }
      i++
      continue
    }

    // Handle regular parameter
    if (child.name === "VariableName") {
      const result = parseParam(i)
      if (result) {
        if (inKeywordOnly) {
          kwOnlyParams.push(result.param)
        } else {
          params.push(formatParam(result.param))
        }
        i += result.consumed
        continue
      }
    }

    // Parameter with default value wrapped in a node (legacy handling)
    if (child.name === "AssignParam" || child.name === "DefaultParam") {
      const paramChildren = getChildren(child)
      const name = paramChildren.find((c) => c.name === "VariableName")
      const typeDef = paramChildren.find((c) => c.name === "TypeDef")
      const defaultVal = paramChildren[paramChildren.length - 1]

      if (name) {
        const nameCode = escapeReservedKeyword(getNodeText(name, ctx.source))
        const tsType = extractTypeAnnotation(typeDef, ctx)
        let defaultValue: string | null = null

        if (defaultVal && name !== defaultVal && defaultVal.name !== "TypeDef") {
          defaultValue = transformNode(defaultVal, ctx)
        }

        const param: ParsedParam = { name: nameCode, type: tsType, defaultValue }
        if (inKeywordOnly) {
          kwOnlyParams.push(param)
        } else {
          params.push(formatParam(param))
        }
      }
      i++
      continue
    }

    i++
  }

  // Build keyword-only params as destructured options object
  if (kwOnlyParams.length > 0) {
    const destructuredNames: string[] = []
    const typeProps: string[] = []
    const defaults: string[] = []

    for (const p of kwOnlyParams) {
      destructuredNames.push(p.name)
      // All keyword-only params are optional in the type (they have defaults or caller must provide)
      const propType = p.type ?? "unknown"
      typeProps.push(`${p.name}?: ${propType}`)
      if (p.defaultValue !== null) {
        defaults.push(`${p.name} = ${p.defaultValue}`)
      } else {
        defaults.push(p.name)
      }
    }

    const destructure = `{ ${defaults.join(", ")} }`
    const typeAnnotation = `{ ${typeProps.join("; ")} }`
    params.push(`${destructure}: ${typeAnnotation} = {}`)
  }

  // Add kwargs parameter if present
  if (kwargsParam) {
    const kwargsType = ": Record<string, unknown>"
    params.push(`${kwargsParam}${kwargsType} = {}`)
  }

  // Add rest parameter last (must be last in JS)
  if (restParam) {
    params.push(restParam)
  }

  return params.join(", ")
}

function transformComment(node: SyntaxNode, ctx: TransformContext): string {
  const text = getNodeText(node, ctx.source)
  // Convert Python comment to JS comment
  return "//" + text.slice(1)
}

function transformLambdaExpression(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)

  // Lambda format: lambda params: body
  // Find the ParamList (or individual params) and the body expression
  let params = ""
  let body: SyntaxNode | null = null

  // Skip 'lambda' keyword and ':' to find params and body
  let foundLambda = false
  let foundColon = false
  const paramNodes: SyntaxNode[] = []

  for (const child of children) {
    const text = getNodeText(child, ctx.source)

    if (child.name === "lambda" || (child.name === "Keyword" && text === "lambda")) {
      foundLambda = true
      continue
    }

    if (child.name === ":") {
      foundColon = true
      continue
    }

    if (foundLambda && !foundColon) {
      // This is a parameter
      if (child.name === "ParamList") {
        params = transformParamList(child, ctx)
      } else if (child.name === "VariableName") {
        paramNodes.push(child)
      } else if (child.name !== ",") {
        paramNodes.push(child)
      }
    } else if (foundColon) {
      // This is the body
      body = child
      break
    }
  }

  // If we collected individual param nodes, join them
  if (!params && paramNodes.length > 0) {
    params = paramNodes.map((p) => getNodeText(p, ctx.source)).join(", ")
  }

  const bodyCode = body ? transformNode(body, ctx) : ""

  // TypeScript arrow function: (params) => body
  if (params) {
    return `(${params}) => ${bodyCode}`
  }
  return `() => ${bodyCode}`
}

// ============================================================
// Comprehensions
// ============================================================

interface ComprehensionClause {
  type: "for" | "if"
  variable?: string
  iterable?: string
  condition?: string
}

function parseComprehensionClauses(
  children: SyntaxNode[],
  ctx: TransformContext
): {
  outputExpr: string
  clauses: ComprehensionClause[]
} {
  // Skip brackets
  const items = children.filter(
    (c) => c.name !== "[" && c.name !== "]" && c.name !== "{" && c.name !== "}"
  )

  if (items.length === 0) {
    return { outputExpr: "", clauses: [] }
  }

  // First item is the output expression
  const outputNode = items[0]
  if (!outputNode) {
    return { outputExpr: "", clauses: [] }
  }
  const outputExpr = transformNode(outputNode, ctx)

  const clauses: ComprehensionClause[] = []
  let i = 1

  while (i < items.length) {
    const item = items[i]
    if (!item) {
      i++
      continue
    }

    if (
      item.name === "for" ||
      (item.name === "Keyword" && getNodeText(item, ctx.source) === "for")
    ) {
      // for variable(s) in iterable
      // Handle tuple unpacking: for ax, s in enumerate(...)
      // Find the 'in' keyword to determine where variables end
      let inIndex = -1
      for (let j = i + 1; j < items.length; j++) {
        const candidate = items[j]
        if (
          candidate &&
          (candidate.name === "in" ||
            (candidate.name === "Keyword" && getNodeText(candidate, ctx.source) === "in"))
        ) {
          inIndex = j
          break
        }
      }

      if (inIndex === -1) {
        i++
        continue
      }

      // Collect all variable nodes between 'for' and 'in'
      const varNodes: SyntaxNode[] = []
      for (let j = i + 1; j < inIndex; j++) {
        const varCandidate = items[j]
        if (varCandidate && varCandidate.name !== ",") {
          varNodes.push(varCandidate)
        }
      }

      // Get the iterable node after 'in'
      const iterableNode = items[inIndex + 1]

      if (varNodes.length > 0 && iterableNode) {
        let variable: string
        const firstVarNode = varNodes[0]
        if (varNodes.length === 1 && firstVarNode) {
          // Single variable - use transformForLoopVar to handle TupleExpression correctly
          // e.g., for (a, b) in ... -> for [a, b] of ...
          variable = transformForLoopVar(firstVarNode, ctx)
        } else {
          // Tuple unpacking - create destructuring pattern, use transformForLoopVar for nested tuples
          // e.g., for x, (a, b) in ... -> for [x, [a, b]] of ...
          variable = "[" + varNodes.map((v) => transformForLoopVar(v, ctx)).join(", ") + "]"
        }

        clauses.push({
          type: "for",
          variable,
          iterable: transformNode(iterableNode, ctx)
        })
        i = inIndex + 2 // Move past 'in' and iterable
      } else {
        i++
      }
    } else if (
      item.name === "if" ||
      (item.name === "Keyword" && getNodeText(item, ctx.source) === "if")
    ) {
      // if condition
      const conditionNode = items[i + 1]
      if (conditionNode) {
        clauses.push({
          type: "if",
          condition: transformNode(conditionNode, ctx)
        })
        i += 2
      } else {
        i++
      }
    } else if (
      item.name === "in" ||
      (item.name === "Keyword" && getNodeText(item, ctx.source) === "in")
    ) {
      // Skip 'in' keyword (already handled in 'for' case)
      i++
    } else {
      i++
    }
  }

  return { outputExpr, clauses }
}

function transformArrayComprehension(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  const { outputExpr, clauses } = parseComprehensionClauses(children, ctx)

  if (clauses.length === 0) {
    return `[${outputExpr}]`
  }

  // Build the comprehension from inside out
  // [expr for x in items if cond] -> items.filter(x => cond).map(x => expr)
  // [expr for x in a for y in b] -> a.flatMap(x => b.map(y => expr))

  return buildComprehensionChain(outputExpr, clauses, "array")
}

function transformDictComprehension(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)

  // Dict comprehension has key: value as output
  // Find the colon to split key and value
  const items = children.filter((c) => c.name !== "{" && c.name !== "}")

  let keyExpr = ""
  let valueExpr = ""
  let colonIndex = -1

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item?.name === ":") {
      colonIndex = i
      break
    }
  }

  const keyNode = items[0]
  const valueNode = items[colonIndex + 1]
  if (colonIndex > 0 && keyNode && valueNode) {
    keyExpr = transformNode(keyNode, ctx)
    valueExpr = transformNode(valueNode, ctx)
  }

  // Parse clauses starting after key: value
  const clauseItems = items.slice(colonIndex + 2)
  const clauses: ComprehensionClause[] = []
  let i = 0

  while (i < clauseItems.length) {
    const item = clauseItems[i]
    if (!item) {
      i++
      continue
    }

    if (
      item.name === "for" ||
      (item.name === "Keyword" && getNodeText(item, ctx.source) === "for")
    ) {
      // Collect all variables between 'for' and 'in' (handles tuple unpacking like 'for k, v in ...')
      const variables: string[] = []
      let j = i + 1
      while (j < clauseItems.length) {
        const currentItem = clauseItems[j]
        if (
          currentItem?.name === "in" ||
          (currentItem && getNodeText(currentItem, ctx.source) === "in")
        ) {
          break
        }
        const varItem = clauseItems[j]
        if (varItem && varItem.name !== ",") {
          variables.push(transformNode(varItem, ctx))
        }
        j++
      }

      // Skip 'in' and get iterable
      const iterableNode = clauseItems[j + 1]

      const firstVariable = variables[0]
      if (variables.length > 0 && iterableNode && firstVariable) {
        const variable = variables.length === 1 ? firstVariable : `[${variables.join(", ")}]`
        clauses.push({
          type: "for",
          variable,
          iterable: transformNode(iterableNode, ctx)
        })
        i = j + 2
      } else {
        i++
      }
    } else if (
      item.name === "if" ||
      (item.name === "Keyword" && getNodeText(item, ctx.source) === "if")
    ) {
      const conditionNode = clauseItems[i + 1]
      if (conditionNode) {
        clauses.push({
          type: "if",
          condition: transformNode(conditionNode, ctx)
        })
        i += 2
      } else {
        i++
      }
    } else {
      i++
    }
  }

  ctx.usesRuntime.add("dict")
  return buildDictComprehensionChain(keyExpr, valueExpr, clauses)
}

function transformSetExpression(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  const elements = children.filter((c) => c.name !== "{" && c.name !== "}" && c.name !== ",")

  ctx.usesRuntime.add("set")
  const elementCodes = elements.map((el) => transformNode(el, ctx))
  return `set([${elementCodes.join(", ")}])`
}

function transformSetComprehension(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  const { outputExpr, clauses } = parseComprehensionClauses(children, ctx)

  if (clauses.length === 0) {
    ctx.usesRuntime.add("set")
    return `set([${outputExpr}])`
  }

  ctx.usesRuntime.add("set")
  const arrayComp = buildComprehensionChain(outputExpr, clauses, "array")
  return `set(${arrayComp})`
}

function transformGeneratorExpression(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  // Filter out parentheses
  const items = children.filter((c) => c.name !== "(" && c.name !== ")")
  const { outputExpr, clauses } = parseComprehensionClauses(items, ctx)

  if (clauses.length === 0) {
    return outputExpr
  }

  // Build generator function: (function*() { for (const x of items) if (cond) yield expr })()
  return buildGeneratorChain(outputExpr, clauses)
}

function buildGeneratorChain(outputExpr: string, clauses: ComprehensionClause[]): string {
  // Separate for-clauses and their associated if-clauses
  const forClauses: { variable: string; iterable: string; conditions: string[] }[] = []

  for (const clause of clauses) {
    if (clause.type === "for" && clause.variable && clause.iterable) {
      forClauses.push({
        variable: clause.variable,
        iterable: clause.iterable,
        conditions: []
      })
    } else if (clause.type === "if" && clause.condition && forClauses.length > 0) {
      const lastFor = forClauses[forClauses.length - 1]
      if (lastFor) {
        lastFor.conditions.push(clause.condition)
      }
    }
  }

  if (forClauses.length === 0) {
    return `(function*() { yield ${outputExpr}; })()`
  }

  // Build nested for loops with conditions
  // (function*() { for (const x of items) if (cond) yield expr })()
  let body = ""
  let indent = ""
  const indentStep = "  "

  // Open for loops
  for (const fc of forClauses) {
    body += `${indent}for (const ${fc.variable} of ${fc.iterable}) `

    if (fc.conditions.length > 0) {
      const combinedCond = fc.conditions.join(" && ")
      body += `if (${combinedCond}) `
    }

    indent += indentStep
  }

  // Add yield
  body += `yield ${outputExpr};`

  return `(function*() { ${body} })()`
}

/**
 * Wrap iterables that don't have array methods (like py.range()) with spread syntax
 * to convert them to arrays that have .map(), .filter(), .flatMap()
 */
function wrapIterableIfNeeded(iterable: string): string {
  // Check if iterable is py.range(), py.enumerate(), py.zip(), py.reversed(), py.filter(), py.map()
  // These return Iterables, not Arrays
  if (
    iterable.startsWith("range(") ||
    iterable.startsWith("enumerate(") ||
    iterable.startsWith("zip(") ||
    iterable.startsWith("reversed(") ||
    iterable.startsWith("filter(") ||
    iterable.startsWith("map(")
  ) {
    return `[...${iterable}]`
  }
  return iterable
}

function buildComprehensionChain(
  outputExpr: string,
  clauses: ComprehensionClause[],
  type: "array" | "generator"
): string {
  if (clauses.length === 0) {
    return type === "array" ? `[${outputExpr}]` : outputExpr
  }

  // Separate for-clauses and their associated if-clauses
  const forClauses: { variable: string; iterable: string; conditions: string[] }[] = []

  for (const clause of clauses) {
    if (clause.type === "for" && clause.variable && clause.iterable) {
      forClauses.push({
        variable: clause.variable,
        iterable: clause.iterable,
        conditions: []
      })
    } else if (clause.type === "if" && clause.condition && forClauses.length > 0) {
      const lastFor = forClauses[forClauses.length - 1]
      if (lastFor) {
        lastFor.conditions.push(clause.condition)
      }
    }
  }

  if (forClauses.length === 0) {
    return type === "array" ? `[${outputExpr}]` : outputExpr
  }

  // Build chain from innermost to outermost
  // Single for: items.filter(...).map(...)
  // Multiple for: a.flatMap(x => b.filter(...).map(...))

  if (forClauses.length === 1) {
    const fc = forClauses[0]
    if (!fc) return `[${outputExpr}]`

    // Wrap iterables that are not arrays (like py.range()) with spread syntax
    let chain = wrapIterableIfNeeded(fc.iterable)

    // Add filters
    for (const cond of fc.conditions) {
      chain = `${chain}.filter((${fc.variable}) => ${cond})`
    }

    // Add map
    chain = `${chain}.map((${fc.variable}) => ${outputExpr})`

    return chain
  }

  // Multiple for-clauses: use flatMap
  // Build from outside in
  let result = ""

  for (let i = 0; i < forClauses.length; i++) {
    const fc = forClauses[i]
    if (!fc) continue

    const isLast = i === forClauses.length - 1

    // Wrap iterables that are not arrays (like py.range()) with spread syntax
    let inner = wrapIterableIfNeeded(fc.iterable)

    // Add filters
    for (const cond of fc.conditions) {
      inner = `${inner}.filter((${fc.variable}) => ${cond})`
    }

    if (isLast) {
      // Innermost: use map
      inner = `${inner}.map((${fc.variable}) => ${outputExpr})`
    } else {
      // Not innermost: will wrap next level
      result = inner
      continue
    }

    // Now wrap from inside out
    for (let j = forClauses.length - 2; j >= 0; j--) {
      const outerFc = forClauses[j]
      if (!outerFc) continue

      // Wrap iterables that are not arrays (like py.range()) with spread syntax
      let outerChain = wrapIterableIfNeeded(outerFc.iterable)
      for (const cond of outerFc.conditions) {
        outerChain = `${outerChain}.filter((${outerFc.variable}) => ${cond})`
      }

      inner = `${outerChain}.flatMap((${outerFc.variable}) => ${inner})`
    }

    result = inner
    break
  }

  return result
}

function buildDictComprehensionChain(
  keyExpr: string,
  valueExpr: string,
  clauses: ComprehensionClause[]
): string {
  if (clauses.length === 0) {
    return `dict([[${keyExpr}, ${valueExpr}]])`
  }

  // Build array of [key, value] pairs, then wrap with py.dict
  const forClauses: { variable: string; iterable: string; conditions: string[] }[] = []

  for (const clause of clauses) {
    if (clause.type === "for" && clause.variable && clause.iterable) {
      forClauses.push({
        variable: clause.variable,
        iterable: clause.iterable,
        conditions: []
      })
    } else if (clause.type === "if" && clause.condition && forClauses.length > 0) {
      const lastFor = forClauses[forClauses.length - 1]
      if (lastFor) {
        lastFor.conditions.push(clause.condition)
      }
    }
  }

  if (forClauses.length === 0) {
    return `dict([[${keyExpr}, ${valueExpr}]])`
  }

  const pairExpr = `[${keyExpr}, ${valueExpr}]`
  const arrayComp = buildComprehensionChain(pairExpr, clauses, "array")

  return `dict(${arrayComp})`
}

// ============================================================
// Scope Statements (global, nonlocal)
// ============================================================

function transformScopeStatement(node: SyntaxNode, ctx: TransformContext): string {
  // global and nonlocal don't have direct JS equivalents
  // JS has different scoping rules - these are converted to comments
  const children = getChildren(node)
  const keyword = children.find((c) => c.name === "global" || c.name === "nonlocal")
  const keywordText = keyword ? getNodeText(keyword, ctx.source) : "scope"
  const vars = children
    .filter((c) => c.name === "VariableName")
    .map((c) => getNodeText(c, ctx.source))

  return `/* ${keywordText} ${vars.join(", ")} */`
}

// ============================================================
// Delete Statement
// ============================================================

function transformDeleteStatement(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  const targets = children.filter((c) => c.name !== "del" && c.name !== ",")

  const deletions = targets.map((target) => {
    if (target.name === "MemberExpression") {
      // del obj[key] or del obj.attr
      const memberChildren = getChildren(target)
      const obj = memberChildren[0]
      const bracket = memberChildren.find((c) => c.name === "[")

      if (bracket) {
        // del arr[index] - use splice for numeric index, delete for string key
        const objCode = obj ? transformNode(obj, ctx) : ""
        const indexNode = memberChildren.find((c) => c.name !== "[" && c.name !== "]" && c !== obj)
        const indexCode = indexNode ? transformNode(indexNode, ctx) : "0"

        // Check if index is a simple number
        if (indexNode?.name === "Number") {
          return `${objCode}.splice(${indexCode}, 1)`
        }
        // For other cases, use delete
        return `delete ${objCode}[${indexCode}]`
      } else {
        /* v8 ignore next 2 -- del obj.attr edge case @preserve */
        // del obj.attr
        return `delete ${transformNode(target, ctx)}`
      }
    } else if (target.name === "VariableName") {
      // del variable - not really possible in JS strict mode
      // Convert to setting undefined
      const varName = getNodeText(target, ctx.source)
      return `${varName} = undefined`
    }
    /* v8 ignore next -- fallback for complex del targets @preserve */
    return `delete ${transformNode(target, ctx)}`
  })

  return deletions.join(";\n")
}

// ============================================================
// Assert Statement
// ============================================================

function transformAssertStatement(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  // Find the condition (first expression after 'assert')
  const expressions = children.filter((c) => c.name !== "assert" && c.name !== ",")

  const condition = expressions[0]
  const message = expressions[1]

  const conditionCode = condition ? transformNode(condition, ctx) : "true"
  const messageCode = message ? transformNode(message, ctx) : '"Assertion failed"'

  return `if (!(${conditionCode})) throw new Error(${messageCode})`
}

// ============================================================
// Yield Statement (including yield from)
// ============================================================

function transformYieldStatement(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  const hasFrom = children.some((c) => c.name === "from")
  const valueNode = children.find((c) => c.name !== "yield" && c.name !== "from")

  if (hasFrom && valueNode) {
    // yield from expr -> yield* expr
    return `yield* ${transformNode(valueNode, ctx)}`
  } else if (valueNode) {
    // yield expr
    return `yield ${transformNode(valueNode, ctx)}`
  }
  /* v8 ignore next -- bare yield statement @preserve */
  return "yield"
}

export { transformNode, createContext }

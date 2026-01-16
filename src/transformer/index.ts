import type { SyntaxNode } from "@lezer/common"
import { getNodeText, getChildren, parse, type ParseResult } from "../parser/index.js"

export interface TransformContext {
  source: string
  indentLevel: number
  usesRuntime: Set<string>
  /** Stack of scopes - each scope is a set of variable names declared in that scope */
  scopeStack: Set<string>[]
  /** Set of class names defined in this module (for adding 'new' on instantiation) */
  definedClasses: Set<string>
}

export interface TransformResult {
  code: string
  usesRuntime: Set<string>
}

function createContext(source: string): TransformContext {
  return {
    source,
    indentLevel: 0,
    usesRuntime: new Set(),
    scopeStack: [new Set()], // Start with one global scope
    definedClasses: new Set()
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
      if (bracketStart === -1 || bracketEnd === -1) {
        return PYTHON_TO_TS_TYPES[baseName] ?? baseName
      }

      const typeArgs = children
        .slice(bracketStart + 1, bracketEnd)
        .filter((c) => c.name !== ",")
        .map((c) => transformPythonType(c, ctx))

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
          return typeArgs.length > 0 ? `ReadonlySet<${first}>` : "ReadonlySet<unknown>"
        case "tuple":
        case "Tuple":
          return `[${typeArgs.join(", ")}]`
        case "Optional":
          return typeArgs.length > 0 ? `${first} | null` : "unknown | null"
        case "Union":
          return typeArgs.join(" | ")
        case "Callable":
          // Callable[[arg1, arg2], return] -> (arg1, arg2) => return
          if (typeArgs.length >= 2) {
            // For simplicity, we use a generic function type
            return `(...args: unknown[]) => ${last}`
          }
          return "(...args: unknown[]) => unknown"
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
        case "Literal":
          // Literal["a", "b"] -> "a" | "b"
          return typeArgs.join(" | ")
        default:
          // Generic class type: MyClass[T] -> MyClass<T>
          return typeArgs.length > 0 ? `${baseName}<${typeArgs.join(", ")}>` : baseName
      }
    }

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
  if (!typeDef || typeDef.name !== "TypeDef") return null
  const children = getChildren(typeDef)
  const typeNode = children.find((c) => c.name !== ":" && c.name !== "->")
  if (typeNode) {
    return transformPythonType(typeNode, ctx)
  }
  return null
}

// ============================================================================
// Docstring → JSDoc helpers
// ============================================================================

interface ParsedDocstring {
  description: string
  params: Array<{ name: string; description: string }>
  returns: string | null
  throws: Array<{ type: string; description: string }>
}

/**
 * Check if a node is a docstring (ExpressionStatement containing a String)
 */
function isDocstringNode(node: SyntaxNode, ctx: TransformContext): boolean {
  if (node.name !== "ExpressionStatement") return false
  const children = getChildren(node)
  const firstChild = children[0]
  if (!firstChild || firstChild.name !== "String") return false

  const text = getNodeText(firstChild, ctx.source)
  // Must be a triple-quoted string
  return text.startsWith('"""') || text.startsWith("'''")
}

/**
 * Extract docstring content from a triple-quoted string
 */
function extractDocstringContent(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  const stringNode = children[0]
  if (!stringNode) return ""

  const text = getNodeText(stringNode, ctx.source)

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

  for (const line of lines) {
    const trimmed = line.trim()

    // Check for section headers
    if (/^(Args|Arguments|Parameters):$/i.test(trimmed)) {
      currentSection = "params"
      continue
    }
    if (/^(Returns?|Yields?):$/i.test(trimmed)) {
      flushParam()
      currentSection = "returns"
      continue
    }
    if (/^(Raises?|Throws?|Exceptions?):$/i.test(trimmed)) {
      flushParam()
      currentSection = "throws"
      continue
    }

    // Skip empty section markers like "Examples:", "Notes:", etc.
    if (/^[A-Z][a-z]+:$/.test(trimmed)) {
      continue
    }

    switch (currentSection) {
      case "description":
        descriptionLines.push(trimmed)
        break

      case "params": {
        // Google-style: "name (type): description" or "name: description"
        // NumPy-style: "name : type\n    description"
        const googleMatch = trimmed.match(/^(\w+)\s*(?:\([^)]*\))?\s*:\s*(.*)$/)
        if (googleMatch) {
          flushParam()
          currentParamName = googleMatch[1] ?? ""
          const desc = googleMatch[2] ?? ""
          if (desc) currentParamDesc.push(desc)
        } else if (currentParamName && trimmed) {
          // Continuation line for current param
          currentParamDesc.push(trimmed)
        }
        break
      }

      case "returns": {
        // Strip type prefix like "str: " or "(str): "
        const stripped = trimmed.replace(/^(?:\([^)]*\)|[^:]+):\s*/, "")
        if (stripped || trimmed) {
          returnsLines.push(stripped || trimmed)
        }
        break
      }

      case "throws": {
        // Google-style: "ValueError: description"
        const throwsMatch = trimmed.match(/^(\w+)\s*:\s*(.*)$/)
        if (throwsMatch) {
          flushThrows()
          currentThrowsType = throwsMatch[1] ?? "Error"
          const desc = throwsMatch[2] ?? ""
          if (desc) currentThrowsDesc.push(desc)
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
    usesRuntime: ctx.usesRuntime
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
    case "Boolean":
      return transformBoolean(node, ctx)
    case "None":
      return "null"
    case "VariableName":
      return getNodeText(node, ctx.source)
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
      return "/* pass */"
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
    default:
      return getNodeText(node, ctx.source)
  }
}

function transformScript(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  const statements = children
    .filter((child) => child.name !== "Comment" || getNodeText(child, ctx.source).trim() !== "")
    .map((child) => {
      const transformed = transformNode(child, ctx)
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

  // Find the assignment operator
  const assignOpIndex = children.findIndex((c) => c.name === "AssignOp" || c.name === "=")
  if (assignOpIndex === -1) return getNodeText(node, ctx.source)

  // Find type annotation (TypeDef before AssignOp)
  const typeDef = children.slice(0, assignOpIndex).find((c) => c.name === "TypeDef")

  // Collect targets (before =) and values (after =)
  // Filter out commas and TypeDef nodes (type annotations like `: int`)
  const targets = children
    .slice(0, assignOpIndex)
    .filter((c) => c.name !== "," && c.name !== "TypeDef")
  const values = children.slice(assignOpIndex + 1).filter((c) => c.name !== ",")

  /* c8 ignore next 3 - defensive: empty targets/values can't occur with valid Python */
  if (targets.length === 0 || values.length === 0) {
    return getNodeText(node, ctx.source)
  }

  // Single target assignment
  if (targets.length === 1) {
    const target = targets[0]
    /* c8 ignore next */
    if (!target) return getNodeText(node, ctx.source)

    // Check for slice assignment: arr[1:3] = values
    if (target.name === "MemberExpression" && isSliceExpression(target)) {
      return transformSliceAssignment(target, values, ctx)
    }

    const targetCode = transformNode(target, ctx)

    // Extract type annotation if present
    const tsType = extractTypeAnnotation(typeDef, ctx)
    const typeAnnotation = tsType ? `: ${tsType}` : ""

    // Determine if we need 'let' or not
    // - MemberExpression (obj.attr or arr[i]) never needs 'let'
    // - VariableName needs 'let' only if not already declared in an accessible scope
    let needsLet = false
    if (target.name === "VariableName") {
      const varName = getNodeText(target, ctx.source)
      if (!isVariableDeclared(ctx, varName)) {
        needsLet = true
        declareVariable(ctx, varName)
      }
    }

    if (values.length === 1) {
      const value = values[0]
      if (!value) return getNodeText(node, ctx.source)
      const valueCode = transformNode(value, ctx)
      if (needsLet) {
        return `let ${targetCode}${typeAnnotation} = ${valueCode}`
      }
      return `${targetCode} = ${valueCode}`
    } else {
      // Multiple values into single target (creates array)
      const valuesCodes = values.map((v) => transformNode(v, ctx))
      if (needsLet) {
        return `let ${targetCode}${typeAnnotation} = [${valuesCodes.join(", ")}]`
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
    /* c8 ignore next */
    if (!value) return getNodeText(node, ctx.source)
    const valueCode = transformNode(value, ctx)
    return allDeclaredAtAccessibleScope
      ? `${targetPattern} = ${valueCode}`
      : `let ${targetPattern} = ${valueCode}`
  } else {
    // Multiple values: a, b = 1, 2
    const valuesCodes = values.map((v) => transformNode(v, ctx))
    return allDeclaredAtAccessibleScope
      ? `${targetPattern} = [${valuesCodes.join(", ")}]`
      : `let ${targetPattern} = [${valuesCodes.join(", ")}]`
  }
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

  return `py.list.sliceAssign(${objCode}, ${start ?? "undefined"}, ${end ?? "undefined"}, ${step ?? "undefined"}, ${valuesCode})`
}

function transformAssignTarget(node: SyntaxNode, ctx: TransformContext): string {
  if (node.name === "VariableName") {
    return getNodeText(node, ctx.source)
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
  const right = children[2]

  if (!left || !op || !right) return getNodeText(node, ctx.source)

  const opText = getNodeText(op, ctx.source)

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
      ctx.usesRuntime.add("floordiv")
      return `py.floordiv(${leftCode}, ${rightCode})`
    case "**":
      ctx.usesRuntime.add("pow")
      return `py.pow(${leftCode}, ${rightCode})`
    case "%":
      // Check for string formatting (e.g., "Hello %s" % name)
      if (left.name === "String" || left.name === "FormatString") {
        ctx.usesRuntime.add("sprintf")
        return `py.sprintf(${leftCode}, ${rightCode})`
      }
      ctx.usesRuntime.add("mod")
      return `py.mod(${leftCode}, ${rightCode})`
    case "and":
      return `(${leftCode} && ${rightCode})`
    case "or":
      return `(${leftCode} || ${rightCode})`
    case "in":
      ctx.usesRuntime.add("in")
      return `py.in(${leftCode}, ${rightCode})`
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
        ctx.usesRuntime.add("repeat")
        return `py.repeat(${leftCode}, ${rightCode})`
      }
      if (isNumberLiteral(left) && isStringOrArrayLiteral(right)) {
        ctx.usesRuntime.add("repeat")
        return `py.repeat(${rightCode}, ${leftCode})`
      }
      return `(${leftCode} * ${rightCode})`
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
  if (!op || op.name !== "CompareOp") return false
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

  /* c8 ignore next 3 - defensive: walrus operator always has name and value */
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

    /* c8 ignore next - defensive: checked exprs.length >= 3 above */
    if (trueExpr && condition && falseExpr) {
      const condCode = transformNode(condition, ctx)
      const trueCode = transformNode(trueExpr, ctx)
      const falseCode = transformNode(falseExpr, ctx)

      return `(${condCode} ? ${trueCode} : ${falseCode})`
    }
  }

  /* c8 ignore next */
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

  // Handle raw strings
  if (text.startsWith('r"') || text.startsWith("r'")) {
    return text.slice(1)
  }
  if (text.startsWith('R"') || text.startsWith("R'")) {
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
        exprCode = `py.repr(${exprCode})`
        ctx.usesRuntime.add("repr")
      } else if (conversion === "s") {
        exprCode = `py.str(${exprCode})`
        ctx.usesRuntime.add("str")
      } else if (conversion === "a") {
        exprCode = `py.ascii(${exprCode})`
        ctx.usesRuntime.add("ascii")
      }

      // Apply format spec
      if (formatSpec) {
        ctx.usesRuntime.add("format")
        result += `\${py.format(${exprCode}, "${formatSpec}")}`
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
      return `py.len(${args})`
    case "range":
      ctx.usesRuntime.add("range")
      return `py.range(${args})`
    case "int":
      ctx.usesRuntime.add("int")
      return `py.int(${args})`
    case "float":
      ctx.usesRuntime.add("float")
      return `py.float(${args})`
    case "str":
      ctx.usesRuntime.add("str")
      return `py.str(${args})`
    case "bool":
      ctx.usesRuntime.add("bool")
      return `py.bool(${args})`
    case "abs":
      ctx.usesRuntime.add("abs")
      return `py.abs(${args})`
    case "min":
      ctx.usesRuntime.add("min")
      return `py.min(${args})`
    case "max":
      ctx.usesRuntime.add("max")
      return `py.max(${args})`
    case "sum":
      ctx.usesRuntime.add("sum")
      return `py.sum(${args})`
    case "list":
      ctx.usesRuntime.add("list")
      return `py.list(${args})`
    case "dict":
      ctx.usesRuntime.add("dict")
      return `py.dict(${args})`
    case "set":
      ctx.usesRuntime.add("set")
      return `py.set(${args})`
    case "tuple":
      ctx.usesRuntime.add("tuple")
      return `py.tuple(${args})`
    case "enumerate":
      ctx.usesRuntime.add("enumerate")
      return `py.enumerate(${args})`
    case "zip":
      ctx.usesRuntime.add("zip")
      return `py.zip(${args})`
    case "sorted":
      ctx.usesRuntime.add("sorted")
      return `py.sorted(${args})`
    case "reversed":
      ctx.usesRuntime.add("reversed")
      return `py.reversed(${args})`
    case "isinstance":
      ctx.usesRuntime.add("isinstance")
      return `py.isinstance(${args})`
    case "type":
      ctx.usesRuntime.add("type")
      return `py.type(${args})`
    case "input":
      ctx.usesRuntime.add("input")
      return `py.input(${args})`
    case "ord":
      ctx.usesRuntime.add("ord")
      return `py.ord(${args})`
    case "chr":
      ctx.usesRuntime.add("chr")
      return `py.chr(${args})`
    case "all":
      ctx.usesRuntime.add("all")
      return `py.all(${args})`
    case "any":
      ctx.usesRuntime.add("any")
      return `py.any(${args})`
    case "map":
      ctx.usesRuntime.add("map")
      return `py.map(${args})`
    case "filter":
      ctx.usesRuntime.add("filter")
      return `py.filter(${args})`
    case "repr":
      ctx.usesRuntime.add("repr")
      return `py.repr(${args})`
    case "round":
      ctx.usesRuntime.add("round")
      return `py.round(${args})`
    case "divmod":
      ctx.usesRuntime.add("divmod")
      return `py.divmod(${args})`
    case "hex":
      ctx.usesRuntime.add("hex")
      return `py.hex(${args})`
    case "oct":
      ctx.usesRuntime.add("oct")
      return `py.oct(${args})`
    case "bin":
      ctx.usesRuntime.add("bin")
      return `py.bin(${args})`
    default:
      // Regular function call
      return `${transformNode(callee, ctx)}(${args})`
  }
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
      return `py.string.capitalize(${objCode})`
    case "title":
      ctx.usesRuntime.add("string")
      return `py.string.title(${objCode})`
    case "swapcase":
      ctx.usesRuntime.add("string")
      return `py.string.swapcase(${objCode})`
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
      return `py.string.index(${objCode}, ${args})`
    case "rindex":
      ctx.usesRuntime.add("string")
      return `py.string.rindex(${objCode}, ${args})`
    case "count":
      ctx.usesRuntime.add("string")
      return `py.string.count(${objCode}, ${args})`

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
      return `py.string.replace(${objCode}, ${args})`
    case "zfill":
      ctx.usesRuntime.add("string")
      return `py.string.zfill(${objCode}, ${args})`
    case "center":
      ctx.usesRuntime.add("string")
      return `py.string.center(${objCode}, ${args})`
    case "ljust":
      return `${objCode}.padEnd(${args})`
    case "rjust":
      return `${objCode}.padStart(${args})`

    // String split/join - join is special: "sep".join(arr) -> arr.join("sep")
    case "join":
      return `(${args}).join(${objCode})`
    case "split":
      return args ? `${objCode}.split(${args})` : `${objCode}.split(/\\s+/)`
    case "rsplit":
      ctx.usesRuntime.add("string")
      return `py.string.rsplit(${objCode}, ${args})`
    case "splitlines":
      return `${objCode}.split(/\\r?\\n/)`
    case "partition":
      ctx.usesRuntime.add("string")
      return `py.string.partition(${objCode}, ${args})`
    case "rpartition":
      ctx.usesRuntime.add("string")
      return `py.string.rpartition(${objCode}, ${args})`

    // String format method
    case "format":
      ctx.usesRuntime.add("strFormat")
      return `py.strFormat(${objCode}, ${args})`

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
      return `py.list.remove(${objCode}, ${args})`
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
      return args ? `py.list.sort(${objCode}, ${args})` : `${objCode}.sort()`

    // Dict methods
    case "keys":
      return `Object.keys(${objCode})`
    case "values":
      return `Object.values(${objCode})`
    case "items":
      return `Object.entries(${objCode})`
    case "get":
      ctx.usesRuntime.add("dict")
      return `py.dict.get(${objCode}, ${args})`
    case "setdefault":
      ctx.usesRuntime.add("dict")
      return `py.dict.setdefault(${objCode}, ${args})`
    case "update":
      return `Object.assign(${objCode}, ${args})`
    case "fromkeys":
      ctx.usesRuntime.add("dict")
      return `py.dict.fromkeys(${args})`

    // Set methods
    case "add":
      return `${objCode}.add(${args})`
    case "discard":
      return `${objCode}.delete(${args})`
    case "union":
      return `new Set([...${objCode}, ...${args}])`
    case "intersection":
      ctx.usesRuntime.add("set")
      return `py.set.intersection(${objCode}, ${args})`
    case "difference":
      ctx.usesRuntime.add("set")
      return `py.set.difference(${objCode}, ${args})`
    case "symmetric_difference":
      ctx.usesRuntime.add("set")
      return `py.set.symmetricDifference(${objCode}, ${args})`
    case "issubset":
      ctx.usesRuntime.add("set")
      return `py.set.issubset(${objCode}, ${args})`
    case "issuperset":
      ctx.usesRuntime.add("set")
      return `py.set.issuperset(${objCode}, ${args})`

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
    /* c8 ignore next 4 - defensive: items from parser are never null */
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
        // **kwargs spreads object properties as keyword arguments
        args.push(`...Object.entries(${transformNode(nextItem, ctx)})`)
        i += 2
        continue
      }
    }

    // Check for keyword argument: VariableName AssignOp Value
    if (item.name === "VariableName") {
      const nextItem = items[i + 1]
      if (nextItem && nextItem.name === "AssignOp") {
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
    const kwArgsStr = kwArgs.map((kw) => `${kw.name}: ${kw.value}`).join(", ")
    args.push(`{ ${kwArgsStr} }`)
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

    // Simple index access
    const indexElements = children.filter((c) => c.name !== "[" && c.name !== "]" && c !== obj)
    const index = indexElements[0]

    if (!index) return `${objCode}[]`

    const indexCode = transformNode(index, ctx)

    // Check if the index is a negative number literal (for py.at() support)
    if (isNegativeIndexLiteral(index, ctx)) {
      ctx.usesRuntime.add("at")
      return `py.at(${objCode}, ${indexCode})`
    }

    return `${objCode}[${indexCode}]`
  } else {
    // Dot access: obj.attr
    const prop = children[children.length - 1]
    if (!prop) return getNodeText(node, ctx.source)

    const objCode = transformNode(obj, ctx)
    const propName = getNodeText(prop, ctx.source)

    // Map Python special attributes to JavaScript equivalents
    const attrMap: Record<string, string> = {
      __name__: "name",
      __doc__: "undefined", // JS functions don't have docstrings
      __class__: "constructor",
      __dict__: "this" // Rough equivalent
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

  /* c8 ignore next 3 - defensive: subscript always has brackets */
  if (bracketStart === -1 || bracketEnd === -1) {
    return `py.slice(${objCode})`
  }

  // Get all elements between brackets
  const sliceElements = children.slice(bracketStart + 1, bracketEnd)

  // Parse slice notation (start:stop:step)
  const colonIndices: number[] = []
  sliceElements.forEach((el, i) => {
    if (el.name === ":") colonIndices.push(i)
  })

  // Build slice parts
  const parts: string[] = []
  let lastIdx = 0
  for (const colonIdx of colonIndices) {
    const beforeColon = sliceElements.slice(lastIdx, colonIdx)
    if (beforeColon.length > 0 && beforeColon[0]) {
      parts.push(transformNode(beforeColon[0], ctx))
    } else {
      parts.push("undefined")
    }
    lastIdx = colonIdx + 1
  }
  // Handle remaining after last colon
  const afterLastColon = sliceElements.slice(lastIdx)
  if (afterLastColon.length > 0 && afterLastColon[0] && afterLastColon[0].name !== ":") {
    parts.push(transformNode(afterLastColon[0], ctx))
  } else if (colonIndices.length > 0) {
    parts.push("undefined")
  }

  // If no colons, it's not a slice
  /* c8 ignore next 3 - defensive: slice detection already checked for colons */
  if (colonIndices.length === 0) {
    return `py.slice(${objCode})`
  }

  return `py.slice(${objCode}, ${parts.join(", ")})`
}

function transformArrayExpression(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  const elements = children.filter((c) => c.name !== "[" && c.name !== "]" && c.name !== ",")

  const elementCodes = elements.map((el) => transformNode(el, ctx))
  return `[${elementCodes.join(", ")}]`
}

function transformDictionaryExpression(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  const pairs: string[] = []

  // Filter out braces and commas
  const items = children.filter(
    (c) => c.name !== "{" && c.name !== "}" && c.name !== "," && c.name !== ":"
  )

  // Process key-value pairs (items come in pairs: key, value)
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
  const elements = children.filter((c) => c.name !== "(" && c.name !== ")" && c.name !== ",")

  ctx.usesRuntime.add("tuple")
  const elementCodes = elements.map((el) => transformNode(el, ctx))
  return `py.tuple(${elementCodes.join(", ")})`
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
        const condCode = transformNode(condition, ctx)
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
        const condCode = transformNode(condition, ctx)
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

  const condCode = transformNode(condition, ctx)
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
    } else if (!subject) {
      subject = child
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
      (c) => c.name !== "case" && c.name !== ":" && c.name !== "Body"
    )
    return (
      pattern &&
      (pattern.name === "SequencePattern" ||
        pattern.name === "MappingPattern" ||
        pattern.name === "ClassPattern")
    )
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

    for (const child of children) {
      if (child.name === "case" || child.name === ":") continue
      if (child.name === "Body") {
        body = child
      } else if (!pattern) {
        pattern = child
      }
    }

    if (!pattern || !body) continue

    ctx.indentLevel++
    const bodyCode = transformBody(body, ctx)
    ctx.indentLevel--

    const patternText = getNodeText(pattern, ctx.source)
    const isWildcard =
      patternText === "_" || (pattern.name === "CapturePattern" && patternText === "_")

    if (isWildcard) {
      // Wildcard/default case
      if (i === 0) {
        parts.push(`${indent}${bodyCode.trim()}`)
      } else {
        parts.push(` else {\n${indent}  ${bodyCode.trim()}\n${indent}}`)
      }
    } else {
      const { condition, bindings } = transformComplexPattern(pattern, subjectCode, ctx)

      const keyword = i === 0 ? "if" : " else if"
      const bindingsCode =
        bindings.length > 0 ? `\n${indent}  ${bindings.join(`\n${indent}  `)}` : ""

      parts.push(
        `${keyword} (${condition}) {${bindingsCode}\n${indent}  ${bodyCode.trim()}\n${indent}}`
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
    } else if (!pattern) {
      pattern = child
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
    // Single variable
    varCode = transformNode(varNodes[0], ctx)
  } else {
    // Tuple unpacking: [x, y] or [i, [a, b]]
    varCode = "[" + varNodes.map((v) => transformForLoopVar(v, ctx)).join(", ") + "]"
  }

  let iterableCode = transformNode(iterableNode, ctx)
  const bodyCode = transformBody(bodyNode, ctx)

  // Wrap plain variable names with py.iter() to handle dict iteration
  // Arrays/strings remain iterable, but dicts need Object.keys()
  if (iterableNode.name === "VariableName" && !isAsync) {
    ctx.usesRuntime.add("iter")
    iterableCode = `py.iter(${iterableCode})`
  }

  // Use 'for await' for async iteration
  const forKeyword = isAsync ? "for await" : "for"
  return `${forKeyword} (const ${varCode} of ${iterableCode}) {\n${bodyCode}\n}`
}

function transformForLoopVar(node: SyntaxNode, ctx: TransformContext): string {
  if (node.name === "VariableName") {
    return getNodeText(node, ctx.source)
  } else if (node.name === "TupleExpression") {
    // Nested tuple: (a, b) -> [a, b]
    const children = getChildren(node)
    const elements = children.filter((c) => c.name !== "(" && c.name !== ")" && c.name !== ",")
    return "[" + elements.map((e) => transformForLoopVar(e, ctx)).join(", ") + "]"
  }
  return transformNode(node, ctx)
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
      if (nextBody && nextBody.name === "Body") {
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
      if (nextBody && nextBody.name === "Body") {
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
      const catchVar = firstExcept.varName || "e"
      const catchBody = transformBody(firstExcept.body, ctx)

      if (exceptBodies.length === 1 && !firstExcept.type) {
        // Simple catch-all
        result += ` catch (${catchVar}) {\n${catchBody}\n${baseIndent}}`
      } else if (exceptBodies.length === 1) {
        // Single typed except - we still catch everything but could add instanceof check
        result += ` catch (${catchVar}) {\n${catchBody}\n${baseIndent}}`
      } else {
        // Multiple except clauses - generate if/else chain
        const innerIndent = "  ".repeat(ctx.indentLevel + 1)
        let catchBodyCode = ""
        for (let idx = 0; idx < exceptBodies.length; idx++) {
          const exc = exceptBodies[idx]
          if (!exc) continue
          const excBodyCode = transformBody(exc.body, ctx)
          const excVar = exc.varName || catchVar

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
  return mapping[pythonType] || "Error"
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

  if (hasFrom) {
    return transformFromImport(children, ctx)
  } else {
    return transformSimpleImport(children, ctx)
  }
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
      if (nextChild && nextChild.name === "as") {
        const aliasChild = children[i + 2]
        if (aliasChild && aliasChild.name === "VariableName") {
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

  // Generate import statements
  return names
    .map(({ module, alias }) => {
      const importName = alias || module
      return `import * as ${importName} from "${module}"`
    })
    .join("\n")
}

/** Modules whose imports should be ignored (type-only modules) */
const TYPING_MODULES = new Set(["typing", "typing_extensions", "collections.abc", "__future__"])

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

  // Ignore typing module imports - TypeScript has its own type system
  if (TYPING_MODULES.has(preCheckModule)) {
    return "/* typing imports removed - TypeScript has native types */"
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
        if (nextChild && nextChild.name === "as") {
          const aliasChild = children[i + 2]
          if (aliasChild && aliasChild.name === "VariableName") {
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
      modulePath += imports[0]?.name || ""
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
      const importName = imp.alias || imp.name
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
    if (child.name !== "as" && child.name !== ":" && child.name !== "VariableName") {
      const expr = child
      let varName: string | null = null

      // Check if next is 'as' followed by variable name
      const nextChild = children[i + 1]
      if (nextChild && nextChild.name === "as") {
        const varChild = children[i + 2]
        if (varChild && varChild.name === "VariableName") {
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

function transformBody(
  node: SyntaxNode,
  ctx: TransformContext,
  skipFirst: boolean = false
): string {
  ctx.indentLevel++
  pushScope(ctx) // Each block body gets its own scope
  const children = getChildren(node)
  const indent = "  ".repeat(ctx.indentLevel)

  let filteredChildren = children.filter((child) => child.name !== ":")
  if (skipFirst && filteredChildren.length > 0) {
    filteredChildren = filteredChildren.slice(1)
  }

  const statements = filteredChildren
    .map((child) => {
      const transformed = transformNode(child, ctx)
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
      funcName = getNodeText(child, ctx.source)
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
  const bodyCode = body ? transformBody(body, ctx, skipFirstStatement) : ""

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
      // Inheritance: class Child(Parent) or class Child(A, B, C)
      const argChildren = getChildren(child)
      const parentNodes = argChildren.filter((c) => c.name === "VariableName")
      for (const parentNode of parentNodes) {
        parentClasses.push(getNodeText(parentNode, ctx.source))
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

function transformClassBody(
  node: SyntaxNode,
  ctx: TransformContext,
  skipFirst: boolean = false
): string {
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
      // Class-level assignment (class attribute)
      const transformed = transformNode(child, ctx)
      members.push(indent + transformed + ";")
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

  // Transform body, replacing 'self' with 'this'
  const bodyCode = body ? transformClassMethodBody(body, ctx, skipFirstStatement) : ""

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
  }

  const methodDecl = `${indent}${prefix}${generatorStar}${methodName}(${params}) {\n${bodyCode}\n${indent}}`
  return jsdoc ? `${jsdoc}\n${methodDecl}` : methodDecl
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
      if (nextChild && nextChild.name === "VariableName") {
        const name = getNodeText(nextChild, ctx.source)
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
      if (nextChild && nextChild.name === "VariableName") {
        const name = getNodeText(nextChild, ctx.source)
        params.push(name)
        i += 2
        continue
      }
      i++
      continue
    }

    // Check for parameter with default value
    if (child.name === "VariableName") {
      const nextChild = children[i + 1]
      if (nextChild && nextChild.name === "AssignOp") {
        const defaultValChild = children[i + 2]
        if (defaultValChild) {
          const nameCode = getNodeText(child, ctx.source)
          const defaultCode = transformNode(defaultValChild, ctx)
          params.push(`${nameCode} = ${defaultCode}`)
          i += 3
          continue
        }
      }
      params.push(getNodeText(child, ctx.source))
      i++
      continue
    }

    i++
  }

  return params.join(", ")
}

function transformClassMethodBody(
  node: SyntaxNode,
  ctx: TransformContext,
  skipFirst: boolean = false
): string {
  ctx.indentLevel++
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
    .filter((s) => s.trim() !== "" && s.trim() !== "/* pass */;")

  ctx.indentLevel--
  return statements.join("\n")
}

function transformClassAssignment(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  if (children.length < 3) return getNodeText(node, ctx.source)

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
      funcName = getNodeText(child, ctx.source)
    } else if (child.name === "ParamList") {
      paramList = child
    } else if (child.name === "Body") {
      body = child
    }
  }

  const params = paramList ? transformParamList(paramList, ctx) : ""
  const bodyCode = body ? transformBody(body, ctx) : ""

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

  return `const ${funcName} = ${funcExpr}`
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
  decorators: Array<{ name: string; args: string | null }>,
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
  decorators: Array<{ name: string; args: string | null }>,
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
  const factoryMatch = text.match(/default_factory\s*=\s*(\w+)/)
  if (factoryMatch) {
    const factory = factoryMatch[1]
    if (factory === "list") return "[]"
    if (factory === "dict") return "{}"
    if (factory === "set") return "new Set()"
    // For other factories, return the factory call
    if (factory) return `${factory}()`
  }

  // Check for default= pattern
  const defaultMatch = text.match(/default\s*=\s*([^,)]+)/)
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
  const numericMembers = members.filter((m) => m.numericValue !== null)
  if (numericMembers.length !== members.length) return false

  // Check for sequential pattern
  const values = numericMembers.map((m) => m.numericValue as number)
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

function transformParamList(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  const params: string[] = []
  let restParam: string | null = null
  let kwargsParam: string | null = null
  let i = 0

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

    // Check for *args (rest parameter)
    if (child.name === "*" || getNodeText(child, ctx.source) === "*") {
      const nextChild = children[i + 1]
      if (nextChild && nextChild.name === "VariableName") {
        const name = getNodeText(nextChild, ctx.source)
        // Check for type annotation after *args
        const typeChild = children[i + 2]
        if (typeChild && typeChild.name === "TypeDef") {
          const tsType = extractTypeAnnotation(typeChild, ctx)
          restParam = tsType ? `...${name}: ${tsType}[]` : `...${name}`
          i += 3
        } else {
          restParam = `...${name}`
          i += 2
        }
        continue
      }
      i++
      continue
    }

    // Check for **kwargs - store separately to add at the end
    if (child.name === "**" || getNodeText(child, ctx.source) === "**") {
      const nextChild = children[i + 1]
      if (nextChild && nextChild.name === "VariableName") {
        const name = getNodeText(nextChild, ctx.source)
        // Store kwargs separately - it will be handled after rest param
        kwargsParam = name
        i += 2
        continue
      }
      i++
      continue
    }

    // Check for parameter: VariableName [TypeDef] [AssignOp Value]
    if (child.name === "VariableName") {
      const nameCode = getNodeText(child, ctx.source)
      let typeAnnotation = ""
      let offset = 1

      // Check for type annotation
      const nextChild = children[i + 1]
      if (nextChild && nextChild.name === "TypeDef") {
        const tsType = extractTypeAnnotation(nextChild, ctx)
        if (tsType) {
          typeAnnotation = `: ${tsType}`
        }
        offset = 2
      }

      // Check for default value
      const afterType = children[i + offset]
      if (afterType && afterType.name === "AssignOp") {
        const defaultValChild = children[i + offset + 1]
        if (defaultValChild) {
          const defaultCode = transformNode(defaultValChild, ctx)
          params.push(`${nameCode}${typeAnnotation} = ${defaultCode}`)
          i += offset + 2
          continue
        }
      }

      // Parameter without default
      params.push(`${nameCode}${typeAnnotation}`)
      i += offset
      continue
    }

    // Parameter with default value wrapped in a node (legacy handling)
    if (child.name === "AssignParam" || child.name === "DefaultParam") {
      const paramChildren = getChildren(child)
      const name = paramChildren.find((c) => c.name === "VariableName")
      const typeDef = paramChildren.find((c) => c.name === "TypeDef")
      const defaultVal = paramChildren[paramChildren.length - 1]

      if (name) {
        const nameCode = getNodeText(name, ctx.source)
        const tsType = extractTypeAnnotation(typeDef, ctx)
        const typeAnnotation = tsType ? `: ${tsType}` : ""

        if (defaultVal && name !== defaultVal && defaultVal.name !== "TypeDef") {
          const defaultCode = transformNode(defaultVal, ctx)
          params.push(`${nameCode}${typeAnnotation} = ${defaultCode}`)
        } else {
          params.push(`${nameCode}${typeAnnotation}`)
        }
      }
      i++
      continue
    }

    i++
  }

  // Add kwargs parameter before rest param if no rest param exists
  // If both exist, kwargs is not supported (rest param must be last in JS)
  if (kwargsParam && !restParam) {
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
      // for variable in iterable
      const varNode = items[i + 1]
      // Skip 'in' keyword
      const iterableNode = items[i + 3]

      if (varNode && iterableNode) {
        clauses.push({
          type: "for",
          variable: transformNode(varNode, ctx),
          iterable: transformNode(iterableNode, ctx)
        })
        i += 4
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
      const varNode = clauseItems[i + 1]
      const iterableNode = clauseItems[i + 3]

      if (varNode && iterableNode) {
        clauses.push({
          type: "for",
          variable: transformNode(varNode, ctx),
          iterable: transformNode(iterableNode, ctx)
        })
        i += 4
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
  return `py.set([${elementCodes.join(", ")}])`
}

function transformSetComprehension(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  const { outputExpr, clauses } = parseComprehensionClauses(children, ctx)

  if (clauses.length === 0) {
    ctx.usesRuntime.add("set")
    return `py.set([${outputExpr}])`
  }

  ctx.usesRuntime.add("set")
  const arrayComp = buildComprehensionChain(outputExpr, clauses, "array")
  return `py.set(${arrayComp})`
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
    iterable.startsWith("py.range(") ||
    iterable.startsWith("py.enumerate(") ||
    iterable.startsWith("py.zip(") ||
    iterable.startsWith("py.reversed(") ||
    iterable.startsWith("py.filter(") ||
    iterable.startsWith("py.map(")
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
    return `py.dict([[${keyExpr}, ${valueExpr}]])`
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
    return `py.dict([[${keyExpr}, ${valueExpr}]])`
  }

  const pairExpr = `[${keyExpr}, ${valueExpr}]`
  const arrayComp = buildComprehensionChain(pairExpr, clauses, "array")

  return `py.dict(${arrayComp})`
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
        // del obj.attr
        return `delete ${transformNode(target, ctx)}`
      }
    } else if (target.name === "VariableName") {
      // del variable - not really possible in JS strict mode
      // Convert to setting undefined
      const varName = getNodeText(target, ctx.source)
      return `${varName} = undefined`
    }
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
  return "yield"
}

export { transformNode, createContext }

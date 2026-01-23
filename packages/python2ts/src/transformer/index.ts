import type { SyntaxNode } from "@lezer/common"
import { getNodeText, getChildren, parse, type ParseResult } from "../parser/index.js"
import { toJsName } from "./name-mappings.js"
import {
  createContext,
  escapeReservedKeyword,
  isVariableDeclared,
  declareVariable,
  PYTHON_TO_TS_TYPES
} from "./context.js"
import type { TransformContext, TransformResult } from "./types.js"
import {
  isDocstringNode,
  extractDocstringContent,
  parseDocstring,
  toJSDoc,
  extractDocstringFromBody
} from "./handlers/docstrings.js"
import {
  transformNumber,
  transformString,
  transformFormatString,
  transformContinuedString,
  transformBoolean
} from "./handlers/literals.js"
import {
  transformBinaryExpression,
  transformUnaryExpression,
  transformParenthesizedExpression,
  transformNamedExpression,
  transformConditionalExpression
} from "./handlers/expressions.js"
import { handleBuiltinCall } from "./builtins/call-handlers.js"
import {
  transformUpdateStatement,
  isSliceExpression,
  transformSliceAssignment,
  transformAssignTarget,
  extractVariableNames,
  transformValuesWithSpread,
  transformDeleteStatement
} from "./handlers/assignments.js"
import {
  transformBody,
  transformIfStatement,
  transformWhileStatement,
  transformForStatement,
  transformReturnStatement
} from "./handlers/control-flow.js"
import {
  transformTryStatement,
  transformRaiseStatement,
  transformAssertStatement
} from "./handlers/exceptions.js"
import { transformImportStatement } from "./handlers/imports.js"
import {
  extractParamNames,
  transformAwaitExpression,
  transformWithStatement,
  transformParamList,
  transformLambdaExpression,
  transformYieldStatement,
  transformFunctionDefinition
} from "./handlers/functions.js"
import {
  transformArrayComprehension,
  transformDictComprehension,
  transformSetExpression,
  transformSetComprehension,
  transformGeneratorExpression,
  parseComprehensionClauses as parseComprehensionClausesImpl,
  buildGeneratorChain
} from "./handlers/comprehensions.js"
import {
  transformEnum as transformEnumImpl,
  extractGenericParams,
  checkTypedDictTotalFalse,
  transformClassBody as transformClassBodyImpl,
  transformNamedTuple as transformNamedTupleImpl,
  transformTypedDict as transformTypedDictImpl,
  transformAbstractClass as transformAbstractClassImpl,
  transformProtocol as transformProtocolImpl,
  transformGenericClass as transformGenericClassImpl,
  transformDecoratedClass as transformDecoratedClassImpl
} from "./handlers/classes.js"

// Re-export types for public API
export type { TransformContext, TransformResult } from "./types.js"

// Wrapper functions for imported handlers that need additional parameters
// These are defined as function declarations to enable hoisting (referenced before transformNode is defined)

function parseComprehensionClauses(children: SyntaxNode[], ctx: TransformContext) {
  return parseComprehensionClausesImpl(children, ctx, transformNode)
}

function transformParamListLocal(node: SyntaxNode, ctx: TransformContext): string {
  return transformParamList(node, ctx, transformNode, extractTypeAnnotation)
}

function transformAwaitExpressionLocal(node: SyntaxNode, ctx: TransformContext): string {
  return transformAwaitExpression(node, ctx, transformNode)
}

function transformWithStatementLocal(node: SyntaxNode, ctx: TransformContext): string {
  return transformWithStatement(node, ctx, transformNode)
}

function transformLambdaExpressionLocal(node: SyntaxNode, ctx: TransformContext): string {
  return transformLambdaExpression(node, ctx, transformNode, transformParamListLocal)
}

function transformYieldStatementLocal(node: SyntaxNode, ctx: TransformContext): string {
  return transformYieldStatement(node, ctx, transformNode)
}

function transformFunctionDefinitionLocal(node: SyntaxNode, ctx: TransformContext): string {
  return transformFunctionDefinition(
    node,
    ctx,
    transformNode,
    transformParamListLocal,
    transformPythonType
  )
}

function transformArrayComprehensionLocal(node: SyntaxNode, ctx: TransformContext): string {
  return transformArrayComprehension(node, ctx, transformNode)
}

function transformDictComprehensionLocal(node: SyntaxNode, ctx: TransformContext): string {
  return transformDictComprehension(node, ctx, transformNode)
}

function transformSetExpressionLocal(node: SyntaxNode, ctx: TransformContext): string {
  return transformSetExpression(node, ctx, transformNode)
}

function transformSetComprehensionLocal(node: SyntaxNode, ctx: TransformContext): string {
  return transformSetComprehension(node, ctx, transformNode)
}

function transformGeneratorExpressionLocal(node: SyntaxNode, ctx: TransformContext): string {
  return transformGeneratorExpression(node, ctx, transformNode)
}

// Class handler wrappers
function transformEnum(
  className: string,
  enumType: string,
  body: SyntaxNode | null,
  ctx: TransformContext
): string {
  return transformEnumImpl(className, enumType, body, ctx)
}

function transformClassBody(node: SyntaxNode, ctx: TransformContext, skipFirst = false): string {
  return transformClassBodyImpl(
    node,
    ctx,
    skipFirst,
    transformNode,
    extractTypeAnnotation,
    extractTypeModifiers
  )
}

function transformNamedTuple(
  className: string,
  body: SyntaxNode | null,
  ctx: TransformContext
): string {
  return transformNamedTupleImpl(className, body, ctx, transformNode, extractTypeAnnotation)
}

function transformTypedDict(
  className: string,
  body: SyntaxNode | null,
  totalFalse: boolean,
  ctx: TransformContext
): string {
  return transformTypedDictImpl(
    className,
    body,
    totalFalse,
    ctx,
    transformNode,
    extractTypeAnnotation
  )
}

function transformAbstractClass(
  className: string,
  parentClasses: string[],
  body: SyntaxNode | null,
  ctx: TransformContext,
  jsdoc: string | null
): string {
  return transformAbstractClassImpl(
    className,
    parentClasses,
    body,
    ctx,
    jsdoc,
    transformNode,
    extractTypeAnnotation,
    extractTypeModifiers
  )
}

function transformProtocol(
  className: string,
  parentClasses: string[],
  body: SyntaxNode | null,
  ctx: TransformContext
): string {
  return transformProtocolImpl(
    className,
    parentClasses,
    body,
    ctx,
    transformNode,
    extractTypeAnnotation
  )
}

function transformGenericClass(
  className: string,
  genericParams: string[],
  parentClasses: string[],
  body: SyntaxNode | null,
  ctx: TransformContext,
  jsdoc: string | null
): string {
  return transformGenericClassImpl(
    className,
    genericParams,
    parentClasses,
    body,
    ctx,
    jsdoc,
    transformNode,
    extractTypeAnnotation,
    extractTypeModifiers
  )
}

function transformDecoratedClass(
  classDef: SyntaxNode,
  decorators: { name: string; args: string | null }[],
  ctx: TransformContext
): string {
  return transformDecoratedClassImpl(
    classDef,
    decorators,
    ctx,
    transformNode,
    extractTypeAnnotation,
    transformClassDefinition
  )
}

// Helper for extracting return type from function definition (used by @overload handling)
function extractMethodReturnType(node: SyntaxNode, ctx: TransformContext): string | null {
  const children = getChildren(node)
  for (const child of children) {
    if (child.name === "TypeDef") {
      return extractTypeAnnotation(child, ctx)
    }
  }
  return null
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
      return transformUpdateStatement(node, ctx, transformNode)
    case "BinaryExpression":
      return transformBinaryExpression(node, ctx, transformNode)
    case "UnaryExpression":
      return transformUnaryExpression(node, ctx, transformNode)
    case "ParenthesizedExpression":
      return transformParenthesizedExpression(node, ctx, transformNode)
    case "NamedExpression":
      return transformNamedExpression(node, ctx, transformNode)
    case "ConditionalExpression":
      return transformConditionalExpression(node, ctx, transformNode)
    case "Number":
      return transformNumber(node, ctx)
    case "String":
      return transformString(node, ctx)
    case "FormatString":
      return transformFormatString(node, ctx, transformNode)
    case "ContinuedString":
      return transformContinuedString(node, ctx, transformNode)
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
      return transformArrayComprehensionLocal(node, ctx)
    case "DictionaryExpression":
      return transformDictionaryExpression(node, ctx)
    case "DictionaryComprehensionExpression":
      return transformDictComprehensionLocal(node, ctx)
    case "SetExpression":
      return transformSetExpressionLocal(node, ctx)
    case "SetComprehensionExpression":
      return transformSetComprehensionLocal(node, ctx)
    case "ComprehensionExpression":
      return transformGeneratorExpressionLocal(node, ctx)
    case "TupleExpression":
      return transformTupleExpression(node, ctx)
    case "IfStatement":
      return transformIfStatement(node, ctx, transformNode)
    case "WhileStatement":
      return transformWhileStatement(node, ctx, transformNode)
    case "ForStatement":
      return transformForStatement(node, ctx, transformNode)
    case "PassStatement":
      return ""
    case "BreakStatement":
      return "break"
    case "ContinueStatement":
      return "continue"
    case "ReturnStatement":
      return transformReturnStatement(node, ctx, transformNode)
    case "FunctionDefinition":
      return transformFunctionDefinitionLocal(node, ctx)
    case "ClassDefinition":
      return transformClassDefinition(node, ctx)
    case "DecoratedStatement":
      return transformDecoratedStatement(node, ctx)
    case "LambdaExpression":
      return transformLambdaExpressionLocal(node, ctx)
    case "Comment":
      return transformComment(node, ctx)
    case "TryStatement":
      return transformTryStatement(node, ctx, transformNode)
    case "RaiseStatement":
      return transformRaiseStatement(node, ctx, transformNode)
    case "ImportStatement":
      return transformImportStatement(node, ctx)
    case "AwaitExpression":
      return transformAwaitExpressionLocal(node, ctx)
    case "WithStatement":
      return transformWithStatementLocal(node, ctx)
    case "MatchStatement":
      return transformMatchStatement(node, ctx)
    case "ScopeStatement":
      return transformScopeStatement(node, ctx)
    case "DeleteStatement":
      return transformDeleteStatement(node, ctx, transformNode)
    case "AssertStatement":
      return transformAssertStatement(node, ctx, transformNode)
    case "YieldStatement":
      return transformYieldStatementLocal(node, ctx)
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
      return transformSliceAssignment(target, values, ctx, transformNode)
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
      const valuesCodes = transformValuesWithSpread(values, ctx, transformNode)
      if (needsDeclaration) {
        return `${declarationKeyword} ${targetCode}${typeAnnotation} = [${valuesCodes.join(", ")}]`
      }
      return `${targetCode} = [${valuesCodes.join(", ")}]`
    }
  }

  // Multiple target assignment (destructuring)
  const targetCodes = targets.map((t) => transformAssignTarget(t, ctx, transformNode))
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
    const valuesCodes = transformValuesWithSpread(values, ctx, transformNode)
    return allDeclaredAtAccessibleScope
      ? `${targetPattern} = [${valuesCodes.join(", ")}]`
      : `let ${targetPattern} = [${valuesCodes.join(", ")}]`
  }
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

  // Check builtin functions using handler registry
  const builtinResult = handleBuiltinCall(calleeName, args, argList, ctx, transformNode)
  if (builtinResult !== null) {
    return builtinResult
  }

  // Regular function call
  return `${transformNode(callee, ctx)}(${args})`
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
    // Skip if objCode is 'self' or 'this' - user-defined class, not a Hash object
    case "digest":
      if (objCode === "self" || objCode === "this") return null
      return `await ${objCode}.digest()`
    case "hexdigest":
      if (objCode === "self" || objCode === "this") return null
      return `await ${objCode}.hexdigest()`

    // Path object methods (pathlib) - async
    // Only handle snake_case methods that are unique to Path
    // Skip if objCode is 'self' or 'this' - user-defined class, not a Path object
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
      if (objCode === "self" || objCode === "this") {
        return null // Let caller handle user-defined class methods
      }
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
  // Filter out parentheses, nested ArgList, and Comments (inline comments break single-line output)
  const items = children.filter(
    (c) => c.name !== "(" && c.name !== ")" && c.name !== "ArgList" && c.name !== "Comment"
  )

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
      return parseSliceDimensionForSubscript(dimElements, ctx)
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
function parseSliceDimensionForSubscript(elements: SyntaxNode[], ctx: TransformContext): string {
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

    // Skip brackets, commas, and comments (inline comments break single-line output)
    if (
      child.name === "[" ||
      child.name === "]" ||
      child.name === "," ||
      child.name === "Comment"
    ) {
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

  // Filter out braces, commas, and comments (inline comments break single-line output)
  const items = children.filter(
    (c) =>
      c.name !== "{" && c.name !== "}" && c.name !== "," && c.name !== ":" && c.name !== "Comment"
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
    const bodyCode = transformBody(body, ctx, transformNode)
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
  const bodyCode = transformBody(body, ctx, transformNode)
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
    // Check for both "ABC" (from abc import ABC) and "abc.ABC" (import abc)
    const isAbcClass =
      firstParent === "ABC" ||
      firstParent === "abc.ABC" ||
      parentClasses.includes("ABC") ||
      parentClasses.includes("abc.ABC")
    if (isAbcClass) {
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

  const params = paramList ? transformParamListLocal(paramList, ctx) : ""
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
  const bodyCode = body
    ? transformBody(body, ctx, transformNode, skipFirstStatement, paramNames)
    : ""
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

function transformComment(node: SyntaxNode, ctx: TransformContext): string {
  const text = getNodeText(node, ctx.source)
  // Convert Python comment to JS comment
  return "//" + text.slice(1)
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

export { transformNode, createContext }

import type { SyntaxNode } from "@lezer/common"
import { getNodeText, getChildren } from "../../parser/index.js"
import type { TransformContext, NodeTransformer } from "../types.js"
import {
  escapeReservedKeyword,
  pushScope,
  popScope,
  declareVariable,
  stripOuterParens
} from "../context.js"

/**
 * Transform the body of a block (function, if, while, for, etc.).
 */
export function transformBody(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer,
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

/**
 * Transform Python if/elif/else statement to JavaScript.
 */
export function transformIfStatement(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
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
        const bodyCode = transformBody(body, ctx, transformNode)
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
        const bodyCode = transformBody(body, ctx, transformNode)
        parts.push(` else if (${condCode}) {\n${bodyCode}\n}`)
      }
    } else if (
      child.name === "else" ||
      (child.name === "Keyword" && getNodeText(child, ctx.source) === "else")
    ) {
      const body = children.find((c, idx) => idx > i && c.name === "Body")

      if (body) {
        const bodyCode = transformBody(body, ctx, transformNode)
        parts.push(` else {\n${bodyCode}\n}`)
      }
    }
    i++
  }

  return parts.join("")
}

/**
 * Transform Python while statement to JavaScript.
 */
export function transformWhileStatement(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
  const children = getChildren(node)
  const condition = children.find(
    (c) => c.name !== "while" && c.name !== "Body" && c.name !== "Keyword" && c.name !== ":"
  )
  const body = children.find((c) => c.name === "Body")

  if (!condition || !body) return getNodeText(node, ctx.source)

  const condCode = stripOuterParens(transformNode(condition, ctx))
  const bodyCode = transformBody(body, ctx, transformNode)

  return `while (${condCode}) {\n${bodyCode}\n}`
}

/**
 * Transform Python for/for-else statement to JavaScript.
 */
export function transformForStatement(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
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
  const bodyCode = transformBody(bodyNode, ctx, transformNode)

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

/**
 * Transform a for-loop variable, handling nested tuples.
 * Also used by comprehension transformers.
 */
export function transformForLoopVar(node: SyntaxNode, ctx: TransformContext): string {
  if (node.name === "VariableName") {
    // Escape reserved keywords in destructuring patterns
    return escapeReservedKeyword(getNodeText(node, ctx.source))
  } else if (node.name === "TupleExpression") {
    // Nested tuple: (a, b) -> [a, b]
    const children = getChildren(node)
    const elements = children.filter((c) => c.name !== "(" && c.name !== ")" && c.name !== ",")
    return "[" + elements.map((e) => transformForLoopVar(e, ctx)).join(", ") + "]"
  }
  return getNodeText(node, ctx.source)
}

/**
 * Extract all variable names from for-loop variable nodes.
 * Handles simple variables and nested tuple unpacking.
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

/**
 * Transform Python return statement to JavaScript.
 */
export function transformReturnStatement(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
  const children = getChildren(node)
  const value = children.find((c) => c.name !== "return" && c.name !== "Keyword")

  if (!value) {
    return "return"
  }

  return `return ${transformNode(value, ctx)}`
}

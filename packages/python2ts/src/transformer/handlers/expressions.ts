import type { SyntaxNode } from "@lezer/common"
import { getNodeText, getChildren } from "../../parser/index.js"
import type { TransformContext, NodeTransformer } from "../types.js"
import { stripOuterParens } from "../context.js"

// Helper functions for node type checking
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

function extractRightOperand(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
  // Extract the right operand from a BinaryExpression
  const children = getChildren(node)
  const right = children[2]
  if (!right) return ""
  return transformNode(right, ctx)
}

/**
 * Transform Python binary expressions to JavaScript.
 * Handles operators like //, **, %, and, or, in, is, etc.
 */
export function transformBinaryExpression(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
  const children = getChildren(node)
  if (children.length < 3) return getNodeText(node, ctx.source)

  const left = children[0]
  const op = children[1]

  if (!left || !op) return getNodeText(node, ctx.source)

  const opText = getNodeText(op, ctx.source)

  // Handle scientific notation parsed incorrectly: 1.e-5 -> MemberExpression(1, e) - 5
  // Pattern: MemberExpression(Number, ".", "e"|"E") +|- Number
  if ((opText === "-" || opText === "+") && left.name === "MemberExpression") {
    const memberChildren = getChildren(left)
    const numNode = memberChildren.find((c) => c.name === "Number")
    const propNode = memberChildren.find((c) => c.name === "PropertyName")
    const right = children[2]
    if (numNode && propNode && right?.name === "Number") {
      const propName = getNodeText(propNode, ctx.source).toLowerCase()
      if (propName === "e") {
        // This is scientific notation: 1.e-5 -> 1e-5
        const numText = getNodeText(numNode, ctx.source)
        const expText = getNodeText(right, ctx.source)
        return `${numText}e${opText}${expText}`
      }
    }
  }

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
    const middleValue = extractRightOperand(left, ctx, transformNode)
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

/**
 * Transform Python unary expressions to JavaScript.
 */
export function transformUnaryExpression(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
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

/**
 * Transform parenthesized expressions.
 */
export function transformParenthesizedExpression(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
  const children = getChildren(node)
  const inner = children.find((c) => c.name !== "(" && c.name !== ")")
  if (!inner) return "()"
  return `(${transformNode(inner, ctx)})`
}

/**
 * Transform Python walrus operator (:=) to JavaScript assignment.
 */
export function transformNamedExpression(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
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

/**
 * Transform Python ternary expression to JavaScript.
 * Python: value_if_true if condition else value_if_false
 * JS: condition ? value_if_true : value_if_false
 */
export function transformConditionalExpression(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
  const children = getChildren(node)
  // Python: value_if_true if condition else value_if_false
  // Format: TrueExpr 'if' Condition 'else' FalseExpr
  // Filter out keywords and comments (inline comments break single-line output)
  const exprs = children.filter(
    (c) => c.name !== "if" && c.name !== "else" && c.name !== "Keyword" && c.name !== "Comment"
  )

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

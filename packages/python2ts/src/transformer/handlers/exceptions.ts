import type { SyntaxNode } from "@lezer/common"
import { getNodeText, getChildren } from "../../parser/index.js"
import type { TransformContext, NodeTransformer } from "../types.js"
import { transformBody } from "./control-flow.js"

/**
 * Map Python exception types to JavaScript equivalents.
 */
function mapExceptionType(pythonType: string): string {
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

/**
 * Check if a name is a Python exception type.
 */
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

/**
 * Transform Python try/except/finally statement to JavaScript.
 */
export function transformTryStatement(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
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
  // Mark that we're inside a try block (imports need special handling)
  ctx.insideTryBlock++
  const tryCode = transformBody(tryBody, ctx, transformNode)
  ctx.insideTryBlock--
  let result = `try {\n${tryCode}\n${baseIndent}}`

  // Transform except clauses to catch
  if (exceptBodies.length > 0) {
    const firstExcept = exceptBodies[0]
    if (firstExcept) {
      const catchVar = firstExcept.varName ?? "e"
      let catchBody = transformBody(firstExcept.body, ctx, transformNode)
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
          const excBodyCode = transformBody(exc.body, ctx, transformNode)
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
    const finallyCode = transformBody(finallyBody, ctx, transformNode)
    result += ` finally {\n${finallyCode}\n${baseIndent}}`
  }

  return result
}

/**
 * Transform Python raise statement to JavaScript throw.
 */
export function transformRaiseStatement(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
  const children = getChildren(node)

  // Find the expression after 'raise'
  const exprNode = children.find((c) => c.name !== "raise")

  if (!exprNode) {
    // raise without argument - re-throw the current exception
    // In JS, we need to throw something, so use 'e' (the default catch variable name)
    return "throw e"
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

/**
 * Transform Python assert statement to JavaScript.
 */
export function transformAssertStatement(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
  const children = getChildren(node)
  // Find the condition (first expression after 'assert')
  const expressions = children.filter((c) => c.name !== "assert" && c.name !== ",")

  const condition = expressions[0]
  const message = expressions[1]

  const conditionCode = condition ? transformNode(condition, ctx) : "true"
  const messageCode = message ? transformNode(message, ctx) : '"Assertion failed"'

  return `if (!(${conditionCode})) throw new Error(${messageCode})`
}

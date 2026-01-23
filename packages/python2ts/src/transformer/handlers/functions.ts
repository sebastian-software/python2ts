import type { SyntaxNode } from "@lezer/common"
import { getNodeText, getChildren } from "../../parser/index.js"
import type { TransformContext, NodeTransformer } from "../types.js"
import { escapeReservedKeyword } from "../context.js"
import { transformBody } from "./control-flow.js"
import { extractDocstringFromBody } from "./docstrings.js"

/**
 * Check if a function body contains yield statements.
 * Used to determine if a function is a generator.
 */
export function containsYield(node: SyntaxNode): boolean {
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

/**
 * Extract parameter names from a ParamList node for scope tracking
 */
export function extractParamNames(node: SyntaxNode, source: string): string[] {
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

/**
 * Transform Python await expression to JavaScript.
 */
export function transformAwaitExpression(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
  const children = getChildren(node)

  // Find the expression after 'await'
  const exprNode = children.find((c) => c.name !== "await")

  if (!exprNode) {
    return "await"
  }

  return `await ${transformNode(exprNode, ctx)}`
}

/**
 * Transform Python with statement to JavaScript try/finally.
 */
export function transformWithStatement(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
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
  const bodyCode = transformBody(body, ctx, transformNode)

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

interface ParsedParam {
  name: string
  type: string | null
  defaultValue: string | null
}

/**
 * Transform Python parameter list to TypeScript.
 */
export function transformParamList(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer,
  extractTypeAnnotation: (typeDef: SyntaxNode | undefined, ctx: TransformContext) => string | null
): string {
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

/**
 * Transform Python lambda expression to JavaScript arrow function.
 */
export function transformLambdaExpression(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer,
  transformParamListFn: (node: SyntaxNode, ctx: TransformContext) => string
): string {
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
        params = transformParamListFn(child, ctx)
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

/**
 * Transform Python yield statement to JavaScript.
 * Handles both `yield expr` and `yield from expr`.
 */
export function transformYieldStatement(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
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

/**
 * Transform Python function definition to JavaScript.
 * Handles async functions, generators, docstrings, and type annotations.
 */
export function transformFunctionDefinition(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer,
  transformParamListFn: (node: SyntaxNode, ctx: TransformContext) => string,
  transformPythonType: (node: SyntaxNode, ctx: TransformContext) => string
): string {
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

  const params = paramList ? transformParamListFn(paramList, ctx) : ""
  // Extract parameter names to pre-declare them in the function body scope
  const paramNames = paramList ? extractParamNames(paramList, ctx.source) : []
  // Track that we're inside a function body for import hoisting
  ctx.insideFunctionBody++
  const bodyCode = body
    ? transformBody(body, ctx, transformNode, skipFirstStatement, paramNames)
    : ""
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

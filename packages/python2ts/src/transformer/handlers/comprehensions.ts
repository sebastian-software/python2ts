import type { SyntaxNode } from "@lezer/common"
import { getNodeText, getChildren } from "../../parser/index.js"
import type { TransformContext, NodeTransformer } from "../types.js"
import { transformForLoopVar } from "./control-flow.js"

export interface ComprehensionClause {
  type: "for" | "if"
  variable?: string
  iterable?: string
  condition?: string
}

/**
 * Parse comprehension clauses from children nodes.
 */
export function parseComprehensionClauses(
  children: SyntaxNode[],
  ctx: TransformContext,
  transformNode: NodeTransformer
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

/**
 * Build generator expression from clauses.
 */
export function buildGeneratorChain(outputExpr: string, clauses: ComprehensionClause[]): string {
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
 * Build array/generator comprehension chain.
 */
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

/**
 * Build dict comprehension chain.
 */
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

/**
 * Transform Python list comprehension to JavaScript.
 */
export function transformArrayComprehension(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
  const children = getChildren(node)
  const { outputExpr, clauses } = parseComprehensionClauses(children, ctx, transformNode)

  if (clauses.length === 0) {
    return `[${outputExpr}]`
  }

  // Build the comprehension from inside out
  // [expr for x in items if cond] -> items.filter(x => cond).map(x => expr)
  // [expr for x in a for y in b] -> a.flatMap(x => b.map(y => expr))

  return buildComprehensionChain(outputExpr, clauses, "array")
}

/**
 * Transform Python dict comprehension to JavaScript.
 */
export function transformDictComprehension(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
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

/**
 * Transform Python set literal to JavaScript.
 */
export function transformSetExpression(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
  const children = getChildren(node)
  // Filter out braces, commas, and comments (inline comments break single-line output)
  const elements = children.filter(
    (c) => c.name !== "{" && c.name !== "}" && c.name !== "," && c.name !== "Comment"
  )

  ctx.usesRuntime.add("set")
  const elementCodes = elements.map((el) => transformNode(el, ctx))
  return `set([${elementCodes.join(", ")}])`
}

/**
 * Transform Python set comprehension to JavaScript.
 */
export function transformSetComprehension(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
  const children = getChildren(node)
  const { outputExpr, clauses } = parseComprehensionClauses(children, ctx, transformNode)

  if (clauses.length === 0) {
    ctx.usesRuntime.add("set")
    return `set([${outputExpr}])`
  }

  ctx.usesRuntime.add("set")
  const arrayComp = buildComprehensionChain(outputExpr, clauses, "array")
  return `set(${arrayComp})`
}

/**
 * Transform Python generator expression to JavaScript.
 */
export function transformGeneratorExpression(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
  const children = getChildren(node)
  // Filter out parentheses
  const items = children.filter((c) => c.name !== "(" && c.name !== ")")
  const { outputExpr, clauses } = parseComprehensionClauses(items, ctx, transformNode)

  if (clauses.length === 0) {
    return outputExpr
  }

  // Build generator function: (function*() { for (const x of items) if (cond) yield expr })()
  return buildGeneratorChain(outputExpr, clauses)
}

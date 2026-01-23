import type { SyntaxNode } from "@lezer/common"
import { getNodeText, getChildren } from "../../parser/index.js"
import type { TransformContext, NodeTransformer } from "../types.js"
import { escapeReservedKeyword } from "../context.js"

/**
 * Transform Python's augmented assignment statement: x += value
 */
export function transformUpdateStatement(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
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
export function isSliceExpression(node: SyntaxNode): boolean {
  const children = getChildren(node)
  // Look for a colon inside the brackets
  return children.some((c) => c.name === ":")
}

/**
 * Parse a single slice dimension like [:], [1:3], [::2], [1:3:2]
 */
export function parseSliceDimension(
  parts: SyntaxNode[],
  ctx: TransformContext,
  transformNode: NodeTransformer
): { start?: string | undefined; end?: string | undefined; step?: string | undefined } {
  const colonIndices: number[] = []
  for (let i = 0; i < parts.length; i++) {
    if (parts[i]?.name === ":") {
      colonIndices.push(i)
    }
  }

  if (colonIndices.length === 0) {
    return {}
  }

  let start: string | undefined
  let end: string | undefined
  let step: string | undefined

  // Parts before first colon = start
  const firstColon = colonIndices[0] ?? 0
  const beforeFirst = parts.slice(0, firstColon)
  if (beforeFirst.length > 0 && beforeFirst[0]?.name !== ":") {
    start = beforeFirst.map((n) => transformNode(n, ctx)).join("")
  }

  const secondColon = colonIndices[1]

  if (colonIndices.length === 1) {
    // [start:end]
    const afterFirst = parts.slice(firstColon + 1)
    if (afterFirst.length > 0) {
      end = afterFirst.map((n) => transformNode(n, ctx)).join("")
    }
  } else if (secondColon !== undefined) {
    // [start:end:step]
    const betweenColons = parts.slice(firstColon + 1, secondColon)
    if (betweenColons.length > 0) {
      end = betweenColons.map((n) => transformNode(n, ctx)).join("")
    }
    const afterSecond = parts.slice(secondColon + 1)
    if (afterSecond.length > 0) {
      step = afterSecond.map((n) => transformNode(n, ctx)).join("")
    }
  }

  return { start, end, step }
}

/**
 * Transform a slice assignment: arr[1:3] = values -> py.list.sliceAssign(arr, 1, 3, undefined, values)
 * For multi-dimensional slices: arr[:, 0] = values -> py.ndarray.set(arr, [slice(undefined, undefined), 0], values)
 */
export function transformSliceAssignment(
  target: SyntaxNode,
  values: SyntaxNode[],
  ctx: TransformContext,
  transformNode: NodeTransformer
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

  // Check if this is multi-dimensional (has comma)
  const hasComma = sliceParts.some((p) => p.name === ",")

  // Transform the values
  const firstValue = values[0]
  const valuesCode =
    values.length === 1 && firstValue
      ? transformNode(firstValue, ctx)
      : `[${values.map((v) => transformNode(v, ctx)).join(", ")}]`

  if (hasComma) {
    // Multi-dimensional slicing: arr[:, 0] = value
    // Split by commas to get each dimension
    const dimensions: SyntaxNode[][] = []
    let currentDim: SyntaxNode[] = []

    for (const part of sliceParts) {
      if (part.name === ",") {
        dimensions.push(currentDim)
        currentDim = []
      } else {
        currentDim.push(part)
      }
    }
    dimensions.push(currentDim)

    // Transform each dimension to either a slice or an index
    const dimCodes = dimensions.map((dim) => {
      const hasColon = dim.some((p) => p.name === ":")
      if (hasColon) {
        // This is a slice
        const { start, end, step } = parseSliceDimension(dim, ctx, transformNode)
        return `ndarray.slice(${start ?? "undefined"}, ${end ?? "undefined"}${step ? `, ${step}` : ""})`
      } else {
        // This is an index
        const indexParts = dim.filter((p) => p.name !== ":" && p.name !== ",")
        if (indexParts.length > 0 && indexParts[0]) {
          return transformNode(indexParts[0], ctx)
        }
        return "undefined"
      }
    })

    ctx.usesRuntime.add("ndarray.set")

    return `ndarray.set(${objCode}, [${dimCodes.join(", ")}], ${valuesCode})`
  }

  // 1D slice: parse the slice notation
  // Possible patterns: [a:b], [:b], [a:], [:], [a:b:c], [::c], etc.
  const { start, end, step } = parseSliceDimension(sliceParts, ctx, transformNode)

  ctx.usesRuntime.add("list.sliceAssign")

  return `list.sliceAssign(${objCode}, ${start ?? "undefined"}, ${end ?? "undefined"}, ${step ?? "undefined"}, ${valuesCode})`
}

/**
 * Transform an assignment target, handling nested destructuring.
 */
export function transformAssignTarget(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
  if (node.name === "VariableName") {
    // Escape reserved keywords in destructuring patterns
    return escapeReservedKeyword(getNodeText(node, ctx.source))
  } else if (node.name === "TupleExpression") {
    // Nested destructuring: (a, b) -> [a, b]
    const children = getChildren(node)
    const elements = children.filter((c) => c.name !== "(" && c.name !== ")" && c.name !== ",")
    return "[" + elements.map((e) => transformAssignTarget(e, ctx, transformNode)).join(", ") + "]"
  }
  return transformNode(node, ctx)
}

/**
 * Extract variable names from assignment targets (for scope tracking).
 */
export function extractVariableNames(nodes: SyntaxNode[], source: string): string[] {
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
 * Transform a list of value nodes, handling spread operators (* -> ...)
 * For assignments like: shape = *arr, 3 -> shape = [...arr, 3]
 */
export function transformValuesWithSpread(
  values: SyntaxNode[],
  ctx: TransformContext,
  transformNode: NodeTransformer
): string[] {
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

/**
 * Transform Python delete statement.
 */
export function transformDeleteStatement(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
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

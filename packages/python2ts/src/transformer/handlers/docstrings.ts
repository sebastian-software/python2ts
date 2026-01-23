import type { SyntaxNode } from "@lezer/common"
import { getNodeText, getChildren } from "../../parser/index.js"
import type { TransformContext, ParsedDocstring } from "../types.js"

/**
 * Check if a node is a docstring (ExpressionStatement containing a String)
 */
export function isDocstringNode(node: SyntaxNode, ctx: TransformContext): boolean {
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
export function extractDocstringContent(node: SyntaxNode, ctx: TransformContext): string {
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
export function parseDocstring(content: string): ParsedDocstring {
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
export function toJSDoc(parsed: ParsedDocstring, indent: string): string {
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
export function extractDocstringFromBody(
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

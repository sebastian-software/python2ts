import type { SyntaxNode } from "@lezer/common"
import { getNodeText, getChildren } from "../../parser/index.js"
import type { TransformContext, NodeTransformer } from "../types.js"

/**
 * Transform Python number literals to JavaScript.
 * Handles Python's underscore separators (1_000_000).
 */
export function transformNumber(node: SyntaxNode, ctx: TransformContext): string {
  const text = getNodeText(node, ctx.source)
  // Handle Python numeric literals
  // Remove underscores (Python allows 1_000_000)
  return text.replace(/_/g, "")
}

/**
 * Transform Python string literals to JavaScript.
 * Handles byte strings (b""), raw strings (r""), unicode strings (u""),
 * and triple-quoted strings.
 */
export function transformString(node: SyntaxNode, ctx: TransformContext): string {
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

/**
 * Transform Python f-strings to JavaScript template literals.
 */
export function transformFormatString(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
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

    let selfDoc = false // Python 3.8+ f"{var=}" debug syntax

    for (const child of replChildren) {
      if (child.name === "{" || child.name === "}") continue
      if (child.name === "FormatSpec") {
        // Get the format spec without the leading colon
        formatSpec = getNodeText(child, ctx.source).slice(1)
      } else if (child.name === "FormatConversion") {
        // Get the conversion character (r, s, or a)
        conversion = getNodeText(child, ctx.source).slice(1) // Remove !
      } else if (child.name === "FormatSelfDoc") {
        // Python 3.8+ debug syntax: f"{var=}" -> "var=${var}"
        selfDoc = true
      } else {
        expr = child
      }
    }

    if (expr) {
      let exprCode = transformNode(expr, ctx)
      // Get the original expression text for debug syntax
      const exprText = getNodeText(expr, ctx.source)

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
        if (selfDoc) {
          // f"{var=:.2f}" -> "var=${format(var, '.2f')}"
          result += `${exprText}=\${format(${exprCode}, "${formatSpec}")}`
        } else {
          result += `\${format(${exprCode}, "${formatSpec}")}`
        }
      } else if (selfDoc) {
        // f"{var=}" -> "var=${var}"
        result += `${exprText}=\${${exprCode}}`
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
export function transformContinuedString(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
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
          return transformFormatString(c, ctx, transformNode)
        }
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
      })

    return parts.join(" + ")
  }
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

/**
 * Transform Python boolean literals to JavaScript.
 */
export function transformBoolean(node: SyntaxNode, ctx: TransformContext): string {
  const text = getNodeText(node, ctx.source)
  return text === "True" ? "true" : "false"
}

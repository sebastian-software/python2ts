import type { SyntaxNode } from "@lezer/common"
import { getNodeText, getChildren, parse, type ParseResult } from "../parser/index.js"

export interface TransformContext {
  source: string
  indentLevel: number
  usesRuntime: Set<string>
  /** Stack of scopes - each scope is a set of variable names declared in that scope */
  scopeStack: Set<string>[]
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
    scopeStack: [new Set()] // Start with one global scope
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

  // Collect targets (before =) and values (after =)
  const targets = children.slice(0, assignOpIndex).filter((c) => c.name !== ",")
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

    const targetCode = transformNode(target, ctx)

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
      return needsLet ? `let ${targetCode} = ${valueCode}` : `${targetCode} = ${valueCode}`
    } else {
      // Multiple values into single target (creates array)
      const valuesCodes = values.map((v) => transformNode(v, ctx))
      return needsLet
        ? `let ${targetCode} = [${valuesCodes.join(", ")}]`
        : `${targetCode} = [${valuesCodes.join(", ")}]`
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

    return `${objCode}.${propName}`
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

function transformForStatement(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)

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
    } else if (child.name !== ":" && child.name !== "Keyword" && child.name !== ",") {
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

  const iterableCode = transformNode(iterableNode, ctx)
  const bodyCode = transformBody(bodyNode, ctx)

  return `for (const ${varCode} of ${iterableCode}) {\n${bodyCode}\n}`
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

function transformFromImport(children: SyntaxNode[], ctx: TransformContext): string {
  // from os import path -> import { path } from "os"
  // from os import path, getcwd -> import { path, getcwd } from "os"
  // from collections import defaultdict as dd -> import { defaultdict as dd } from "collections"
  // from math import * -> import * from "math"
  // from . import utils -> import * as utils from "./utils"
  // from ..utils import helper -> import { helper } from "../utils"

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

function transformBody(node: SyntaxNode, ctx: TransformContext): string {
  ctx.indentLevel++
  pushScope(ctx) // Each block body gets its own scope
  const children = getChildren(node)
  const indent = "  ".repeat(ctx.indentLevel)

  const statements = children
    .filter((child) => child.name !== ":")
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

  for (const child of children) {
    if (child.name === "async") {
      isAsync = true
    } else if (child.name === "VariableName") {
      funcName = getNodeText(child, ctx.source)
    } else if (child.name === "ParamList") {
      paramList = child
    } else if (child.name === "Body") {
      body = child
    }
  }

  const params = paramList ? transformParamList(paramList, ctx) : ""
  const bodyCode = body ? transformBody(body, ctx) : ""

  const asyncPrefix = isAsync ? "async " : ""
  return `${asyncPrefix}function ${funcName}(${params}) {\n${bodyCode}\n}`
}

function transformClassDefinition(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)

  let className = ""
  let parentClass: string | null = null
  let body: SyntaxNode | null = null

  for (const child of children) {
    if (child.name === "VariableName") {
      className = getNodeText(child, ctx.source)
    } else if (child.name === "ArgList") {
      // Inheritance: class Child(Parent)
      const argChildren = getChildren(child)
      const parentNode = argChildren.find((c) => c.name === "VariableName")
      if (parentNode) {
        parentClass = getNodeText(parentNode, ctx.source)
      }
    } else if (child.name === "Body") {
      body = child
    }
  }

  // Build class header
  let classHeader = `class ${className}`
  if (parentClass) {
    classHeader += ` extends ${parentClass}`
  }

  // Transform class body
  const bodyCode = body ? transformClassBody(body, ctx) : ""

  return `${classHeader} {\n${bodyCode}\n}`
}

function transformClassBody(node: SyntaxNode, ctx: TransformContext): string {
  ctx.indentLevel++
  const children = getChildren(node)
  const indent = "  ".repeat(ctx.indentLevel)
  const members: string[] = []

  for (const child of children) {
    if (child.name === ":") continue

    if (child.name === "FunctionDefinition") {
      members.push(transformClassMethod(child, ctx, null))
    } else if (child.name === "DecoratedStatement") {
      members.push(transformClassDecoratedMethod(child, ctx))
    } else if (child.name === "AssignStatement") {
      // Class-level assignment (class attribute)
      const transformed = transformNode(child, ctx)
      members.push(indent + transformed + ";")
    } else if (child.name === "ExpressionStatement") {
      // Docstrings or other expressions
      const transformed = transformNode(child, ctx)
      if (transformed.trim()) {
        members.push(indent + transformed + ";")
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

  // Transform parameters, removing 'self' or 'cls'
  const params = paramList ? transformMethodParamList(paramList, ctx) : ""

  // Transform body, replacing 'self' with 'this'
  const bodyCode = body ? transformClassMethodBody(body, ctx) : ""

  // Handle special methods
  if (methodName === "__init__") {
    return `${indent}constructor(${params}) {\n${bodyCode}\n${indent}}`
  }

  if (methodName === "__str__" || methodName === "__repr__") {
    return `${indent}toString() {\n${bodyCode}\n${indent}}`
  }

  // Handle decorators
  let prefix = ""
  if (decorator === "staticmethod" || decorator === "classmethod") {
    prefix = "static "
  } else if (decorator === "property") {
    prefix = "get "
  }

  return `${indent}${prefix}${methodName}(${params}) {\n${bodyCode}\n${indent}}`
}

function transformClassDecoratedMethod(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)

  let decorator: string | null = null
  let funcDef: SyntaxNode | null = null

  for (const child of children) {
    if (child.name === "Decorator") {
      const decChildren = getChildren(child)
      const nameNode = decChildren.find((c) => c.name === "VariableName")
      if (nameNode) {
        decorator = getNodeText(nameNode, ctx.source)
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

function transformClassMethodBody(node: SyntaxNode, ctx: TransformContext): string {
  ctx.indentLevel++
  const children = getChildren(node)
  const indent = "  ".repeat(ctx.indentLevel)

  const statements = children
    .filter((child) => child.name !== ":")
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

  // Collect decorators and find the function definition
  const decorators: { name: string; args: string | null }[] = []
  let funcDef: SyntaxNode | null = null

  for (const child of children) {
    if (child.name === "Decorator") {
      const decChildren = getChildren(child)
      let decoratorName = ""
      let decoratorArgs: string | null = null

      for (const decChild of decChildren) {
        if (decChild.name === "VariableName") {
          decoratorName = getNodeText(decChild, ctx.source)
        } else if (decChild.name === "MemberExpression") {
          decoratorName = transformNode(decChild, ctx)
        } else if (decChild.name === "ArgList") {
          decoratorArgs = transformArgList(decChild, ctx)
        }
      }

      if (decoratorName) {
        decorators.push({ name: decoratorName, args: decoratorArgs })
      }
    } else if (child.name === "FunctionDefinition") {
      funcDef = child
    }
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

function transformParamList(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)
  const params: string[] = []
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
        // **kwargs becomes a regular parameter that accepts an object
        params.push(name)
        i += 2
        continue
      }
      i++
      continue
    }

    // Check for parameter with default value: VariableName AssignOp Value
    if (child.name === "VariableName") {
      const nextChild = children[i + 1]
      if (nextChild && nextChild.name === "AssignOp") {
        // This is a default parameter
        const defaultValChild = children[i + 2]
        if (defaultValChild) {
          const nameCode = getNodeText(child, ctx.source)
          const defaultCode = transformNode(defaultValChild, ctx)
          params.push(`${nameCode} = ${defaultCode}`)
          i += 3
          continue
        }
      }
      // Regular parameter without default
      params.push(getNodeText(child, ctx.source))
      i++
      continue
    }

    // Parameter with default value wrapped in a node (legacy handling)
    if (child.name === "AssignParam" || child.name === "DefaultParam") {
      const paramChildren = getChildren(child)
      const name = paramChildren.find((c) => c.name === "VariableName")
      const defaultVal = paramChildren[paramChildren.length - 1]

      if (name && defaultVal && name !== defaultVal) {
        const nameCode = getNodeText(name, ctx.source)
        const defaultCode = transformNode(defaultVal, ctx)
        params.push(`${nameCode} = ${defaultCode}`)
      } else if (name) {
        params.push(getNodeText(name, ctx.source))
      }
      i++
      continue
    }

    i++
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

export { transformNode, createContext }

import type { SyntaxNode } from "@lezer/common"
import { getNodeText, getChildren } from "../../parser/index.js"
import type { TransformContext, NodeTransformer } from "../types.js"
import {
  escapeReservedKeyword,
  pushScope,
  popScope,
  isVariableDeclared,
  declareVariable
} from "../context.js"
import { isDocstringNode, extractDocstringFromBody } from "./docstrings.js"
import { transformAssignTarget } from "./assignments.js"
import { containsYield, extractParamNames } from "./functions.js"

// Type for extractTypeAnnotation function passed from index.ts
type TypeAnnotationExtractor = (
  typeDef: SyntaxNode | undefined,
  ctx: TransformContext
) => string | null

// Type for extractTypeModifiers function passed from index.ts
interface TypeModifiers {
  isFinal: boolean
  isClassVar: boolean
}
type TypeModifiersExtractor = (
  typeDef: SyntaxNode | undefined,
  ctx: TransformContext
) => TypeModifiers

// ============================================================================
// Enum types and helpers
// ============================================================================

interface EnumMember {
  name: string
  value: string
  isString: boolean
  numericValue: number | null
}

function parseEnumMember(node: SyntaxNode, ctx: TransformContext): EnumMember | null {
  const children = getChildren(node)
  let name = ""
  let value = ""
  let isString = false
  let numericValue: number | null = null

  for (const child of children) {
    if (child.name === "VariableName" && !name) {
      name = getNodeText(child, ctx.source)
    } else if (child.name === "Number") {
      value = getNodeText(child, ctx.source)
      numericValue = parseFloat(value)
      isString = false
    } else if (child.name === "String") {
      const rawValue = getNodeText(child, ctx.source)
      value = rawValue.slice(1, -1)
      isString = true
    } else if (child.name === "CallExpression") {
      const callText = getNodeText(child, ctx.source)
      if (callText === "auto()") {
        value = "auto"
        numericValue = null
        isString = false
      } else {
        value = callText
        isString = false
      }
    }
  }

  if (!name) return null
  return { name, value, isString, numericValue }
}

function extractEnumMembers(body: SyntaxNode | null, ctx: TransformContext): EnumMember[] {
  if (!body) return []

  const members: EnumMember[] = []
  const children = getChildren(body)

  for (const child of children) {
    if (child.name === "AssignStatement") {
      const member = parseEnumMember(child, ctx)
      if (member) {
        members.push(member)
      }
    }
  }

  return members
}

function checkSequentialEnum(members: EnumMember[]): boolean {
  if (members.length === 0) return true
  if (members.some((m) => m.value === "auto")) return true

  const values = members.map((m) => m.numericValue).filter((v): v is number => v !== null)
  if (values.length !== members.length) return false

  const firstValue = values[0]
  if (firstValue === undefined) return false

  for (let i = 1; i < values.length; i++) {
    if (values[i] !== firstValue + i) return false
  }

  return true
}

function generateStringUnionEnum(className: string, members: EnumMember[]): string {
  const values = members.map((m) => `"${m.value}"`).join(" | ")
  return `type ${className} = ${values}`
}

function generateNameUnionEnum(className: string, members: EnumMember[]): string {
  const names = members.map((m) => `"${m.name}"`).join(" | ")
  return `type ${className} = ${names}`
}

function generateConstObjectEnum(className: string, members: EnumMember[]): string {
  const entries = members.map((m) => `  ${m.name}: ${m.value}`).join(",\n")
  return `const ${className} = {\n${entries}\n} as const\ntype ${className} = typeof ${className}[keyof typeof ${className}]`
}

export function transformEnum(
  className: string,
  enumType: string,
  body: SyntaxNode | null,
  ctx: TransformContext
): string {
  const members = extractEnumMembers(body, ctx)

  if (members.length === 0) {
    return `type ${className} = never`
  }

  const allStrings = members.every((m) => m.isString)

  if (enumType === "StrEnum" || allStrings) {
    return generateStringUnionEnum(className, members)
  }

  const isSequential = checkSequentialEnum(members)

  if (isSequential) {
    return generateNameUnionEnum(className, members)
  }

  return generateConstObjectEnum(className, members)
}

// ============================================================================
// Generic params extraction
// ============================================================================

export function extractGenericParams(parentClasses: string[]): string[] {
  for (const parent of parentClasses) {
    if (parent.startsWith("Generic[") && parent.endsWith("]")) {
      const inner = parent.slice(8, -1)
      return inner.split(",").map((p) => p.trim())
    }
  }
  return []
}

// ============================================================================
// TypedDict helpers
// ============================================================================

export function checkTypedDictTotalFalse(node: SyntaxNode, ctx: TransformContext): boolean {
  const children = getChildren(node)
  for (const child of children) {
    if (child.name === "ArgList") {
      const argText = getNodeText(child, ctx.source)
      if (argText.includes("total=False") || argText.includes("total: False")) {
        return true
      }
    }
  }
  return false
}

// ============================================================================
// Dataclass types and helpers
// ============================================================================

interface DataclassField {
  name: string
  tsType: string
  hasDefault: boolean
  defaultValue: string | null
  isFieldFactory: boolean
}

interface DataclassOptions {
  frozen: boolean
}

function parseDataclassOptions(args: string | null): DataclassOptions {
  const options: DataclassOptions = {
    frozen: false
  }

  if (!args) return options

  // Check for frozen=True (Python syntax) or frozen=true (JS transformed)
  if (
    args.includes("frozen=True") ||
    args.includes("frozen: True") ||
    args.includes("frozen=true") ||
    args.includes("frozen: true")
  ) {
    options.frozen = true
  }

  return options
}

function parseDataclassFieldFromAssignment(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer,
  extractTypeAnnotation: TypeAnnotationExtractor
): DataclassField | null {
  const children = getChildren(node)
  let fieldName = ""
  let tsType = "unknown"
  let hasDefault = false
  let defaultValue: string | null = null
  let isFieldFactory = false

  // Find the assignment operator position
  const assignOpIndex = children.findIndex((c) => c.name === "AssignOp" || c.name === "=")

  // Get the field name (before any type annotation or assignment)
  const nameNode = children.find((c) => c.name === "VariableName")
  if (nameNode) {
    fieldName = getNodeText(nameNode, ctx.source)
  }

  // Get type annotation if present (before assignment)
  // In Python dataclasses, fields WITHOUT type annotations are NOT dataclass fields
  const typeDef = children.find((c) => c.name === "TypeDef")
  if (!typeDef) {
    return null // No type annotation = not a dataclass field
  }
  const t = extractTypeAnnotation(typeDef, ctx)
  if (t) tsType = t

  // Get default value if present (after assignment operator)
  if (assignOpIndex !== -1) {
    hasDefault = true
    const valueNode = children[assignOpIndex + 1]
    if (valueNode) {
      // Check for field(default_factory=...) pattern
      if (valueNode.name === "CallExpression") {
        const callText = getNodeText(valueNode, ctx.source)
        if (callText.startsWith("field(")) {
          // Parse field() call
          const factoryRegex = /default_factory\s*=\s*(\w+)/
          const factoryMatch = factoryRegex.exec(callText)
          if (factoryMatch?.[1]) {
            isFieldFactory = true
            defaultValue = `${factoryMatch[1]}()`
          } else {
            const defaultRegex = /default\s*=\s*(.+?)(?:,|\))/
            const defaultMatch = defaultRegex.exec(callText)
            if (defaultMatch?.[1]) {
              defaultValue = defaultMatch[1].trim()
            }
          }
        } else {
          defaultValue = transformNode(valueNode, ctx)
        }
      } else {
        defaultValue = transformNode(valueNode, ctx)
      }
    }
  }

  if (!fieldName) return null

  return { name: fieldName, tsType, hasDefault, defaultValue, isFieldFactory }
}

function parseDataclassFieldFromExpression(
  node: SyntaxNode,
  ctx: TransformContext,
  extractTypeAnnotation: TypeAnnotationExtractor
): DataclassField | null {
  // ExpressionStatement containing just a typed name: field_name: Type
  const children = getChildren(node)
  if (children.length === 0) return null

  // Check if first child is a VariableName with a TypeDef
  const firstChild = children[0]
  if (!firstChild) return null

  // Could be direct children or nested
  const varName = firstChild.name === "VariableName" ? firstChild : null

  if (!varName) {
    // Try finding VariableName in children
    const innerChildren = getChildren(firstChild)
    const nameNode = innerChildren.find((c) => c.name === "VariableName")
    const typeDef = innerChildren.find((c) => c.name === "TypeDef")

    if (nameNode) {
      const fieldName = getNodeText(nameNode, ctx.source)
      let tsType = "unknown"
      if (typeDef) {
        const t = extractTypeAnnotation(typeDef, ctx)
        if (t) tsType = t
      }
      return {
        name: fieldName,
        tsType,
        hasDefault: false,
        defaultValue: null,
        isFieldFactory: false
      }
    }
    return null
  }

  const fieldName = getNodeText(varName, ctx.source)
  const typeDef = children.find((c) => c.name === "TypeDef")
  let tsType = "unknown"
  if (typeDef) {
    const t = extractTypeAnnotation(typeDef, ctx)
    if (t) tsType = t
  }

  return { name: fieldName, tsType, hasDefault: false, defaultValue: null, isFieldFactory: false }
}

function extractDataclassFields(
  body: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer,
  extractTypeAnnotation: TypeAnnotationExtractor
): DataclassField[] {
  const fields: DataclassField[] = []
  const children = getChildren(body)

  for (const child of children) {
    if (child.name === ":") continue
    if (child.name === "PassStatement") continue
    if (child.name === "FunctionDefinition") continue
    if (child.name === "DecoratedStatement") continue

    // Handle typed assignment: field: Type = value
    if (child.name === "AssignStatement") {
      const field = parseDataclassFieldFromAssignment(
        child,
        ctx,
        transformNode,
        extractTypeAnnotation
      )
      if (field) {
        fields.push(field)
      }
    }
    // Handle type-only declaration: field: Type
    else if (child.name === "ExpressionStatement") {
      // Skip docstrings
      if (isDocstringNode(child, ctx)) continue
      const field = parseDataclassFieldFromExpression(child, ctx, extractTypeAnnotation)
      if (field) {
        fields.push(field)
      }
    }
  }

  return fields
}

function generateDataclassCode(
  className: string,
  parentClasses: string[],
  fields: DataclassField[],
  options: DataclassOptions,
  body: SyntaxNode | null,
  ctx: TransformContext,
  jsdoc: string | null,
  transformNode: NodeTransformer,
  extractTypeAnnotation: TypeAnnotationExtractor
): string {
  const indent = "  "
  const members: string[] = []

  // Generate readonly field declarations
  for (const field of fields) {
    const readonly = options.frozen ? "readonly " : ""
    // For field(default_factory=...), don't show default in declaration - only in constructor
    const showDefault = field.hasDefault && field.defaultValue !== null && !field.isFieldFactory
    const defaultPart = showDefault && field.defaultValue ? ` = ${field.defaultValue}` : ""
    members.push(`${indent}${readonly}${field.name}: ${field.tsType}${defaultPart};`)
  }

  // Generate constructor
  const constructorParams = fields.map((f) => {
    if (f.hasDefault && f.defaultValue !== null) {
      let defaultVal: string
      if (f.isFieldFactory) {
        // Map Python factory functions to TypeScript defaults
        // f.defaultValue is "factoryName()" from parsing
        const factoryName = f.defaultValue.replace(/\(\)$/, "")
        if (factoryName === "list") {
          defaultVal = "[]"
        } else if (factoryName === "dict") {
          defaultVal = "{}"
        } else if (factoryName === "set") {
          defaultVal = "new Set()"
        } else {
          // Generic: use "new BaseType()"
          const baseType = f.tsType.replace(/<.*>$/, "")
          defaultVal = `new ${baseType}()`
        }
      } else {
        defaultVal = f.defaultValue
      }
      return `${f.name}: ${f.tsType} = ${defaultVal}`
    }
    return `${f.name}: ${f.tsType}`
  })

  const constructorBodyLines = fields.map((f) => `${indent}${indent}this.${f.name} = ${f.name};`)
  if (options.frozen) {
    constructorBodyLines.push(`${indent}${indent}Object.freeze(this);`)
  }
  const constructorBody = constructorBodyLines.join("\n")

  let constructor = `${indent}constructor(${constructorParams.join(", ")}) {\n`
  if (parentClasses.length > 0) {
    constructor += `${indent}${indent}super();\n`
  }
  constructor += constructorBody
  constructor += `\n${indent}}`

  members.push(constructor)

  // Add any methods from the body
  if (body) {
    const bodyChildren = getChildren(body)
    for (const child of bodyChildren) {
      if (child.name === "FunctionDefinition") {
        const methodCode = transformClassMethodInternal(
          child,
          ctx,
          null,
          transformNode,
          extractTypeAnnotation
        )
        if (methodCode) {
          members.push(methodCode)
        }
      } else if (child.name === "DecoratedStatement") {
        const methodCode = transformClassDecoratedMethodInternal(
          child,
          ctx,
          transformNode,
          extractTypeAnnotation
        )
        if (methodCode) {
          members.push(methodCode)
        }
      }
    }
  }

  // Build class header
  let classHeader = `class ${className}`
  const firstParent = parentClasses[0]
  if (firstParent) {
    classHeader += ` extends ${firstParent}`
  }

  const classCode = `${classHeader} {\n${members.join("\n\n")}\n}`

  return jsdoc ? `${jsdoc}\n${classCode}` : classCode
}

function transformDataclass(
  classDef: SyntaxNode,
  decorator: { name: string; args: string | null },
  ctx: TransformContext,
  transformNode: NodeTransformer,
  extractTypeAnnotation: TypeAnnotationExtractor
): string {
  const children = getChildren(classDef)
  let className = ""
  const parentClasses: string[] = []
  let body: SyntaxNode | null = null

  for (const child of children) {
    if (child.name === "VariableName") {
      className = getNodeText(child, ctx.source)
      ctx.definedClasses.add(className)
    } else if (child.name === "ArgList") {
      const argChildren = getChildren(child)
      for (const argChild of argChildren) {
        if (argChild.name === "VariableName") {
          parentClasses.push(getNodeText(argChild, ctx.source))
        }
      }
    } else if (child.name === "Body") {
      body = child
    }
  }

  const options = parseDataclassOptions(decorator.args)
  const fields = body ? extractDataclassFields(body, ctx, transformNode, extractTypeAnnotation) : []

  // Extract docstring
  const indent = "  ".repeat(ctx.indentLevel)
  const { jsdoc } = body
    ? extractDocstringFromBody(body, ctx, indent)
    : { jsdoc: null, skipFirstStatement: false }

  return generateDataclassCode(
    className,
    parentClasses,
    fields,
    options,
    body,
    ctx,
    jsdoc,
    transformNode,
    extractTypeAnnotation
  )
}

// ============================================================================
// Class method transformation (internal helpers)
// ============================================================================

function extractMethodReturnType(
  node: SyntaxNode,
  ctx: TransformContext,
  extractTypeAnnotation: TypeAnnotationExtractor
): string | null {
  const children = getChildren(node)
  for (const child of children) {
    if (child.name === "TypeDef") {
      return extractTypeAnnotation(child, ctx)
    }
  }
  return null
}

function transformMethodParamListImpl(
  node: SyntaxNode,
  ctx: TransformContext,
  includeTypes: boolean,
  transformNode: NodeTransformer,
  extractTypeAnnotation: TypeAnnotationExtractor
): string {
  const children = getChildren(node)
  const params: string[] = []
  let restParam: string | null = null
  let kwargsParam: string | null = null
  let i = 0
  let isFirstParam = true

  while (i < children.length) {
    const child = children[i]
    if (!child) {
      i++
      continue
    }

    if (child.name === "(" || child.name === ")" || child.name === ",") {
      i++
      continue
    }

    if (child.name === "VariableName" && isFirstParam) {
      const name = getNodeText(child, ctx.source)
      if (name === "self" || name === "cls") {
        i++
        isFirstParam = false
        continue
      }
    }
    isFirstParam = false

    if (child.name === "*" || getNodeText(child, ctx.source) === "*") {
      const nextChild = children[i + 1]
      if (nextChild?.name === "VariableName") {
        const name = escapeReservedKeyword(getNodeText(nextChild, ctx.source))
        restParam = `...${name}`
        i += 2
        continue
      }
      i++
      continue
    }

    if (child.name === "**" || getNodeText(child, ctx.source) === "**") {
      const nextChild = children[i + 1]
      if (nextChild?.name === "VariableName") {
        const name = escapeReservedKeyword(getNodeText(nextChild, ctx.source))
        kwargsParam = `${name}: Record<string, unknown> = {}`
        i += 2
        continue
      }
      i++
      continue
    }

    if (child.name === "VariableName") {
      const nameCode = escapeReservedKeyword(getNodeText(child, ctx.source))
      let typeStr = ""
      let defaultStr = ""
      let consumed = 1

      const nextChild = children[i + 1]
      if (nextChild?.name === "TypeDef" && includeTypes) {
        const t = extractTypeAnnotation(nextChild, ctx)
        if (t) typeStr = `: ${t}`
        consumed++

        const afterType = children[i + 2]
        if (afterType?.name === "AssignOp") {
          const defaultVal = children[i + 3]
          if (defaultVal) {
            defaultStr = ` = ${transformNode(defaultVal, ctx)}`
            consumed += 2
          }
        }
      } else if (nextChild?.name === "AssignOp") {
        const defaultValChild = children[i + 2]
        if (defaultValChild) {
          defaultStr = ` = ${transformNode(defaultValChild, ctx)}`
          consumed += 2
        }
      }

      params.push(`${nameCode}${typeStr}${defaultStr}`)
      i += consumed
      continue
    }

    i++
  }

  if (kwargsParam) {
    params.push(kwargsParam)
  }

  if (restParam) {
    params.push(restParam)
  }

  return params.join(", ")
}

function transformClassMethodBody(
  node: SyntaxNode,
  ctx: TransformContext,
  skipFirst: boolean,
  predeclaredVars: string[],
  transformNode: NodeTransformer,
  transformClassAssignmentFn: (node: SyntaxNode, ctx: TransformContext) => string
): string {
  ctx.indentLevel++
  pushScope(ctx)

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
      let transformed: string

      if (child.name === "AssignStatement") {
        transformed = transformClassAssignmentFn(child, ctx)
      } else {
        transformed = transformNode(child, ctx)
      }

      if (transformed === "") {
        return ""
      }

      transformed = transformed.replace(/\bself\./g, "this.")
      transformed = transformed.replace(/\bcls\./g, "this.")
      transformed = transformed.replace(/super\(\)\.__init__\(/g, "super(")
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
    .filter((s) => s.trim() !== "")

  popScope(ctx)
  ctx.indentLevel--
  return statements.join("\n")
}

function transformClassMethodInternal(
  node: SyntaxNode,
  ctx: TransformContext,
  decorator: string | null,
  transformNode: NodeTransformer,
  extractTypeAnnotation: TypeAnnotationExtractor
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

  const { jsdoc, skipFirstStatement } = body
    ? extractDocstringFromBody(body, ctx, indent)
    : { jsdoc: null, skipFirstStatement: false }

  const params = paramList
    ? transformMethodParamListImpl(paramList, ctx, false, transformNode, extractTypeAnnotation)
    : ""
  const paramNames = paramList
    ? extractParamNames(paramList, ctx.source).filter((n) => n !== "self" && n !== "cls")
    : []

  ctx.insideFunctionBody++
  const bodyCode = body
    ? transformClassMethodBody(body, ctx, skipFirstStatement, paramNames, transformNode, (n, c) =>
        transformClassAssignmentInternal(n, c, transformNode)
      )
    : ""
  ctx.insideFunctionBody--

  const isGenerator = body ? containsYield(body) : false
  const generatorStar = isGenerator ? "*" : ""

  if (methodName === "__init__") {
    const methodDecl = `${indent}constructor(${params}) {\n${bodyCode}\n${indent}}`
    return jsdoc ? `${jsdoc}\n${methodDecl}` : methodDecl
  }

  if (methodName === "__str__" || methodName === "__repr__") {
    const methodDecl = `${indent}toString() {\n${bodyCode}\n${indent}}`
    return jsdoc ? `${jsdoc}\n${methodDecl}` : methodDecl
  }

  let prefix = ""
  if (decorator === "staticmethod" || decorator === "classmethod") {
    prefix = "static "
  } else if (decorator === "property") {
    prefix = "get "
  } else if (decorator === "setter") {
    prefix = "set "
  } else if (decorator === "abstractmethod") {
    const typedParams = paramList
      ? transformMethodParamListImpl(paramList, ctx, true, transformNode, extractTypeAnnotation)
      : ""
    const returnType = extractMethodReturnType(node, ctx, extractTypeAnnotation)
    const returnTypeStr = returnType ? `: ${returnType === "null" ? "void" : returnType}` : ""
    const methodDecl = `${indent}abstract ${methodName}(${typedParams})${returnTypeStr}`
    return jsdoc ? `${jsdoc}\n${methodDecl}` : methodDecl
  }

  const methodDecl = `${indent}${prefix}${generatorStar}${methodName}(${params}) {\n${bodyCode}\n${indent}}`
  return jsdoc ? `${jsdoc}\n${methodDecl}` : methodDecl
}

function transformClassDecoratedMethodInternal(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer,
  extractTypeAnnotation: TypeAnnotationExtractor
): string {
  const children = getChildren(node)

  let decorator: string | null = null
  let funcDef: SyntaxNode | null = null

  for (const child of children) {
    if (child.name === "Decorator") {
      const decChildren = getChildren(child)
      const varNames = decChildren.filter((c) => c.name === "VariableName")
      const hasDot = decChildren.some((c) => c.name === ".")
      if (varNames.length >= 2 && hasDot) {
        const propName = varNames[varNames.length - 1]
        if (propName) {
          decorator = getNodeText(propName, ctx.source)
        }
      } else {
        const nameNode = varNames[0]
        if (nameNode) {
          decorator = getNodeText(nameNode, ctx.source)
        }
      }
    } else if (child.name === "FunctionDefinition") {
      funcDef = child
    }
  }

  if (!funcDef) {
    return getNodeText(node, ctx.source)
  }

  return transformClassMethodInternal(funcDef, ctx, decorator, transformNode, extractTypeAnnotation)
}

function transformClassAssignmentInternal(
  node: SyntaxNode,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
  const children = getChildren(node)
  if (children.length < 3) return getNodeText(node, ctx.source)

  const assignOpIndices = children
    .map((c, i) => (c.name === "AssignOp" || c.name === "=" ? i : -1))
    .filter((i) => i !== -1)

  if (assignOpIndices.length > 1) {
    const chainTargets: SyntaxNode[] = []
    const lastAssignOpIndex = assignOpIndices[assignOpIndices.length - 1]
    if (lastAssignOpIndex === undefined) return getNodeText(node, ctx.source)

    for (let i = 0; i < assignOpIndices.length; i++) {
      const opIndex = assignOpIndices[i]
      if (opIndex === undefined) continue
      const prevOpIndex = i > 0 ? assignOpIndices[i - 1] : -1
      const startIdx = prevOpIndex !== undefined ? prevOpIndex + 1 : 0
      const targetNodes = children.slice(startIdx, opIndex).filter((c) => c.name !== ",")
      if (targetNodes.length === 1 && targetNodes[0]) {
        chainTargets.push(targetNodes[0])
      }
    }

    const valueNodes = children.slice(lastAssignOpIndex + 1).filter((c) => c.name !== ",")
    if (valueNodes.length !== 1 || !valueNodes[0]) return getNodeText(node, ctx.source)

    const valueCode = transformNode(valueNodes[0], ctx)

    const results: string[] = []
    let lastVarName = valueCode
    const indent = "  ".repeat(ctx.indentLevel)

    for (let i = chainTargets.length - 1; i >= 0; i--) {
      const target = chainTargets[i]
      if (!target) continue
      const targetCode = transformNode(target, ctx)
      const varName = getNodeText(target, ctx.source)

      const isMemberAssignment = target.name === "MemberExpression"

      let needsDeclaration = false
      if (
        !isMemberAssignment &&
        target.name === "VariableName" &&
        !isVariableDeclared(ctx, varName)
      ) {
        needsDeclaration = true
        declareVariable(ctx, varName)
      }

      const keyword = needsDeclaration ? "let " : ""
      results.push(`${keyword}${targetCode} = ${lastVarName}`)
      lastVarName = targetCode
    }

    return results.join(`;\n${indent}`)
  }

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
    const isMemberAssignment = target.name === "MemberExpression"

    if (values.length === 1) {
      const value = values[0]
      if (!value) return getNodeText(node, ctx.source)
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

  const targetCodes = targets.map((t) => transformAssignTarget(t, ctx, transformNode))
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

// ============================================================================
// Main class transformation exports
// ============================================================================

export function transformClassBody(
  node: SyntaxNode,
  ctx: TransformContext,
  skipFirst: boolean,
  transformNode: NodeTransformer,
  extractTypeAnnotation: TypeAnnotationExtractor,
  extractTypeModifiers: TypeModifiersExtractor
): string {
  ctx.indentLevel++
  const children = getChildren(node)
  const indent = "  ".repeat(ctx.indentLevel)
  const members: string[] = []

  let filteredChildren = children.filter((c) => c.name !== ":")
  if (skipFirst && filteredChildren.length > 0) {
    filteredChildren = filteredChildren.slice(1)
  }

  for (const child of filteredChildren) {
    if (child.name === "FunctionDefinition") {
      members.push(
        transformClassMethodInternal(child, ctx, null, transformNode, extractTypeAnnotation)
      )
    } else if (child.name === "DecoratedStatement") {
      members.push(
        transformClassDecoratedMethodInternal(child, ctx, transformNode, extractTypeAnnotation)
      )
    } else if (child.name === "AssignStatement") {
      const transformed = transformClassPropertyInternal(
        child,
        ctx,
        indent,
        transformNode,
        extractTypeAnnotation,
        extractTypeModifiers
      )
      if (transformed) {
        members.push(transformed)
      }
    } else if (child.name === "ExpressionStatement") {
      if (!isDocstringNode(child, ctx)) {
        const transformed = transformNode(child, ctx)
        if (transformed.trim()) {
          members.push(indent + transformed + ";")
        }
      }
    } else if (child.name === "PassStatement") {
      // Skip pass in class body
    }
  }

  ctx.indentLevel--
  return members.filter((m) => m.trim()).join("\n\n")
}

function transformClassPropertyInternal(
  node: SyntaxNode,
  ctx: TransformContext,
  indent: string,
  transformNode: NodeTransformer,
  extractTypeAnnotation: TypeAnnotationExtractor,
  extractTypeModifiers: TypeModifiersExtractor
): string {
  const children = getChildren(node)
  if (children.length < 2) return ""

  const nodeText = getNodeText(node, ctx.source)
  if (nodeText.includes(".__doc__")) {
    return ""
  }

  const assignOpIndex = children.findIndex((c) => c.name === "AssignOp" || c.name === "=")
  const typeDef = children.find((c) => c.name === "TypeDef")

  if (assignOpIndex === -1) {
    const targets = children.filter((c) => c.name !== "," && c.name !== "TypeDef" && c.name !== ":")
    const target = targets[0]
    if (!target) return ""

    const targetCode = transformNode(target, ctx)
    const tsType = extractTypeAnnotation(typeDef, ctx)
    const typeAnnotation = tsType ? `: ${tsType}` : ""

    const modifiers = extractTypeModifiers(typeDef, ctx)

    let prefix = ""
    if (modifiers.isClassVar) {
      prefix = "static "
    }
    if (modifiers.isFinal) {
      prefix += "readonly "
    }

    return `${indent}${prefix}${targetCode}${typeAnnotation};`
  }

  const typeDefBeforeAssign = children.slice(0, assignOpIndex).find((c) => c.name === "TypeDef")

  const targets = children
    .slice(0, assignOpIndex)
    .filter((c) => c.name !== "," && c.name !== "TypeDef")
  const values = children.slice(assignOpIndex + 1).filter((c) => c.name !== ",")

  if (targets.length === 0 || values.length === 0) return ""

  const target = targets[0]
  if (!target) return ""

  const targetCode = transformNode(target, ctx)

  const tsType = extractTypeAnnotation(typeDefBeforeAssign, ctx)
  const typeAnnotation = tsType ? `: ${tsType}` : ""

  const modifiers = extractTypeModifiers(typeDefBeforeAssign, ctx)

  let prefix = ""
  if (modifiers.isClassVar) {
    prefix = "static "
  }
  if (modifiers.isFinal) {
    prefix += "readonly "
  }

  const value = values[0]
  const valueCode = value ? transformNode(value, ctx) : ""

  return `${indent}${prefix}${targetCode}${typeAnnotation} = ${valueCode};`
}

export function transformNamedTuple(
  className: string,
  body: SyntaxNode | null,
  ctx: TransformContext,
  transformNode: NodeTransformer,
  extractTypeAnnotation: TypeAnnotationExtractor
): string {
  const fields = body ? extractDataclassFields(body, ctx, transformNode, extractTypeAnnotation) : []

  return generateDataclassCode(
    className,
    [],
    fields,
    { frozen: true },
    body,
    ctx,
    null,
    transformNode,
    extractTypeAnnotation
  )
}

export function transformTypedDict(
  className: string,
  body: SyntaxNode | null,
  totalFalse: boolean,
  ctx: TransformContext,
  transformNode: NodeTransformer,
  extractTypeAnnotation: TypeAnnotationExtractor
): string {
  const fields = body ? extractDataclassFields(body, ctx, transformNode, extractTypeAnnotation) : []
  const memberIndent = "  "

  const members = fields.map((f) => {
    const optional = totalFalse ? "?" : ""
    return `${memberIndent}${f.name}${optional}: ${f.tsType}`
  })

  if (members.length === 0) {
    return `interface ${className} {}`
  }

  return `interface ${className} {\n${members.join("\n")}\n}`
}

export function transformAbstractClass(
  className: string,
  parentClasses: string[],
  body: SyntaxNode | null,
  ctx: TransformContext,
  jsdoc: string | null,
  transformNode: NodeTransformer,
  extractTypeAnnotation: TypeAnnotationExtractor,
  extractTypeModifiers: TypeModifiersExtractor
): string {
  const filteredParents = parentClasses.filter((p) => p !== "ABC" && p !== "abc.ABC")

  let classHeader = `abstract class ${className}`
  const firstParent = filteredParents[0]
  if (firstParent) {
    classHeader += ` extends ${firstParent}`
  }

  ctx.isAbstractClass = true
  const bodyCode = body
    ? transformClassBody(
        body,
        ctx,
        false,
        transformNode,
        extractTypeAnnotation,
        extractTypeModifiers
      )
    : ""
  ctx.isAbstractClass = false

  const classDecl = `${classHeader} {\n${bodyCode}\n}`
  return jsdoc ? `${jsdoc}\n${classDecl}` : classDecl
}

export function transformProtocol(
  className: string,
  parentClasses: string[],
  body: SyntaxNode | null,
  ctx: TransformContext,
  transformNode: NodeTransformer,
  extractTypeAnnotation: TypeAnnotationExtractor
): string {
  const memberIndent = "  "
  const members: string[] = []

  const genericParams = extractGenericParams(parentClasses)
  const genericStr = genericParams.length > 0 ? `<${genericParams.join(", ")}>` : ""

  const otherParents = parentClasses.filter((p) => p !== "Protocol" && !p.startsWith("Generic["))

  if (body) {
    const children = getChildren(body)
    for (const child of children) {
      if (child.name === ":") continue
      if (child.name === "PassStatement") continue

      if (child.name === "FunctionDefinition") {
        const sig = extractProtocolMethodSignatureInternal(child, ctx, extractTypeAnnotation)
        if (sig) {
          members.push(`${memberIndent}${sig}`)
        }
      } else if (child.name === "ExpressionStatement" || child.name === "AssignStatement") {
        const field =
          parseDataclassFieldFromExpression(child, ctx, extractTypeAnnotation) ??
          parseDataclassFieldFromAssignment(child, ctx, transformNode, extractTypeAnnotation)
        if (field) {
          members.push(`${memberIndent}${field.name}: ${field.tsType}`)
        }
      }
    }
  }

  let header = `interface ${className}${genericStr}`
  if (otherParents.length > 0) {
    header += ` extends ${otherParents.join(", ")}`
  }

  if (members.length === 0) {
    return `${header} {}`
  }

  return `${header} {\n${members.join("\n")}\n}`
}

function extractProtocolMethodSignatureInternal(
  node: SyntaxNode,
  ctx: TransformContext,
  extractTypeAnnotation: TypeAnnotationExtractor
): string | null {
  const children = getChildren(node)
  let methodName = ""
  let params: string[] = []
  let returnType = "void"

  for (const child of children) {
    if (child.name === "def") continue

    if (child.name === "VariableName" && !methodName) {
      methodName = getNodeText(child, ctx.source)
    } else if (child.name === "ParamList") {
      params = extractProtocolParamsInternal(child, ctx, extractTypeAnnotation)
    } else if (child.name === "TypeDef") {
      const rt = extractTypeAnnotation(child, ctx)
      if (rt) returnType = rt === "null" ? "void" : rt
    }
  }

  if (!methodName || methodName === "__init__") return null

  return `${methodName}(${params.join(", ")}): ${returnType}`
}

function extractProtocolParamsInternal(
  node: SyntaxNode,
  ctx: TransformContext,
  extractTypeAnnotation: TypeAnnotationExtractor
): string[] {
  const children = getChildren(node)
  const params: string[] = []

  let i = 0
  while (i < children.length) {
    const child = children[i]
    if (!child || child.name === "(" || child.name === ")" || child.name === ",") {
      i++
      continue
    }

    if (child.name === "VariableName") {
      const paramName = getNodeText(child, ctx.source)
      if (paramName === "self" || paramName === "cls") {
        i++
        continue
      }

      let paramType = "unknown"
      const nextChild = children[i + 1]
      if (nextChild?.name === "TypeDef") {
        const t = extractTypeAnnotation(nextChild, ctx)
        if (t) paramType = t
        i++
      }

      params.push(`${paramName}: ${paramType}`)
    }
    i++
  }

  return params
}

export function transformGenericClass(
  className: string,
  genericParams: string[],
  parentClasses: string[],
  body: SyntaxNode | null,
  ctx: TransformContext,
  jsdoc: string | null,
  transformNode: NodeTransformer,
  extractTypeAnnotation: TypeAnnotationExtractor,
  extractTypeModifiers: TypeModifiersExtractor
): string {
  const genericStr = `<${genericParams.join(", ")}>`

  let classHeader = `class ${className}${genericStr}`

  const firstParent = parentClasses[0]
  if (firstParent) {
    classHeader += ` extends ${firstParent}`
  }

  const bodyCode = body
    ? transformClassBody(
        body,
        ctx,
        false,
        transformNode,
        extractTypeAnnotation,
        extractTypeModifiers
      )
    : ""

  const classDecl = `${classHeader} {\n${bodyCode}\n}`
  return jsdoc ? `${jsdoc}\n${classDecl}` : classDecl
}

export function transformDecoratedClass(
  classDef: SyntaxNode,
  decorators: { name: string; args: string | null }[],
  ctx: TransformContext,
  transformNode: NodeTransformer,
  extractTypeAnnotation: TypeAnnotationExtractor,
  transformClassDefinitionFn: (node: SyntaxNode, ctx: TransformContext) => string
): string {
  const dataclassDecorator = decorators.find(
    (d) => d.name === "dataclass" || d.name === "dataclasses.dataclass"
  )

  if (dataclassDecorator) {
    const otherDecorators = decorators.filter((d) => d !== dataclassDecorator)
    const dataclassCode = transformDataclass(
      classDef,
      dataclassDecorator,
      ctx,
      transformNode,
      extractTypeAnnotation
    )

    if (otherDecorators.length === 0) {
      return dataclassCode
    }

    const children = getChildren(classDef)
    let className = ""
    for (const child of children) {
      if (child.name === "VariableName") {
        className = getNodeText(child, ctx.source)
        break
      }
    }

    let expr = dataclassCode
    for (let i = otherDecorators.length - 1; i >= 0; i--) {
      const dec = otherDecorators[i]
      if (!dec) continue
      if (dec.args !== null) {
        expr = `${dec.name}(${dec.args})(${expr})`
      } else {
        expr = `${dec.name}(${expr})`
      }
    }
    return `const ${className} = ${expr}`
  }

  // Generic class decorator wrapping
  const children = getChildren(classDef)
  let className = ""

  for (const child of children) {
    if (child.name === "VariableName") {
      className = getNodeText(child, ctx.source)
      ctx.definedClasses.add(className)
      break
    }
  }

  let classExpr = transformClassDefinitionFn(classDef, ctx)

  for (let i = decorators.length - 1; i >= 0; i--) {
    const dec = decorators[i]
    if (!dec) continue

    if (dec.args !== null) {
      classExpr = `${dec.name}(${dec.args})(${classExpr})`
    } else {
      classExpr = `${dec.name}(${classExpr})`
    }
  }

  return `const ${className} = ${classExpr}`
}

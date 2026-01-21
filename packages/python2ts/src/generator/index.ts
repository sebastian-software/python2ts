import { transform, type TransformResult } from "../transformer/index.js"
import type { ParseResult } from "../parser/index.js"
import * as prettier from "prettier"
import { Linter } from "eslint"

export interface GeneratorOptions {
  includeRuntime?: boolean
  runtimeImportPath?: string
}

export interface GeneratedCode {
  code: string
  runtimeImport: string | null
  usedRuntimeFunctions: string[]
}

const defaultOptions: GeneratorOptions = {
  includeRuntime: true,
  runtimeImportPath: "pythonlib"
}

/** Prettier configuration for generated TypeScript code */
const prettierOptions: prettier.Options = {
  parser: "typescript",
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "none",
  printWidth: 100,
  semi: false,
  bracketSpacing: true,
  arrowParens: "always",
  endOfLine: "lf"
}

/** List of functions available in the main pythonlib export (builtins + core) */
const BUILTINS = new Set([
  // Core operations
  "floorDiv",
  "pow",
  "mod",
  "sprintf",
  "slice",
  "at",
  "contains",
  "repeatValue",
  "strFormat",
  "divMod",
  // Collection constructors
  "list",
  "dict",
  "set",
  "tuple",
  // Iteration
  "len",
  "range",
  "enumerate",
  "zip",
  "sorted",
  "reversed",
  "iter",
  "map",
  "filter",
  // Aggregation
  "abs",
  "min",
  "max",
  "sum",
  "all",
  "any",
  "round",
  // Character/number conversion
  "ord",
  "chr",
  "hex",
  "oct",
  "bin",
  // Type conversion
  "int",
  "float",
  "str",
  "bool",
  "repr",
  "ascii",
  // Type checking & misc
  "isinstance",
  "type",
  "input",
  "format"
])

/** Mapping of module namespaces that should still use namespace.method() style */
const MODULE_NAMESPACES = new Set(["string", "list", "dict", "set"])

/**
 * Generate TypeScript code from Python (sync, unformatted)
 * For formatted output, use generateAsync()
 */
export function generate(
  input: string | ParseResult,
  options: GeneratorOptions = {}
): GeneratedCode {
  const opts = { ...defaultOptions, ...options }
  const result: TransformResult = transform(input)

  const usedRuntimeFunctions = Array.from(result.usesRuntime).sort()

  let runtimeImport: string | null = null
  if (opts.includeRuntime && usedRuntimeFunctions.length > 0) {
    const basePath = opts.runtimeImportPath ?? "pythonlib"
    runtimeImport = buildRuntimeImports(usedRuntimeFunctions, basePath)
  }

  let code = result.code

  // Add hoisted imports (imports that were inside function bodies) at the top
  if (result.hoistedImports.length > 0) {
    const hoistedCode = result.hoistedImports.join("\n")
    code = hoistedCode + "\n\n" + code
  }

  // Add runtime import at the top if needed
  if (runtimeImport) {
    code = runtimeImport + "\n\n" + code
  }

  return {
    code,
    runtimeImport,
    usedRuntimeFunctions
  }
}

/**
 * Build import statements from pythonlib based on what's used.
 *
 * Format of usedFunctions:
 * - Builtins: "len", "range", "sorted"
 * - Core ops: "floordiv", "mod", "pow", "slice"
 * - Module functions: "itertools/chain", "json/dump", "re/match"
 * - Namespace methods: "list.append", "dict.get", "string.join"
 */
function buildRuntimeImports(usedFunctions: string[], basePath: string): string {
  // Group imports by module
  const mainImports = new Set<string>()
  const moduleImports = new Map<string, Set<string>>()

  for (const func of usedFunctions) {
    // Module function: "itertools/chain" -> import { chain } from "pythonlib/itertools"
    if (func.includes("/")) {
      const [moduleName, funcName] = func.split("/")
      if (moduleName && funcName) {
        let funcs = moduleImports.get(moduleName)
        if (!funcs) {
          funcs = new Set()
          moduleImports.set(moduleName, funcs)
        }
        funcs.add(funcName)
      }
      continue
    }

    // Namespace methods: "list.append" -> import { list } from "pythonlib"
    if (func.includes(".")) {
      const [namespace] = func.split(".")
      if (namespace && MODULE_NAMESPACES.has(namespace)) {
        mainImports.add(namespace)
      }
      continue
    }

    // Module namespaces used directly (for namespace.method() style)
    if (MODULE_NAMESPACES.has(func)) {
      mainImports.add(func)
      continue
    }

    // Builtins and core ops -> import from main "pythonlib"
    if (BUILTINS.has(func)) {
      mainImports.add(func)
      continue
    }

    /* v8 ignore next 2 -- fallback for future/unknown runtime functions @preserve */
    // Unknown - add to main imports (for future compatibility)
    mainImports.add(func)
  }

  // Build import statements
  const importStatements: string[] = []

  // Main pythonlib imports
  if (mainImports.size > 0) {
    const sorted = Array.from(mainImports).sort()
    importStatements.push(`import { ${sorted.join(", ")} } from "${basePath}"`)
  }

  // Module-specific imports (sorted by module name)
  const sortedModules = Array.from(moduleImports.keys()).sort()
  for (const moduleName of sortedModules) {
    const funcSet = moduleImports.get(moduleName)
    if (funcSet) {
      const funcs = Array.from(funcSet).sort()
      importStatements.push(`import { ${funcs.join(", ")} } from "${basePath}/${moduleName}"`)
    }
  }

  return importStatements.join("\n")
}

/**
 * Transpile Python to TypeScript (sync, unformatted)
 * For formatted output, use transpileAsync()
 */
export function transpile(python: string, options: GeneratorOptions = {}): string {
  return generate(python, options).code
}

/** ESLint linter instance for fixing generated code */
const eslintLinter = new Linter({ configType: "eslintrc" })

/** ESLint configuration for generated TypeScript code */
const eslintConfig: Linter.LegacyConfig = {
  parserOptions: { ecmaVersion: 2022 },
  rules: {
    "prefer-const": "error",
    "prefer-arrow-callback": "error",
    "prefer-template": "error",
    curly: "error",
    "no-lonely-if": "error"
  }
}

/**
 * Apply ESLint fixes to code (e.g., prefer-const)
 */
function applyEslintFixes(code: string): string {
  const result = eslintLinter.verifyAndFix(code, eslintConfig, { filename: "output.ts" })
  return result.output
}

/* v8 ignore start -- async wrappers tested via CLI @preserve */
/**
 * Format TypeScript code using ESLint fixes + Prettier
 */
export async function formatCode(code: string): Promise<string> {
  try {
    // First apply ESLint fixes (prefer-const)
    const eslintFixed = applyEslintFixes(code)
    // Then format with Prettier
    return await prettier.format(eslintFixed, prettierOptions)
  } catch {
    // If formatting fails (e.g., syntax error in generated code), return unformatted
    return code
  }
}

/**
 * Generate TypeScript code from Python (async, formatted with Prettier)
 */
export async function generateAsync(
  input: string | ParseResult,
  options: GeneratorOptions = {}
): Promise<GeneratedCode> {
  const result = generate(input, options)
  const formattedCode = await formatCode(result.code)

  return {
    ...result,
    code: formattedCode
  }
}

/**
 * Transpile Python to TypeScript (async, formatted with Prettier)
 */
export async function transpileAsync(
  python: string,
  options: GeneratorOptions = {}
): Promise<string> {
  const result = await generateAsync(python, options)
  return result.code
}
/* v8 ignore stop */

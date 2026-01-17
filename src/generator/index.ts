import { transform, type TransformResult } from "../transformer/index.js"
import type { ParseResult } from "../parser/index.js"
import * as prettier from "prettier"

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
  runtimeImportPath: "python2ts/runtime"
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
    const importPath = opts.runtimeImportPath ?? "python2ts/runtime"
    runtimeImport = `import { py } from '${importPath}';`
  }

  let code = result.code

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
 * Transpile Python to TypeScript (sync, unformatted)
 * For formatted output, use transpileAsync()
 */
export function transpile(python: string, options: GeneratorOptions = {}): string {
  return generate(python, options).code
}

/**
 * Format TypeScript code using Prettier
 */
export async function formatCode(code: string): Promise<string> {
  try {
    return await prettier.format(code, prettierOptions)
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

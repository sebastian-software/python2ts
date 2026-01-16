import { transform, type TransformResult } from "../transformer/index.js"
import type { ParseResult } from "../parser/index.js"

export interface GeneratorOptions {
  includeRuntime?: boolean
  runtimeImportPath?: string
  /** Whether to emit TypeScript type annotations. Defaults to true. */
  emitTypes?: boolean
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

export function generate(
  input: string | ParseResult,
  options: GeneratorOptions = {}
): GeneratedCode {
  const opts = { ...defaultOptions, ...options }
  const result: TransformResult = transform(input, { emitTypes: opts.emitTypes ?? true })

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

export function transpile(python: string, options: GeneratorOptions = {}): string {
  return generate(python, options).code
}

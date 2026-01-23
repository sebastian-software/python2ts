import type { SyntaxNode } from "@lezer/common"

/**
 * Context passed through all transformation functions.
 * Tracks state like scope, runtime dependencies, and indentation.
 */
export interface TransformContext {
  source: string
  indentLevel: number
  usesRuntime: Set<string>
  /** Stack of scopes - each scope is a set of variable names declared in that scope */
  scopeStack: Set<string>[]
  /** Set of class names defined in this module (for adding 'new' on instantiation) */
  definedClasses: Set<string>
  /** Whether currently processing an abstract class (ABC) */
  isAbstractClass?: boolean
  /** Depth counter for function bodies (0 = module level, 1+ = inside function) */
  insideFunctionBody: number
  /** Depth counter for try blocks (0 = not in try, 1+ = inside try block) */
  insideTryBlock: number
  /** Imports found inside function bodies that need to be hoisted to module level */
  hoistedImports: string[]
}

/**
 * Result of transforming Python source to TypeScript.
 */
export interface TransformResult {
  code: string
  usesRuntime: Set<string>
  hoistedImports: string[]
}

/**
 * Function signature for recursive node transformation.
 * Used to avoid circular dependencies between handler modules.
 */
export type NodeTransformer = (node: SyntaxNode, ctx: TransformContext) => string

/**
 * Parsed docstring structure for JSDoc conversion.
 */
export interface ParsedDocstring {
  description: string
  params: { name: string; description: string }[]
  returns: string | null
  throws: { type: string; description: string }[]
}

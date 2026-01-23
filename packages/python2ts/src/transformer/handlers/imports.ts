import type { SyntaxNode } from "@lezer/common"
import { getNodeText, getChildren } from "../../parser/index.js"
import type { TransformContext } from "../types.js"

/** Modules whose imports should be ignored (type-only modules) */
const TYPING_MODULES = new Set([
  "typing",
  "typing_extensions",
  "collections.abc",
  "__future__",
  "abc"
])

/** Runtime modules whose imports should be stripped (provided by runtime) */
const RUNTIME_MODULES = new Set([
  "itertools",
  "collections",
  "math",
  "random",
  "json",
  "os",
  "datetime",
  "re",
  "string",
  "functools"
])

/**
 * Transform Python import statement to JavaScript.
 */
export function transformImportStatement(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node)

  // Determine if this is a "from X import Y" or "import X" style
  const hasFrom = children.some((c) => c.name === "from")

  // If we're inside a try block, use dynamic import (static imports can't be in try blocks)
  if (ctx.insideTryBlock > 0) {
    if (hasFrom) {
      return transformFromImportDynamic(children, ctx)
    }
    return transformSimpleImportDynamic(children, ctx)
  }

  let importCode: string
  if (hasFrom) {
    importCode = transformFromImport(children, ctx)
  } else {
    importCode = transformSimpleImport(children, ctx)
  }

  // If we're inside a function body, hoist the import to module level
  if (ctx.insideFunctionBody > 0 && importCode) {
    ctx.hoistedImports.push(importCode)
    return "" // Don't include the import in the function body
  }

  return importCode
}

/**
 * Transform simple import statement.
 * import os -> import * as os from "os"
 * import numpy as np -> import * as np from "numpy"
 */
function transformSimpleImport(children: SyntaxNode[], ctx: TransformContext): string {
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
      if (nextChild?.name === "as") {
        const aliasChild = children[i + 2]
        if (aliasChild?.name === "VariableName") {
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

  // Filter out runtime modules (provided by py runtime) and typing modules
  const filteredNames = names.filter(
    ({ module }) => !RUNTIME_MODULES.has(module) && !TYPING_MODULES.has(module)
  )

  if (filteredNames.length === 0) {
    return ""
  }

  // Generate import statements
  return filteredNames
    .map(({ module, alias }) => {
      const importName = alias ?? module
      return `import * as ${importName} from "${module}"`
    })
    .join("\n")
}

/**
 * Transform simple import to dynamic import (for try blocks).
 * import ctypes -> const ctypes = await import("ctypes")
 */
function transformSimpleImportDynamic(children: SyntaxNode[], ctx: TransformContext): string {
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

      const nextChild = children[i + 1]
      if (nextChild?.name === "as") {
        const aliasChild = children[i + 2]
        if (aliasChild?.name === "VariableName") {
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

  // Filter out runtime modules and typing modules
  const filteredNames = names.filter(
    ({ module }) => !RUNTIME_MODULES.has(module) && !TYPING_MODULES.has(module)
  )

  if (filteredNames.length === 0) {
    return ""
  }

  // Generate dynamic import statements
  return filteredNames
    .map(({ module, alias }) => {
      const importName = alias ?? module
      return `const ${importName} = await import("${module}")`
    })
    .join("\n")
}

/**
 * Transform from-import to dynamic import (for try blocks).
 * from X import Y -> const { Y } = await import("X")
 */
function transformFromImportDynamic(children: SyntaxNode[], ctx: TransformContext): string {
  // First pass: find the module name
  let moduleName = ""
  for (const child of children) {
    if (child.name === "VariableName") {
      const prevChild = children[children.indexOf(child) - 1]
      if (prevChild?.name === "from" || prevChild?.name === ".") {
        moduleName = getNodeText(child, ctx.source)
        break
      }
    }
  }

  // Skip typing and runtime modules
  if (TYPING_MODULES.has(moduleName) || RUNTIME_MODULES.has(moduleName)) {
    return ""
  }

  // Collect imported names
  const importedNames: { name: string; alias: string | null }[] = []
  let afterImport = false

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (!child) continue

    if (child.name === "import") {
      afterImport = true
      continue
    }

    if (afterImport && child.name === "VariableName") {
      const name = getNodeText(child, ctx.source)
      const nextChild = children[i + 1]
      if (nextChild?.name === "as") {
        const aliasChild = children[i + 2]
        if (aliasChild?.name === "VariableName") {
          importedNames.push({ name, alias: getNodeText(aliasChild, ctx.source) })
          i += 2
          continue
        }
      }
      importedNames.push({ name, alias: null })
    }
  }

  if (importedNames.length === 0) {
    return ""
  }

  // Generate destructuring assignment from dynamic import
  const bindings = importedNames
    .map(({ name, alias }) => (alias ? `${name}: ${alias}` : name))
    .join(", ")
  return `const { ${bindings} } = await import("${moduleName}")`
}

/**
 * Transform from-import statement.
 * from os import path -> import { path } from "os"
 * from os import path, getcwd -> import { path, getcwd } from "os"
 * from collections import defaultdict as dd -> import { defaultdict as dd } from "collections"
 * from math import * -> import * from "math"
 * from . import utils -> import * as utils from "./utils"
 * from ..utils import helper -> import { helper } from "../utils"
 */
function transformFromImport(children: SyntaxNode[], ctx: TransformContext): string {
  // First pass: find the module name to check if it's a typing module
  let preCheckModule = ""
  for (const child of children) {
    if (child.name === "VariableName") {
      const prevChild = children[children.indexOf(child) - 1]
      // Check if this is after "from" (not after "import")
      if (prevChild?.name === "from" || prevChild?.name === ".") {
        preCheckModule = getNodeText(child, ctx.source)
        break
      }
    }
  }

  // Strip typing module imports entirely - TypeScript has its own type system
  if (TYPING_MODULES.has(preCheckModule)) {
    return ""
  }

  // Strip runtime module imports - provided by py runtime
  if (RUNTIME_MODULES.has(preCheckModule)) {
    return ""
  }

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
        if (nextChild?.name === "as") {
          const aliasChild = children[i + 2]
          if (aliasChild?.name === "VariableName") {
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
      modulePath += imports[0]?.name ?? ""
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
      const importName = imp.alias ?? imp.name
      return `import * as ${importName} from "${modulePath}"`
    }
  }

  const importNames = imports
    .map(({ name, alias }) => (alias ? `${name} as ${alias}` : name))
    .join(", ")

  return `import { ${importNames} } from "${modulePath}"`
}

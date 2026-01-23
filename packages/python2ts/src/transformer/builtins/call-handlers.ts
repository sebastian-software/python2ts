import type { SyntaxNode } from "@lezer/common"
import { getChildren } from "../../parser/index.js"
import type { TransformContext, NodeTransformer } from "../types.js"

/**
 * Handler configuration for builtin functions.
 * Simple handlers just need runtime and output pattern.
 */
interface SimpleHandler {
  runtime: string
  output: string // Use {args} as placeholder
  isAsync?: boolean
  needsNew?: boolean
}

/**
 * Simple builtin handlers that follow the pattern:
 * ctx.usesRuntime.add(runtime); return output.replace("{args}", args)
 */
const SIMPLE_BUILTINS: Record<string, SimpleHandler> = {
  // Core builtins
  len: { runtime: "len", output: "len({args})" },
  range: { runtime: "range", output: "range({args})" },
  int: { runtime: "int", output: "int({args})" },
  float: { runtime: "float", output: "float({args})" },
  str: { runtime: "str", output: "str({args})" },
  bool: { runtime: "bool", output: "bool({args})" },
  abs: { runtime: "abs", output: "abs({args})" },
  min: { runtime: "min", output: "min({args})" },
  max: { runtime: "max", output: "max({args})" },
  sum: { runtime: "sum", output: "sum({args})" },
  list: { runtime: "list", output: "list({args})" },
  dict: { runtime: "dict", output: "dict({args})" },
  set: { runtime: "set", output: "set({args})" },
  tuple: { runtime: "tuple", output: "tuple({args})" },
  enumerate: { runtime: "enumerate", output: "enumerate({args})" },
  zip: { runtime: "zip", output: "zip({args})" },
  sorted: { runtime: "sorted", output: "sorted({args})" },
  reversed: { runtime: "reversed", output: "reversed({args})" },
  type: { runtime: "type", output: "type({args})" },
  input: { runtime: "input", output: "input({args})" },
  ord: { runtime: "ord", output: "ord({args})" },
  chr: { runtime: "chr", output: "chr({args})" },
  all: { runtime: "all", output: "all({args})" },
  any: { runtime: "any", output: "any({args})" },
  map: { runtime: "map", output: "map({args})" },
  filter: { runtime: "filter", output: "filter({args})" },
  repr: { runtime: "repr", output: "repr({args})" },
  round: { runtime: "round", output: "round({args})" },
  divmod: { runtime: "divmod", output: "divmod({args})" },
  hex: { runtime: "hex", output: "hex({args})" },
  oct: { runtime: "oct", output: "oct({args})" },
  bin: { runtime: "bin", output: "bin({args})" },
  getattr: { runtime: "getattr", output: "getattr({args})" },
  hasattr: { runtime: "hasattr", output: "hasattr({args})" },
  setattr: { runtime: "setattr", output: "setattr({args})" },

  // itertools
  chain: { runtime: "itertools/chain", output: "chain({args})" },
  combinations: { runtime: "itertools/combinations", output: "combinations({args})" },
  permutations: { runtime: "itertools/permutations", output: "permutations({args})" },
  product: { runtime: "itertools/product", output: "product({args})" },
  cycle: { runtime: "itertools/cycle", output: "cycle({args})" },
  repeat: { runtime: "itertools/repeat", output: "repeat({args})" },
  islice: { runtime: "itertools/islice", output: "islice({args})" },
  takewhile: { runtime: "itertools/takeWhile", output: "takeWhile({args})" },
  dropwhile: { runtime: "itertools/dropWhile", output: "dropWhile({args})" },
  zip_longest: { runtime: "itertools/zipLongest", output: "zipLongest({args})" },
  compress: { runtime: "itertools/compress", output: "compress({args})" },
  filterfalse: { runtime: "itertools/filterFalse", output: "filterFalse({args})" },
  accumulate: { runtime: "itertools/accumulate", output: "accumulate({args})" },
  groupby: { runtime: "itertools/groupby", output: "groupby({args})" },
  count: { runtime: "itertools/count", output: "count({args})" },
  tee: { runtime: "itertools/tee", output: "tee({args})" },
  pairwise: { runtime: "itertools/pairwise", output: "pairwise({args})" },
  combinations_with_replacement: {
    runtime: "itertools/combinationsWithReplacement",
    output: "combinationsWithReplacement({args})"
  },

  // collections
  Counter: { runtime: "collections/Counter", output: "new Counter({args})", needsNew: true },
  defaultdict: { runtime: "collections/defaultdict", output: "defaultdict({args})" },
  deque: { runtime: "collections/deque", output: "new deque({args})", needsNew: true },

  // functools
  partial: { runtime: "functools/partial", output: "partial({args})" },
  reduce: { runtime: "functools/reduce", output: "reduce({args})" },
  lru_cache: { runtime: "functools/lruCache", output: "lruCache({args})" },
  cache: { runtime: "functools/cache", output: "cache({args})" },
  wraps: { runtime: "functools/wraps", output: "wraps({args})" },
  cmp_to_key: { runtime: "functools/cmpToKey", output: "cmpToKey({args})" },
  total_ordering: { runtime: "functools/totalOrdering", output: "totalOrdering({args})" },

  // json
  dumps: { runtime: "json/dumps", output: "dumps({args})" },
  loads: { runtime: "json/loads", output: "loads({args})" },
  dump: { runtime: "json/dump", output: "dump({args})" },
  load: { runtime: "json/load", output: "load({args})" },

  // datetime
  datetime: { runtime: "datetime/datetime", output: "new datetime({args})", needsNew: true },
  date: { runtime: "datetime/date", output: "new date({args})", needsNew: true },
  time: { runtime: "datetime/time", output: "new time({args})", needsNew: true },
  timedelta: { runtime: "datetime/timedelta", output: "new timedelta({args})", needsNew: true },

  // string module
  Template: { runtime: "string/Template", output: "new Template({args})", needsNew: true },
  capwords: { runtime: "string/capWords", output: "capWords({args})" },

  // glob module - async
  glob: { runtime: "glob/glob", output: "await glob({args})", isAsync: true },
  iglob: { runtime: "glob/iglob", output: "await iglob({args})", isAsync: true },
  rglob: { runtime: "glob/rglob", output: "await rglob({args})", isAsync: true },

  // shutil module - async
  copy: { runtime: "shutil/copy", output: "await copy({args})", isAsync: true },
  copy2: { runtime: "shutil/copy2", output: "await copy2({args})", isAsync: true },
  copytree: { runtime: "shutil/copytree", output: "await copytree({args})", isAsync: true },
  move: { runtime: "shutil/move", output: "await move({args})", isAsync: true },
  rmtree: { runtime: "shutil/rmtree", output: "await rmtree({args})", isAsync: true },
  which: { runtime: "shutil/which", output: "await which({args})", isAsync: true },

  // tempfile module - async
  mkstemp: { runtime: "tempfile/mkstemp", output: "await mkstemp({args})", isAsync: true },
  mkdtemp: { runtime: "tempfile/mkdtemp", output: "await mkdtemp({args})", isAsync: true },
  NamedTemporaryFile: {
    runtime: "tempfile/NamedTemporaryFile",
    output: "await NamedTemporaryFile.create({args})",
    isAsync: true
  },
  TemporaryDirectory: {
    runtime: "tempfile/TemporaryDirectory",
    output: "await TemporaryDirectory.create({args})",
    isAsync: true
  },

  // pathlib
  Path: { runtime: "pathlib/Path", output: "new Path({args})", needsNew: true }
}

/**
 * Handle isinstance() call with special tuple-to-array conversion
 */
function handleIsinstance(
  args: string,
  argList: SyntaxNode | undefined,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string {
  ctx.usesRuntime.add("isinstance")

  // Special handling: if second arg is a tuple, convert to array for multiple type check
  if (argList) {
    const argChildren = getChildren(argList).filter(
      (c) => c.name !== "(" && c.name !== ")" && c.name !== ","
    )
    if (argChildren.length >= 2) {
      const firstArg = argChildren[0]
      const secondArg = argChildren[1]
      if (firstArg && secondArg?.name === "TupleExpression") {
        // Convert tuple to array literal
        const tupleChildren = getChildren(secondArg).filter(
          (c) => c.name !== "(" && c.name !== ")" && c.name !== ","
        )
        const typesCodes = tupleChildren.map((el) => transformNode(el, ctx))
        return `isinstance(${transformNode(firstArg, ctx)}, [${typesCodes.join(", ")}])`
      }
    }
  }
  return `isinstance(${args})`
}

/**
 * Handle builtin function call.
 * Returns the transformed code, or null if not a builtin.
 */
export function handleBuiltinCall(
  calleeName: string,
  args: string,
  argList: SyntaxNode | undefined,
  ctx: TransformContext,
  transformNode: NodeTransformer
): string | null {
  // Special case: print -> console.log (no runtime needed)
  if (calleeName === "print") {
    return `console.log(${args})`
  }

  // Special case: isinstance needs complex handling
  if (calleeName === "isinstance") {
    return handleIsinstance(args, argList, ctx, transformNode)
  }

  // Check simple builtins registry
  const handler = SIMPLE_BUILTINS[calleeName]
  if (handler) {
    ctx.usesRuntime.add(handler.runtime)
    return handler.output.replace("{args}", args)
  }

  return null
}

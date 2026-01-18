/**
 * Python Runtime Library for TypeScript
 *
 * Import styles:
 *
 * 1. Builtins (global Python functions):
 *    import { len, range, sorted, min, max } from "pythonlib"
 *
 * 2. Module imports (like Python):
 *    import { dump, loads } from "pythonlib/json"
 *    import { match, search, sub } from "pythonlib/re"
 *    import { chain, combinations } from "pythonlib/itertools"
 *    import { Counter, defaultdict } from "pythonlib/collections"
 *
 * 3. Module namespaces (alternative):
 *    import { json, re, itertools } from "pythonlib"
 *    json.dump(...), re.match(...), itertools.chain(...)
 */

// =============================================================================
// Module imports (for namespace exports)
// =============================================================================

import * as itertoolsModule from "./itertools.js"
import * as functoolsModule from "./functools.js"
import * as collectionsModule from "./collections.js"
import * as mathModule from "./math.js"
import * as randomModule from "./random.js"
import * as jsonModule from "./json.js"
import * as osModule from "./os.js"
import * as datetimeModule from "./datetime.js"
import * as reModule from "./re.js"
import * as stringModule from "./string.js"
import * as core from "./core.js"
import * as builtins from "./builtins.js"
import { list as listMethods } from "./list.js"
import { dict as dictMethods } from "./dict.js"
import { set as setMethods } from "./set.js"

// =============================================================================
// Module namespace exports (for: import { itertools } from "pythonlib")
// =============================================================================

export const itertools = itertoolsModule
export const functools = functoolsModule
export const collections = collectionsModule
export const math = mathModule
export const random = randomModule
export const json = jsonModule
export const os = osModule
export const datetime = datetimeModule
export const re = reModule
export const string = {
  ...stringModule.string,
  ascii_lowercase: stringModule.ascii_lowercase,
  ascii_uppercase: stringModule.ascii_uppercase,
  ascii_letters: stringModule.ascii_letters,
  digits: stringModule.digits,
  hexdigits: stringModule.hexdigits,
  octdigits: stringModule.octdigits,
  punctuation: stringModule.punctuation,
  whitespace: stringModule.whitespace,
  printable: stringModule.printable,
  capwords: stringModule.capwords,
  Template: stringModule.Template
}

// =============================================================================
// Core built-in types with methods (list, dict, set)
// =============================================================================

type ListConstructor = {
  <T>(iterable?: Iterable<T>): T[]
} & typeof listMethods

type DictConstructor = {
  <K, V>(entries?: Iterable<[K, V]>): Map<K, V>
} & typeof dictMethods

type SetConstructor = {
  <T>(iterable?: Iterable<T>): Set<T>
} & typeof setMethods

export const list: ListConstructor = Object.assign(
  <T>(iterable?: Iterable<T>): T[] => builtins.list(iterable),
  listMethods
)

export const dict: DictConstructor = Object.assign(
  <K, V>(entries?: Iterable<[K, V]>): Map<K, V> => builtins.dict(entries),
  dictMethods
)

export const set: SetConstructor = Object.assign(
  <T>(iterable?: Iterable<T>): Set<T> => builtins.set(iterable),
  setMethods
)

// =============================================================================
// Core operations (Python-specific semantics)
// =============================================================================

export const floordiv = core.floordiv
export const mod = core.mod
export const divmod = core.divmod
export const sprintf = core.sprintf
export const strFormat = core.strFormat
export const slice = core.slice
export const at = core.at
export const contains = core.contains
export const is = core.is
export { repeat as repeatValue } from "./core.js"
export { pow } from "./core.js"

// =============================================================================
// Built-in functions (Python global scope)
// =============================================================================

// Iteration
export const range = builtins.range
export const enumerate = builtins.enumerate
export const zip = builtins.zip
export const iter = builtins.iter
export const reversed = builtins.reversed
export const sorted = builtins.sorted
export const map = builtins.map
export const filter = builtins.filter

// Collection constructors
export const tuple = builtins.tuple

// Aggregation
export const len = builtins.len
export const abs = builtins.abs
export const min = builtins.min
export const max = builtins.max
export const sum = builtins.sum
export const all = builtins.all
export const any = builtins.any
export const round = builtins.round

// Character/number conversion
export const ord = builtins.ord
export const chr = builtins.chr
export const hex = builtins.hex
export const oct = builtins.oct
export const bin = builtins.bin

// Type conversion
export const int = builtins.int
export const float = builtins.float
export const str = builtins.str
export const repr = builtins.repr
export const bool = builtins.bool
export const ascii = builtins.ascii

// Type checking & misc
export const isinstance = builtins.isinstance
export const type = builtins.type
export const input = builtins.input
export const format = builtins.format

// =============================================================================
// Legacy py.* namespace (deprecated, for backwards compatibility)
// =============================================================================

export const py = {
  // Namespaced methods
  string: stringModule.string,
  list,
  dict,
  set,

  // Core operations
  floordiv: core.floordiv,
  pow: core.pow,
  mod: core.mod,
  divmod: core.divmod,
  sprintf: core.sprintf,
  strFormat: core.strFormat,
  slice: core.slice,
  at: core.at,
  repeat: core.repeat,
  in: core.contains,
  is: core.is,

  // Iterables
  range: builtins.range,
  enumerate: builtins.enumerate,
  zip: builtins.zip,
  iter: builtins.iter,
  reversed: builtins.reversed,
  sorted: builtins.sorted,
  map: builtins.map,
  filter: builtins.filter,

  // Collection constructors
  tuple: builtins.tuple,

  // Built-in functions
  len: builtins.len,
  abs: builtins.abs,
  min: builtins.min,
  max: builtins.max,
  sum: builtins.sum,
  all: builtins.all,
  any: builtins.any,
  round: builtins.round,
  ord: builtins.ord,
  chr: builtins.chr,
  hex: builtins.hex,
  oct: builtins.oct,
  bin: builtins.bin,

  // Type conversions
  int: builtins.int,
  float: builtins.float,
  str: builtins.str,
  repr: builtins.repr,
  bool: builtins.bool,
  ascii: builtins.ascii,

  // Type checking
  isinstance: builtins.isinstance,
  type: builtins.type,
  input: builtins.input,
  format: builtins.format,

  // Modules
  itertools: itertoolsModule,
  functools: functoolsModule,
  math: mathModule,
  random: randomModule,
  json: jsonModule,
  os: osModule,
  datetime: datetimeModule,
  re: reModule,

  // collections
  Counter: collectionsModule.Counter,
  defaultdict: collectionsModule.defaultdict,
  deque: collectionsModule.deque,

  // string module
  Template: stringModule.Template,
  ascii_lowercase: stringModule.ascii_lowercase,
  ascii_uppercase: stringModule.ascii_uppercase,
  ascii_letters: stringModule.ascii_letters,
  digits: stringModule.digits,
  hexdigits: stringModule.hexdigits,
  octdigits: stringModule.octdigits,
  punctuation: stringModule.punctuation,
  whitespace: stringModule.whitespace,
  printable: stringModule.printable,
  capwords: stringModule.capwords
}

// Set the py reference for builtins (needed for str() and repr())
builtins._setPyRef(py)

export default py

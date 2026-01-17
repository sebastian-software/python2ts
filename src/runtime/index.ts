/**
 * Python Runtime Library for TypeScript
 *
 * Provides Python-compatible functions and operations
 * that don't have direct JavaScript equivalents.
 *
 * Organized into namespaces:
 * - py.string.* - String methods (join, split, strip, etc.)
 * - py.list()   - List constructor, also py.list.* for methods
 * - py.dict()   - Dict constructor, also py.dict.* for methods
 * - py.set()    - Set constructor, also py.set.* for methods
 * - py.*        - Core functions and built-ins
 */

import { string } from "./string.js"
import { list as listMethods } from "./list.js"
import { dict as dictMethods } from "./dict.js"
import { set as setMethods } from "./set.js"
import * as core from "./core.js"
import * as builtins from "./builtins.js"
import * as itertools from "./itertools.js"
import * as math from "./math.js"
import * as random from "./random.js"
import * as json from "./json.js"
import { Counter, defaultdict, deque } from "./collections.js"

// Create callable objects that are both functions and have methods
// This allows py.list() as constructor and py.list.remove() as method

type ListConstructor = {
  <T>(iterable?: Iterable<T>): T[]
} & typeof listMethods

type DictConstructor = {
  <K, V>(entries?: Iterable<[K, V]>): Map<K, V>
} & typeof dictMethods

type SetConstructor = {
  <T>(iterable?: Iterable<T>): Set<T>
} & typeof setMethods

const list: ListConstructor = Object.assign(
  <T>(iterable?: Iterable<T>): T[] => builtins.list(iterable),
  listMethods
)

const dict: DictConstructor = Object.assign(
  <K, V>(entries?: Iterable<[K, V]>): Map<K, V> => builtins.dict(entries),
  dictMethods
)

const set: SetConstructor = Object.assign(
  <T>(iterable?: Iterable<T>): Set<T> => builtins.set(iterable),
  setMethods
)

export const py = {
  // ============================================================
  // Namespaced Methods (callable as constructors + have methods)
  // ============================================================
  string,
  list,
  dict,
  set,

  // ============================================================
  // Core Operations (arithmetic with Python semantics)
  // ============================================================
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

  // ============================================================
  // Iterables
  // ============================================================
  range: builtins.range,
  enumerate: builtins.enumerate,
  zip: builtins.zip,
  iter: builtins.iter,
  reversed: builtins.reversed,
  sorted: builtins.sorted,
  map: builtins.map,
  filter: builtins.filter,

  // ============================================================
  // Other Collection Constructor
  // ============================================================
  tuple: builtins.tuple,

  // ============================================================
  // Built-in Functions
  // ============================================================
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

  // ============================================================
  // Type Conversions
  // ============================================================
  int: builtins.int,
  float: builtins.float,
  str: builtins.str,
  repr: builtins.repr,
  bool: builtins.bool,
  ascii: builtins.ascii,

  // ============================================================
  // Type Checking
  // ============================================================
  isinstance: builtins.isinstance,
  type: builtins.type,
  input: builtins.input,

  // ============================================================
  // Formatting
  // ============================================================
  format: builtins.format,

  // ============================================================
  // itertools module
  // ============================================================
  itertools,

  // ============================================================
  // collections module
  // ============================================================
  Counter,
  defaultdict,
  deque,

  // ============================================================
  // math module
  // ============================================================
  math,

  // ============================================================
  // random module
  // ============================================================
  random,

  // ============================================================
  // json module
  // ============================================================
  json
}

// Set the py reference for builtins (needed for str() and repr())
builtins._setPyRef(py)

export default py

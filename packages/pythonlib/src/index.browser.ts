/**
 * Python Built-in Functions for TypeScript - Browser version
 *
 * This module provides Python's built-in functions that are always available
 * without imports. These are the fundamental operations for working with data
 * in Python, including iteration (range, enumerate, zip), aggregation (len,
 * sum, min, max), type conversion (int, str, bool), and more.
 *
 * @example
 * ```typescript
 * // Direct imports
 * import { len, range, sorted, min, max } from "pythonlib"
 *
 * // Module imports (like Python)
 * import { chain, combinations } from "pythonlib/itertools"
 * import { Counter, defaultdict } from "pythonlib/collections"
 *
 * // Module namespaces
 * import { json, re, itertools } from "pythonlib"
 * ```
 *
 * @see {@link https://docs.python.org/3/library/functions.html | Python Built-in Functions}
 * @module
 */

/* v8 ignore start -- browser version tested via browser tests @preserve */

// =============================================================================
// Module imports (for namespace exports) - Browser versions
// =============================================================================

import * as itertoolsModule from "./itertools.js"
import * as functoolsModule from "./functools.js"
import * as collectionsModule from "./collections.js"
import * as mathModule from "./math.js"
import * as randomModule from "./random.js"
import * as jsonModule from "./json.js"
import * as osModule from "./os.browser.js"
import * as datetimeModule from "./datetime.js"
import * as reModule from "./re.js"
import * as stringModule from "./string.js"
import * as sysModule from "./sys.js"
import * as timeModule from "./time.js"
import * as copyModule from "./copy.js"
import * as base64Module from "./base64.js"
import * as uuidModule from "./uuid.js"
import * as hashlibModule from "./hashlib.js"
import * as pathlibModule from "./pathlib.browser.js"
import * as globModule from "./glob.browser.js"
import * as shutilModule from "./shutil.browser.js"
import * as tempfileModule from "./tempfile.browser.js"
import * as subprocessModule from "./subprocess.js"
import * as urllibModule from "./urllib.js"
import * as loggingModule from "./logging.browser.js"
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
  asciiLowercase: stringModule.asciiLowercase,
  asciiUppercase: stringModule.asciiUppercase,
  asciiLetters: stringModule.asciiLetters,
  digits: stringModule.digits,
  hexDigits: stringModule.hexDigits,
  octDigits: stringModule.octDigits,
  punctuation: stringModule.punctuation,
  whitespace: stringModule.whitespace,
  printable: stringModule.printable,
  capWords: stringModule.capWords,
  Template: stringModule.Template
}
export const sys = sysModule
export const time = timeModule
export const copy = copyModule
export const base64 = base64Module
export const uuid = uuidModule
export const hashlib = hashlibModule
export const pathlib = pathlibModule
export const glob = globModule
export const shutil = shutilModule
export const tempfile = tempfileModule
export const subprocess = subprocessModule
export const urllib = urllibModule
export const logging = loggingModule

// =============================================================================
// Core built-in types with methods (list, dict, set)
// =============================================================================

type ListConstructor = (<T>(iterable?: Iterable<T>) => T[]) & typeof listMethods

type DictConstructor = (<K, V>(entries?: Iterable<[K, V]>) => Map<K, V>) & typeof dictMethods

type SetConstructor = (<T>(iterable?: Iterable<T>) => Set<T>) & typeof setMethods

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

export const floorDiv = core.floorDiv
export const mod = core.mod
export const divMod = core.divMod
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

// Attribute access
export const getattr = builtins.getattr
export const hasattr = builtins.hasattr
export const setattr = builtins.setattr

/* v8 ignore stop */

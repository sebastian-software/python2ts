/**
 * Central mapping from Python snake_case names to JavaScript camelCase names.
 * This is the single source of truth for name transformations.
 */

/**
 * Maps Python snake_case identifiers to JavaScript camelCase equivalents.
 * Only includes names that need transformation (names already in camelCase
 * or single-word names don't need mapping).
 */
export const PYTHON_TO_JS_NAMES: Record<string, string> = {
  // ============================================================================
  // functools module
  // ============================================================================
  lru_cache: "lruCache",
  cache_info: "cacheInfo",
  cache_clear: "cacheClear",
  partialmethod: "partialMethod",
  singledispatch: "singleDispatch",
  attrgetter: "attrGetter",
  itemgetter: "itemGetter",
  methodcaller: "methodCaller",
  cmp_to_key: "cmpToKey",
  total_ordering: "totalOrdering",

  // ============================================================================
  // itertools module
  // ============================================================================
  zip_longest: "zipLongest",
  takewhile: "takeWhile",
  dropwhile: "dropWhile",
  filterfalse: "filterFalse",
  combinations_with_replacement: "combinationsWithReplacement",

  // ============================================================================
  // collections module (deque methods)
  // ============================================================================
  appendleft: "appendLeft",
  popleft: "popLeft",
  extendleft: "extendLeft",

  // ============================================================================
  // datetime module
  // ============================================================================
  total_seconds: "totalSeconds",
  fromtimestamp: "fromTimestamp",
  fromisoformat: "fromIsoFormat",
  fromordinal: "fromOrdinal",
  toordinal: "toOrdinal",
  isoweekday: "isoWeekday",
  isocalendar: "isoCalendar",
  isoformat: "isoFormat",
  utcnow: "utcNow",
  utcfromtimestamp: "utcFromTimestamp",

  // ============================================================================
  // random module
  // ============================================================================
  randint: "randInt",
  randrange: "randRange",
  betavariate: "betaVariate",
  expovariate: "expoVariate",
  gammavariate: "gammaVariate",
  lognormvariate: "logNormVariate",
  vonmisesvariate: "vonMisesVariate",
  paretovariate: "paretoVariate",
  weibullvariate: "weibullVariate",
  normalvariate: "normalVariate",

  // ============================================================================
  // string module (constants)
  // ============================================================================
  ascii_lowercase: "asciiLowercase",
  ascii_uppercase: "asciiUppercase",
  ascii_letters: "asciiLetters",
  hexdigits: "hexDigits",
  octdigits: "octDigits",

  // ============================================================================
  // string module (methods)
  // ============================================================================
  safe_substitute: "safeSubstitute",
  get_identifiers: "getIdentifiers",
  capwords: "capWords",
  startswith: "startsWith",
  endswith: "endsWith",
  isalpha: "isAlpha",
  isdigit: "isDigit",
  isalnum: "isAlnum",
  isspace: "isSpace",
  isupper: "isUpper",
  islower: "isLower",
  lstrip: "lStrip",
  rstrip: "rStrip",
  zfill: "zFill",
  ljust: "lJust",
  rjust: "rJust",
  rpartition: "rPartition",
  swapcase: "swapCase",
  rfind: "rFind",
  rindex: "rIndex",
  rsplit: "rSplit",

  // ============================================================================
  // os module (constants)
  // ============================================================================
  altsep: "altSep",
  pathsep: "pathSep",
  linesep: "lineSep",
  curdir: "curDir",
  pardir: "parDir",
  extsep: "extSep",

  // ============================================================================
  // os.path module
  // ============================================================================
  splitext: "splitExt",
  extname: "extName",
  isabs: "isAbs",
  normpath: "normPath",
  abspath: "absPath",
  realpath: "realPath",
  relpath: "relPath",
  commonpath: "commonPath",
  expanduser: "expandUser",
  expandvars: "expandVars",
  isfile: "isFile",
  isdir: "isDir",
  islink: "isLink",
  getsize: "getSize",
  getmtime: "getMtime",
  getatime: "getAtime",
  getctime: "getCtime",

  // ============================================================================
  // os module (functions)
  // ============================================================================
  getcwd: "getCwd",
  getcwdb: "getCwdb",
  listdir: "listDir",
  makedirs: "makeDirs",
  removedirs: "removeDirs",

  // ============================================================================
  // re module
  // ============================================================================
  groupdict: "groupDict",
  groupindex: "groupIndex",
  lastindex: "lastIndex",
  lastgroup: "lastGroup",
  fullmatch: "fullMatch",
  findall: "findAll",
  finditer: "findIter",

  // ============================================================================
  // dict module
  // ============================================================================
  setdefault: "setDefault",
  popitem: "popItem",
  fromkeys: "fromKeys",

  // ============================================================================
  // set module
  // ============================================================================
  issubset: "isSubset",
  issuperset: "isSuperset",
  isdisjoint: "isDisjoint",

  // ============================================================================
  // core module
  // ============================================================================
  floordiv: "floorDiv",
  divmod: "divMod",

  // ============================================================================
  // hashlib module
  // ============================================================================
  pbkdf2_hmac: "pbkdf2Hmac",
  compare_digest: "compareDigest",
  file_digest: "fileDigest",
  new: "newHash"
}

/**
 * Convert a Python snake_case name to JavaScript camelCase.
 * Returns the original name if no mapping exists.
 */
export function toJsName(pythonName: string): string {
  return PYTHON_TO_JS_NAMES[pythonName] ?? pythonName
}

/**
 * Convert a JavaScript camelCase name back to Python snake_case.
 * Returns the original name if no mapping exists.
 */
export function toPythonName(jsName: string): string {
  for (const [python, js] of Object.entries(PYTHON_TO_JS_NAMES)) {
    if (js === jsName) {
      return python
    }
  }
  return jsName
}

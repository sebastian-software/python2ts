/**
 * Python re module for TypeScript
 *
 * Provides regular expression matching operations matching Python's re module,
 * including match, search, findall, sub, and split functions.
 *
 * @see {@link https://docs.python.org/3/library/re.html | Python re documentation}
 * @module
 */

// ============================================================================
// Flags
// ============================================================================

/** Ignore case */
export const IGNORECASE = 2
export const I = IGNORECASE

/** Multi-line mode */
export const MULTILINE = 8
export const M = MULTILINE

/** Dot matches all (including newline) */
export const DOTALL = 16
export const S = DOTALL

/** Unicode matching (always on in JS) */
export const UNICODE = 32
export const U = UNICODE

/** ASCII-only matching */
export const ASCII = 256
export const A = ASCII

// ============================================================================
// Match object
// ============================================================================

export class Match {
  private _match: RegExpExecArray
  private _string: string
  private _pattern: Pattern
  private _pos: number
  private _endpos: number

  constructor(match: RegExpExecArray, string: string, pattern: Pattern, pos = 0, endpos?: number) {
    this._match = match
    this._string = string
    this._pattern = pattern
    this._pos = pos
    this._endpos = endpos ?? string.length
  }

  /** Return the string matched by the RE */
  group(groupNum: number | string = 0): string | undefined {
    if (typeof groupNum === "number") {
      return this._match[groupNum]
    }
    // Named group
    return this._match.groups?.[groupNum]
  }

  /** Return a tuple containing all subgroups */
  groups(defaultValue?: string): (string | undefined)[] {
    const result: (string | undefined)[] = []
    for (let i = 1; i < this._match.length; i++) {
      result.push(this._match[i] ?? defaultValue)
    }
    return result
  }

  /** Return a dictionary of named groups */
  groupDict(defaultValue?: string): Record<string, string | undefined> {
    const groups = this._match.groups ?? {}
    const result: Record<string, string | undefined> = {}
    for (const [key, value] of Object.entries(groups)) {
      // Groups can have undefined values for non-participating groups
      result[key] = (value as string | undefined) ?? defaultValue
    }
    return result
  }

  /** Return the start index of the match */
  start(groupNum = 0): number {
    if (groupNum === 0) {
      return this._match.index
    }
    // For subgroups, we need to find the position
    const fullMatch = this._match[0]
    const subMatch = this._match[groupNum]
    if (!fullMatch || !subMatch) return -1
    const offset = fullMatch.indexOf(subMatch)
    return offset >= 0 ? this._match.index + offset : -1
  }

  /** Return the end index of the match */
  end(groupNum = 0): number {
    const s = this.start(groupNum)
    const g = this.group(groupNum)
    if (s < 0 || g === undefined) return -1
    return s + g.length
  }

  /** Return a tuple (start, end) */
  span(groupNum = 0): [number, number] {
    return [this.start(groupNum), this.end(groupNum)]
  }

  /** Return start position of search */
  get pos(): number {
    return this._pos
  }

  /** Return end position of search */
  get endpos(): number {
    return this._endpos
  }

  /** Return the last matched group index */
  get lastIndex(): number | undefined {
    for (let i = this._match.length - 1; i > 0; i--) {
      if (this._match[i] !== undefined) return i
    }
    return undefined
  }

  /** Return the name of the last matched group */
  get lastGroup(): string | undefined {
    if (!this._match.groups) return undefined
    const lastIdx = this.lastIndex
    if (lastIdx === undefined) return undefined
    // Find the name for this index
    let idx = 1
    for (const name of Object.keys(this._match.groups)) {
      if (idx === lastIdx) return name
      idx++
    }
    return undefined
  }

  /** Return the pattern object */
  get re(): Pattern {
    return this._pattern
  }

  /** Return the input string */
  get string(): string {
    return this._string
  }

  /** Expand template with groups */
  expand(template: string): string {
    return template.replace(/\\(\d+)|\\g<(\w+)>/g, (_, num: string | undefined, name: string) => {
      if (num) {
        return this.group(parseInt(num)) ?? ""
      }
      return this.group(name) ?? ""
    })
  }

  /** Return iterator of all groups */
  *[Symbol.iterator](): Generator<string | undefined> {
    for (const match of this._match) {
      yield match
    }
  }

  toString(): string {
    return `<re.Match object; span=(${String(this.start())}, ${String(this.end())}), match='${this.group() ?? ""}'>`
  }
}

// ============================================================================
// Pattern object
// ============================================================================

export class Pattern {
  private _regex: RegExp
  private _pattern: string
  private _flags: number

  constructor(pattern: string, flags = 0) {
    this._pattern = pattern
    this._flags = flags
    this._regex = this._compileRegex(pattern, flags)
  }

  private _compileRegex(pattern: string, flags: number): RegExp {
    // Convert Python regex syntax to JavaScript
    const jsPattern = pattern
      // Convert Python named groups (?P<name>...) to JS (?<name>...)
      .replace(/\(\?P<(\w+)>/g, "(?<$1>")
      // Convert Python named backreferences (?P=name) to JS \k<name>
      .replace(/\(\?P=(\w+)\)/g, "\\k<$1>")

    let jsFlags = ""
    if (flags & IGNORECASE) jsFlags += "i"
    if (flags & MULTILINE) jsFlags += "m"
    if (flags & DOTALL) jsFlags += "s"
    jsFlags += "u" // Always use unicode

    return new RegExp(jsPattern, jsFlags)
  }

  /** Search for pattern in string */
  search(string: string, pos = 0, endpos?: number): Match | null {
    const searchStr = endpos !== undefined ? string.slice(0, endpos) : string
    const searchFrom = searchStr.slice(pos)

    const regex = new RegExp(this._regex.source, this._regex.flags)
    const match = regex.exec(searchFrom)

    if (match) {
      match.index += pos
      return new Match(match, string, this, pos, endpos)
    }
    return null
  }

  /** Match pattern at start of string */
  match(string: string, pos = 0, endpos?: number): Match | null {
    const searchStr = endpos !== undefined ? string.slice(0, endpos) : string
    const searchFrom = searchStr.slice(pos)

    // Force match at start
    const regex = new RegExp("^(?:" + this._regex.source + ")", this._regex.flags)
    const match = regex.exec(searchFrom)

    if (match) {
      match.index += pos
      return new Match(match, string, this, pos, endpos)
    }
    return null
  }

  /** Match pattern against entire string */
  fullMatch(string: string, pos = 0, endpos?: number): Match | null {
    const searchStr = endpos !== undefined ? string.slice(0, endpos) : string
    const searchFrom = searchStr.slice(pos)

    // Force match entire string
    const regex = new RegExp("^(?:" + this._regex.source + ")$", this._regex.flags)
    const match = regex.exec(searchFrom)

    if (match) {
      match.index += pos
      return new Match(match, string, this, pos, endpos)
    }
    return null
  }

  /** Split string by pattern */
  split(string: string, maxsplit = 0): string[] {
    if (maxsplit === 0) {
      return string.split(this._regex)
    }

    const result: string[] = []
    let lastIndex = 0
    let count = 0
    const regex = new RegExp(this._regex.source, this._regex.flags + "g")

    let match: RegExpExecArray | null
    while ((match = regex.exec(string)) !== null && (maxsplit === 0 || count < maxsplit)) {
      result.push(string.slice(lastIndex, match.index))
      // Add captured groups
      for (let i = 1; i < match.length; i++) {
        const group = match[i]
        if (group !== undefined) {
          result.push(group)
        }
      }
      lastIndex = regex.lastIndex
      count++
    }
    result.push(string.slice(lastIndex))
    return result
  }

  /** Find all matches */
  findAll(string: string, pos = 0, endpos?: number): (string | string[])[] {
    const searchStr = endpos !== undefined ? string.slice(0, endpos) : string
    const searchFrom = searchStr.slice(pos)

    const regex = new RegExp(this._regex.source, this._regex.flags + "g")
    const results: (string | string[])[] = []

    let match: RegExpExecArray | null
    while ((match = regex.exec(searchFrom)) !== null) {
      if (match.length === 1) {
        results.push(match[0])
      } else if (match.length === 2 && match[1] !== undefined) {
        results.push(match[1])
      } else {
        results.push(match.slice(1))
      }
    }
    return results
  }

  /** Find all matches as iterator */
  *findIter(string: string, pos = 0, endpos?: number): Generator<Match> {
    const searchStr = endpos !== undefined ? string.slice(0, endpos) : string
    const searchFrom = searchStr.slice(pos)

    const regex = new RegExp(this._regex.source, this._regex.flags + "g")

    let match: RegExpExecArray | null
    while ((match = regex.exec(searchFrom)) !== null) {
      match.index += pos
      yield new Match(match, string, this, pos, endpos)
    }
  }

  /** Replace pattern in string */
  sub(repl: string | ((match: Match) => string), string: string, count = 0): string {
    if (typeof repl === "function") {
      let n = 0
      const regex = new RegExp(this._regex.source, this._regex.flags + "g")
      return string.replace(regex, (...args) => {
        if (count > 0 && n >= count) {
          return args[0]
        }
        n++
        const match = regex.exec(string)
        if (!match) return args[0]
        return repl(new Match(match, string, this))
      })
    }

    // Convert Python replacement syntax
    const jsRepl = repl.replace(/\\g<(\w+)>/g, "$<$1>").replace(/\\(\d+)/g, "$$$1")

    if (count === 0) {
      const regex = new RegExp(this._regex.source, this._regex.flags + "g")
      return string.replace(regex, jsRepl)
    }

    let result = string
    let n = 0
    const regex = new RegExp(this._regex.source, this._regex.flags)
    while (n < count) {
      const newResult = result.replace(regex, jsRepl)
      if (newResult === result) break
      result = newResult
      n++
    }
    return result
  }

  /** Replace pattern and return (newstring, count) */
  subn(repl: string | ((match: Match) => string), string: string, count = 0): [string, number] {
    let n = 0
    const result = this.sub(
      typeof repl === "function"
        ? (m) => {
            n++
            return repl(m)
          }
        : repl,
      string,
      count
    )
    if (typeof repl === "string") {
      // Count replacements
      const regex = new RegExp(this._regex.source, this._regex.flags + "g")
      const matches = string.match(regex)
      n = matches ? (count > 0 ? Math.min(matches.length, count) : matches.length) : 0
    }
    return [result, n]
  }

  /** Return the pattern string */
  get pattern(): string {
    return this._pattern
  }

  /** Return the flags */
  get flags(): number {
    return this._flags
  }

  /** Return number of groups */
  get groups(): number {
    // Count groups in pattern
    let count = 0
    for (let i = 0; i < this._pattern.length; i++) {
      if (this._pattern[i] === "\\") {
        i++
        continue
      }
      if (this._pattern[i] === "(") {
        if (this._pattern[i + 1] !== "?") {
          count++
        } else if (
          this._pattern.slice(i + 1, i + 4) === "?P<" ||
          this._pattern.slice(i + 1, i + 3) === "?<"
        ) {
          count++
        }
      }
    }
    return count
  }

  /** Return named groups mapping */
  get groupIndex(): Record<string, number> {
    const result: Record<string, number> = {}
    let groupNum = 0
    const regex = /\(\?P?<(\w+)>/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(this._pattern)) !== null) {
      groupNum++
      const name = match[1]
      if (name) {
        result[name] = groupNum
      }
    }
    return result
  }

  toString(): string {
    return `re.compile('${this._pattern}')`
  }
}

// ============================================================================
// Module functions
// ============================================================================

/** Compile a regular expression pattern */
export function compile(pattern: string, flags = 0): Pattern {
  return new Pattern(pattern, flags)
}

/** Search for pattern in string */
export function search(pattern: string | Pattern, string: string, flags = 0): Match | null {
  const p = pattern instanceof Pattern ? pattern : compile(pattern, flags)
  return p.search(string)
}

/** Match pattern at start of string */
export function match(pattern: string | Pattern, string: string, flags = 0): Match | null {
  const p = pattern instanceof Pattern ? pattern : compile(pattern, flags)
  return p.match(string)
}

/** Match pattern against entire string */
export function fullMatch(pattern: string | Pattern, string: string, flags = 0): Match | null {
  const p = pattern instanceof Pattern ? pattern : compile(pattern, flags)
  return p.fullMatch(string)
}

/** Split string by pattern */
export function split(
  pattern: string | Pattern,
  string: string,
  maxsplit = 0,
  flags = 0
): string[] {
  const p = pattern instanceof Pattern ? pattern : compile(pattern, flags)
  return p.split(string, maxsplit)
}

/** Find all matches */
export function findAll(
  pattern: string | Pattern,
  string: string,
  flags = 0
): (string | string[])[] {
  const p = pattern instanceof Pattern ? pattern : compile(pattern, flags)
  return p.findAll(string)
}

/** Find all matches as iterator */
export function findIter(pattern: string | Pattern, string: string, flags = 0): Generator<Match> {
  const p = pattern instanceof Pattern ? pattern : compile(pattern, flags)
  return p.findIter(string)
}

/** Replace pattern in string */
export function sub(
  pattern: string | Pattern,
  repl: string | ((match: Match) => string),
  string: string,
  count = 0,
  flags = 0
): string {
  const p = pattern instanceof Pattern ? pattern : compile(pattern, flags)
  return p.sub(repl, string, count)
}

/** Replace pattern and return (newstring, count) */
export function subn(
  pattern: string | Pattern,
  repl: string | ((match: Match) => string),
  string: string,
  count = 0,
  flags = 0
): [string, number] {
  const p = pattern instanceof Pattern ? pattern : compile(pattern, flags)
  return p.subn(repl, string, count)
}

/** Escape special characters in pattern */
export function escape(pattern: string): string {
  return pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Purge the regex cache (no-op in this implementation) */
export function purge(): void {
  // No cache to purge
}

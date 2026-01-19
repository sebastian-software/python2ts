/**
 * Python string methods and constants for TypeScript
 * Usage: py.string.join(), py.string.split(), py.string.asciiLowercase, etc.
 */

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// ============================================================================
// String constants (Python string module)
// ============================================================================

/** The lowercase letters 'abcdefghijklmnopqrstuvwxyz' */
export const asciiLowercase = "abcdefghijklmnopqrstuvwxyz"

/** The uppercase letters 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' */
export const asciiUppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

/** The concatenation of asciiLowercase and asciiUppercase */
export const asciiLetters = asciiLowercase + asciiUppercase

/** The string '0123456789' */
export const digits = "0123456789"

/** The string '0123456789abcdefABCDEF' */
export const hexDigits = "0123456789abcdefABCDEF"

/** The string '01234567' */
export const octDigits = "01234567"

/** String of ASCII characters which are considered punctuation */
export const punctuation = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"

/** String of ASCII characters which are considered whitespace */
export const whitespace = " \t\n\r\x0b\x0c"

/** String of ASCII characters which are considered printable */
export const printable = digits + asciiLetters + punctuation + whitespace

// ============================================================================
// Template class
// ============================================================================

export class Template {
  readonly template: string

  constructor(template: string) {
    this.template = template
  }

  /** Perform substitution, raising KeyError for missing keys */
  substitute(mapping?: Record<string, unknown>): string {
    const combined = { ...mapping }
    return this.template.replace(
      /\$\$|\$(\w+)|\$\{(\w+)\}/g,
      (match, name1: string, name2: string) => {
        if (match === "$$") return "$"
        const name = name1 || name2
        if (!(name in combined)) {
          throw new Error(`KeyError: '${name}'`)
        }
        return String(combined[name])
      }
    )
  }

  /** Perform substitution, returning original placeholder for missing keys */
  safeSubstitute(mapping?: Record<string, unknown>): string {
    const combined = { ...mapping }
    return this.template.replace(
      /\$\$|\$(\w+)|\$\{(\w+)\}/g,
      (match, name1: string, name2: string) => {
        if (match === "$$") return "$"
        const name = name1 || name2
        if (!(name in combined)) {
          return match
        }
        return String(combined[name])
      }
    )
  }

  /** Get identifiers in template */
  getIdentifiers(): string[] {
    const identifiers: string[] = []
    const regex = /\$(\w+)|\$\{(\w+)\}/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(this.template)) !== null) {
      const name = match[1] || match[2]
      if (name && !identifiers.includes(name)) {
        identifiers.push(name)
      }
    }
    return identifiers
  }
}

/** Capitalize words in string */
export function capWords(s: string, sep?: string): string {
  const separator = sep ?? " "
  return s
    .split(separator)
    .map((word) => {
      if (!word) return ""
      const first = word[0]
      return first ? first.toUpperCase() + word.slice(1).toLowerCase() : word
    })
    .join(separator)
}

export const string = {
  /**
   * Python str.join()
   */
  join(sep: string, iterable: Iterable<string>): string {
    return Array.from(iterable).join(sep)
  },

  /**
   * Python str.split()
   */
  split(s: string, sep?: string, maxsplit?: number): string[] {
    if (sep === undefined) {
      // Split on whitespace
      const result = s.trim().split(/\s+/)
      if (maxsplit !== undefined && maxsplit >= 0) {
        if (result.length > maxsplit + 1) {
          const limited = result.slice(0, maxsplit)
          limited.push(result.slice(maxsplit).join(" "))
          return limited
        }
      }
      return result
    }

    if (maxsplit !== undefined && maxsplit >= 0) {
      const parts = s.split(sep)
      if (parts.length > maxsplit + 1) {
        const limited = parts.slice(0, maxsplit)
        limited.push(parts.slice(maxsplit).join(sep))
        return limited
      }
      return parts
    }

    return s.split(sep)
  },

  /**
   * Python str.rSplit()
   */
  rSplit(s: string, sep?: string, maxsplit?: number): string[] {
    if (sep === undefined) {
      const parts = s.trim().split(/\s+/)
      if (maxsplit === undefined) return parts
      if (maxsplit <= 0) return [s]
      if (parts.length <= maxsplit + 1) return parts
      const keep = parts.slice(-maxsplit)
      const rest = parts.slice(0, parts.length - maxsplit).join(" ")
      return [rest, ...keep]
    }

    const parts = s.split(sep)
    if (maxsplit === undefined || parts.length <= maxsplit + 1) return parts
    const keep = parts.slice(-maxsplit)
    const rest = parts.slice(0, parts.length - maxsplit).join(sep)
    return [rest, ...keep]
  },

  /**
   * Python str.strip()
   */
  strip(s: string, chars?: string): string {
    if (chars === undefined) {
      return s.trim()
    }
    const regex = new RegExp(`^[${escapeRegex(chars)}]+|[${escapeRegex(chars)}]+$`, "g")
    return s.replace(regex, "")
  },

  /**
   * Python str.lStrip()
   */
  lStrip(s: string, chars?: string): string {
    if (chars === undefined) {
      return s.trimStart()
    }
    const regex = new RegExp(`^[${escapeRegex(chars)}]+`)
    return s.replace(regex, "")
  },

  /**
   * Python str.rStrip()
   */
  rStrip(s: string, chars?: string): string {
    if (chars === undefined) {
      return s.trimEnd()
    }
    const regex = new RegExp(`[${escapeRegex(chars)}]+$`)
    return s.replace(regex, "")
  },

  /**
   * Python str.upper()
   */
  upper(s: string): string {
    return s.toUpperCase()
  },

  /**
   * Python str.lower()
   */
  lower(s: string): string {
    return s.toLowerCase()
  },

  /**
   * Python str.capitalize()
   */
  capitalize(s: string): string {
    if (s.length === 0) return s
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
  },

  /**
   * Python str.title()
   */
  title(s: string): string {
    return s.replace(/\b\w/g, (c) => c.toUpperCase())
  },

  /**
   * Python str.swapCase()
   */
  swapCase(s: string): string {
    return s
      .split("")
      .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
      .join("")
  },

  /**
   * Python str.startsWith()
   */
  startsWith(s: string, prefix: string, start?: number, end?: number): boolean {
    const substr = s.slice(start, end)
    return substr.startsWith(prefix)
  },

  /**
   * Python str.endsWith()
   */
  endsWith(s: string, suffix: string, start?: number, end?: number): boolean {
    const substr = s.slice(start, end)
    return substr.endsWith(suffix)
  },

  /**
   * Python str.find()
   */
  find(s: string, sub: string, start?: number, end?: number): number {
    const substr = s.slice(start, end)
    const index = substr.indexOf(sub)
    if (index === -1) return -1
    return (start ?? 0) + index
  },

  /**
   * Python str.rFind()
   */
  rFind(s: string, sub: string, start?: number, end?: number): number {
    const substr = s.slice(start, end)
    const index = substr.lastIndexOf(sub)
    if (index === -1) return -1
    return (start ?? 0) + index
  },

  /**
   * Python str.index() - raises error if not found
   */
  index(s: string, sub: string, start?: number, end?: number): number {
    const result = string.find(s, sub, start, end)
    if (result === -1) {
      throw new Error("substring not found")
    }
    return result
  },

  /**
   * Python str.rIndex() - raises error if not found
   */
  rIndex(s: string, sub: string, start?: number, end?: number): number {
    const result = string.rFind(s, sub, start, end)
    if (result === -1) {
      throw new Error("substring not found")
    }
    return result
  },

  /**
   * Python str.count()
   */
  count(s: string, sub: string, start?: number, end?: number): number {
    const substr = s.slice(start, end)
    if (sub.length === 0) return substr.length + 1
    let count = 0
    let pos = 0
    while ((pos = substr.indexOf(sub, pos)) !== -1) {
      count++
      pos += sub.length
    }
    return count
  },

  /**
   * Python str.replace()
   */
  replace(s: string, old: string, newStr: string, count?: number): string {
    if (count === undefined || count < 0) {
      return s.split(old).join(newStr)
    }

    let result = s
    for (let i = 0; i < count; i++) {
      const index = result.indexOf(old)
      if (index === -1) break
      result = result.slice(0, index) + newStr + result.slice(index + old.length)
    }
    return result
  },

  /**
   * Python str.zFill()
   */
  zFill(s: string, width: number): string {
    if (s.length >= width) return s
    const sign = s[0] === "-" || s[0] === "+" ? s[0] : ""
    const digits = sign ? s.slice(1) : s
    return sign + digits.padStart(width - sign.length, "0")
  },

  /**
   * Python str.center()
   */
  center(s: string, width: number, fillchar = " "): string {
    if (s.length >= width) return s
    const total = width - s.length
    const left = Math.floor(total / 2)
    const right = total - left
    return fillchar.repeat(left) + s + fillchar.repeat(right)
  },

  /**
   * Python str.lJust()
   */
  lJust(s: string, width: number, fillchar = " "): string {
    if (s.length >= width) return s
    return s + fillchar.repeat(width - s.length)
  },

  /**
   * Python str.rJust()
   */
  rJust(s: string, width: number, fillchar = " "): string {
    if (s.length >= width) return s
    return fillchar.repeat(width - s.length) + s
  },

  /**
   * Python str.partition()
   */
  partition(s: string, sep: string): [string, string, string] {
    const index = s.indexOf(sep)
    if (index === -1) return [s, "", ""]
    return [s.slice(0, index), sep, s.slice(index + sep.length)]
  },

  /**
   * Python str.rPartition()
   */
  rPartition(s: string, sep: string): [string, string, string] {
    const index = s.lastIndexOf(sep)
    if (index === -1) return ["", "", s]
    return [s.slice(0, index), sep, s.slice(index + sep.length)]
  },

  /**
   * Python str.isAlpha()
   */
  isAlpha(s: string): boolean {
    return s.length > 0 && /^[a-zA-Z]+$/.test(s)
  },

  /**
   * Python str.isDigit()
   */
  isDigit(s: string): boolean {
    return s.length > 0 && /^[0-9]+$/.test(s)
  },

  /**
   * Python str.isAlnum()
   */
  isAlnum(s: string): boolean {
    return s.length > 0 && /^[a-zA-Z0-9]+$/.test(s)
  },

  /**
   * Python str.isSpace()
   */
  isSpace(s: string): boolean {
    return s.length > 0 && /^\s+$/.test(s)
  },

  /**
   * Python str.isUpper()
   */
  isUpper(s: string): boolean {
    return s.length > 0 && s === s.toUpperCase() && s !== s.toLowerCase()
  },

  /**
   * Python str.isLower()
   */
  isLower(s: string): boolean {
    return s.length > 0 && s === s.toLowerCase() && s !== s.toUpperCase()
  },

  /**
   * Python str.format() - basic implementation
   */
  format(s: string, ...args: unknown[]): string {
    let index = 0
    return s.replace(/\{(\d*)\}/g, (_, num: string) => {
      const i = num === "" ? index++ : parseInt(num, 10)
      return String(args[i])
    })
  }
}

/**
 * Python glob module for TypeScript
 *
 * Provides Unix shell-style pathname pattern matching.
 *
 * @see {@link https://docs.python.org/3/library/glob.html | Python glob documentation}
 * @module
 */

import * as fs from "node:fs"
import * as nodePath from "node:path"

/**
 * Return a list of paths matching a pathname pattern.
 *
 * The pattern may contain shell-style wildcards:
 * - `*` matches any number of characters
 * - `?` matches a single character
 * - `[seq]` matches any character in seq
 * - `[!seq]` matches any character not in seq
 * - `**` matches everything, including any subdirectories
 *
 * @param pattern - The glob pattern
 * @param options - Options object
 * @returns Array of matching paths
 *
 * @example
 * ```typescript
 * glob("*.txt")              // All .txt files in current directory
 * glob("**\/*.py")           // All .py files recursively
 * glob("/path/to/*.js")      // All .js files in /path/to
 * ```
 */
export function glob(
  pattern: string,
  options?: {
    recursive?: boolean
    rootDir?: string
    includeHidden?: boolean
  }
): string[] {
  const rootDir = options?.rootDir ?? "."
  const recursive = options?.recursive ?? pattern.includes("**")
  const includeHidden = options?.includeHidden ?? false

  const results: string[] = []
  const regex = patternToRegex(pattern)

  // Check if pattern is absolute
  const isAbsolute = nodePath.isAbsolute(pattern)
  const baseDir = isAbsolute ? "/" : rootDir

  // Get the non-glob prefix of the pattern
  const parts = pattern.split(/[\\/]/)
  let fixedPrefix = ""

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i] ?? ""
    if (part.includes("*") || part.includes("?") || part.includes("[")) {
      break
    }
    if (fixedPrefix) {
      fixedPrefix = nodePath.join(fixedPrefix, part)
    } else if (part === "" && i === 0 && isAbsolute) {
      // Handle root "/" in absolute paths
      fixedPrefix = "/"
    } else {
      fixedPrefix = part
    }
  }

  const searchDir = fixedPrefix
    ? isAbsolute
      ? fixedPrefix
      : nodePath.join(rootDir, fixedPrefix)
    : baseDir

  const walk = (dir: string, depth: number): void => {
    let entries: string[]
    try {
      entries = fs.readdirSync(dir)
    } catch {
      return
    }

    for (const entry of entries) {
      // Skip hidden files unless explicitly included
      if (!includeHidden && entry.startsWith(".")) {
        continue
      }

      const fullPath = nodePath.join(dir, entry)
      const relativePath = isAbsolute ? fullPath : nodePath.relative(rootDir, fullPath)

      // Test if path matches pattern
      if (regex.test(relativePath)) {
        results.push(relativePath)
      }

      // Recurse into directories
      if (recursive) {
        try {
          if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath, depth + 1)
          }
        } catch {
          // Ignore errors accessing directories
        }
      }
    }
  }

  walk(searchDir, 0)
  return results.sort()
}

/**
 * Return an iterator of paths matching a pathname pattern.
 *
 * @param pattern - The glob pattern
 * @param options - Options object
 * @returns Generator of matching paths
 */
export function* iglob(
  pattern: string,
  options?: {
    recursive?: boolean
    rootDir?: string
    includeHidden?: boolean
  }
): Generator<string> {
  // For simplicity, we use the non-lazy version internally
  // A true lazy implementation would be more complex
  const results = glob(pattern, options)
  for (const result of results) {
    yield result
  }
}

/**
 * Escape all special characters in a pathname.
 *
 * @param pathname - The path to escape
 * @returns Escaped path safe for use in glob patterns
 */
export function escape(pathname: string): string {
  // Python's glob.escape only escapes *, ?, and [ (not ])
  return pathname.replace(/([*?[])/g, "[$1]")
}

/**
 * Return true if the pattern contains any magic glob characters.
 *
 * @param pattern - The pattern to check
 * @returns True if pattern contains wildcards
 */
export function hasMagic(pattern: string): boolean {
  return /[*?[\]]/.test(pattern)
}

/**
 * Convert a glob pattern to a regular expression.
 *
 * @param pattern - The glob pattern
 * @returns Regular expression
 */
function patternToRegex(pattern: string): RegExp {
  let regex = ""
  let i = 0

  while (i < pattern.length) {
    const char = pattern[i]

    if (char === "*") {
      if (pattern[i + 1] === "*") {
        // ** matches everything including /
        if (pattern[i + 2] === "/" || pattern[i + 2] === "\\") {
          regex += "(?:.*/)?"
          i += 3
        } else {
          regex += ".*"
          i += 2
        }
      } else {
        // * matches anything except /
        regex += "[^/\\\\]*"
        i++
      }
    } else if (char === "?") {
      regex += "[^/\\\\]"
      i++
    } else if (char === "[") {
      // Character class
      let j = i + 1
      let charClass = "["

      // Handle negation
      if (pattern[j] === "!" || pattern[j] === "^") {
        charClass += "^"
        j++
      }

      // Find the closing bracket
      while (j < pattern.length && pattern[j] !== "]") {
        charClass += pattern[j] ?? ""
        j++
      }
      charClass += "]"
      regex += charClass
      i = j + 1
    } else if (char === "/" || char === "\\") {
      regex += "[/\\\\]"
      i++
    } else if (".+^${}()|\\".includes(char ?? "")) {
      // Escape regex special characters
      regex += "\\" + (char ?? "")
      i++
    } else {
      regex += char ?? ""
      i++
    }
  }

  return new RegExp("^" + regex + "$")
}

/**
 * Return a list of all files matching pattern in directory and subdirectories.
 * This is an alias for glob with recursive=true.
 *
 * @param pattern - The glob pattern (without **)
 * @param rootDir - Root directory to search from
 * @returns Array of matching paths
 */
export function rglob(pattern: string, rootDir = "."): string[] {
  // If pattern doesn't start with **, prepend it
  const fullPattern = pattern.startsWith("**") ? pattern : "**/" + pattern
  return glob(fullPattern, { recursive: true, rootDir })
}

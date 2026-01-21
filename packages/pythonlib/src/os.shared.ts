/**
 * Python os module - Shared code for browser and Node.js
 *
 * Contains pure path operations and constants that work in all environments.
 *
 * @module
 */

// ============================================================================
// Environment variables
// ============================================================================

/** Environment variables (browser-safe empty object or Node's process.env) */
export const environ: Record<string, string | undefined> =
  typeof process !== "undefined" ? process.env : {}

/** Get an environment variable */
export function getenv(key: string, defaultValue?: string): string | undefined {
  return environ[key] ?? defaultValue
}

// ============================================================================
// Path separator constants
// ============================================================================

/** Path separator for the current platform */
export const sep = typeof process !== "undefined" && process.platform === "win32" ? "\\" : "/"

/** Alternative path separator (Windows has both / and \) */
export const altSep = typeof process !== "undefined" && process.platform === "win32" ? "/" : null

/** Path list separator (: on Unix, ; on Windows) */
export const pathSep = typeof process !== "undefined" && process.platform === "win32" ? ";" : ":"

/** Line separator */
export const lineSep =
  typeof process !== "undefined" && process.platform === "win32" ? "\r\n" : "\n"

/** Current directory string */
export const curDir = "."

/** Parent directory string */
export const parDir = ".."

/** Extension separator */
export const extSep = "."

/** Operating system name */
export const name: string =
  typeof process !== "undefined" && process.platform === "win32" ? "nt" : "posix"

// ============================================================================
// Pure path operations (work everywhere)
// ============================================================================

/** Join path components intelligently */
export function pathJoin(...paths: string[]): string {
  if (paths.length === 0) return ""
  if (paths.length === 1) return paths[0] ?? ""

  let result = paths[0] ?? ""
  for (let i = 1; i < paths.length; i++) {
    const p = paths[i] ?? ""
    if (p.startsWith("/") || (p.length > 1 && p[1] === ":")) {
      // Absolute path - start fresh
      result = p
    } else if (result === "" || result.endsWith("/") || result.endsWith("\\")) {
      result += p
    } else {
      result += sep + p
    }
  }
  return result
}

/** Return the base name of pathname */
export function pathBasename(p: string, suffix?: string): string {
  // Remove trailing slashes
  let s = p.replace(/[/\\]+$/, "")
  // Get last component
  const idx = Math.max(s.lastIndexOf("/"), s.lastIndexOf("\\"))
  s = idx >= 0 ? s.slice(idx + 1) : s
  // Remove suffix if provided
  if (suffix && s.endsWith(suffix)) {
    s = s.slice(0, -suffix.length)
  }
  return s
}

/** Return the directory name of pathname */
export function pathDirname(p: string): string {
  // Remove trailing slashes
  const s = p.replace(/[/\\]+$/, "")
  const idx = Math.max(s.lastIndexOf("/"), s.lastIndexOf("\\"))
  if (idx < 0) return ""
  if (idx === 0) return s[0] ?? ""
  return s.slice(0, idx)
}

/** Split pathname into (head, tail) */
export function pathSplitFn(p: string): [string, string] {
  return [pathDirname(p), pathBasename(p)]
}

/** Split pathname into root and extension */
export function pathSplitExt(p: string): [string, string] {
  const base = pathBasename(p)
  const dotIdx = base.lastIndexOf(".")
  if (dotIdx <= 0) {
    return [p, ""]
  }
  const dir = pathDirname(p)
  const root = base.slice(0, dotIdx)
  const ext = base.slice(dotIdx)
  return [dir ? pathJoin(dir, root) : root, ext]
}

/** Return the extension of pathname */
export function pathExtName(p: string): string {
  return pathSplitExt(p)[1]
}

/** Test whether a path is absolute */
export function pathIsAbs(p: string): boolean {
  if (p.startsWith("/")) return true
  // Windows: C:\ or C:/
  if (p.length >= 3 && p[1] === ":" && (p[2] === "/" || p[2] === "\\")) return true
  // Windows UNC: \\server\share
  if (p.startsWith("\\\\")) return true
  return false
}

/** Normalize a pathname */
export function pathNormPath(p: string): string {
  if (!p) return "."

  // Handle Windows drive letter
  let prefix = ""
  if (p.length >= 2 && p[1] === ":") {
    prefix = p.slice(0, 2)
    p = p.slice(2)
  }

  // Replace backslashes with forward slashes for processing
  const isWin = p.includes("\\")
  p = p.replace(/\\/g, "/")

  // Split and process
  const isAbsolute = p.startsWith("/")
  const parts = p.split("/").filter((part) => part && part !== ".")
  const result: string[] = []

  for (const part of parts) {
    if (part === "..") {
      if (result.length > 0 && result[result.length - 1] !== "..") {
        result.pop()
      } else if (!isAbsolute) {
        result.push("..")
      }
    } else {
      result.push(part)
    }
  }

  let normalized = result.join(isWin ? "\\" : "/")
  if (isAbsolute) {
    normalized = (isWin ? "\\" : "/") + normalized
  }
  normalized = prefix + normalized

  return normalized || "."
}

/** Return relative path from start to path */
export function pathRelPath(p: string, start = "."): string {
  const pParts = pathNormPath(p).split(/[/\\]/).filter(Boolean)
  const startParts = pathNormPath(start).split(/[/\\]/).filter(Boolean)

  // Find common prefix length
  let commonLen = 0
  const minLen = Math.min(pParts.length, startParts.length)
  for (let i = 0; i < minLen; i++) {
    if (pParts[i] === startParts[i]) {
      commonLen++
    } else {
      break
    }
  }

  // Build relative path
  const upCount = startParts.length - commonLen
  const result = [...Array<string>(upCount).fill(".."), ...pParts.slice(commonLen)]
  return result.join(sep) || "."
}

/** Return common path prefix */
export function pathCommonPath(paths: string[]): string {
  if (paths.length === 0) {
    throw new Error("commonPath() arg is an empty sequence")
  }

  const splitPaths = paths.map((p) => pathNormPath(p).split(/[/\\]/))
  const first = splitPaths[0]
  if (!first) {
    throw new Error("commonPath() arg is an empty sequence")
  }
  let commonLen = first.length

  for (const parts of splitPaths.slice(1)) {
    commonLen = Math.min(commonLen, parts.length)
    for (let j = 0; j < commonLen; j++) {
      if (parts[j] !== first[j]) {
        commonLen = j
        break
      }
    }
  }

  return first.slice(0, commonLen).join(sep) || sep
}

/** Expand ~ and ~user */
export function pathExpandUser(p: string): string {
  if (!p.startsWith("~")) return p
  const home =
    typeof process !== "undefined" ? (process.env.HOME ?? process.env.USERPROFILE) : undefined
  if (!home) return p
  if (p === "~" || p.startsWith("~/") || p.startsWith("~\\")) {
    return home + p.slice(1)
  }
  return p
}

/** Expand shell variables */
export function pathExpandVars(p: string): string {
  return p.replace(/\$(\w+)|\$\{(\w+)\}/g, (_, v1: string, v2: string) => {
    const key = v1 || v2
    return environ[key] ?? ""
  })
}

// ============================================================================
// Process functions
// ============================================================================

/** Get current working directory */
export function getCwd(): string {
  if (typeof process !== "undefined") {
    return process.cwd()
  }
  return "/"
}

/** Get current working directory as bytes (same as getCwd in TS) */
export function getCwdb(): string {
  return getCwd()
}

/** Change current working directory */
export function chdir(p: string): void {
  if (typeof process !== "undefined") {
    process.chdir(p)
  }
}

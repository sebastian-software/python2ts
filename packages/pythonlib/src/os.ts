/**
 * Python os module for TypeScript
 *
 * Provides operating system interface functions matching Python's os module.
 * Note: This is a browser-compatible subset. Some functions are stubs.
 *
 * @see {@link https://docs.python.org/3/library/os.html | Python os documentation}
 * @see {@link https://docs.python.org/3/library/os.path.html | Python os.path documentation}
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

// ============================================================================
// os.path module
// ============================================================================

export const path = {
  /** Join path components intelligently */
  join(...paths: string[]): string {
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
  },

  /** Return the base name of pathname */
  basename(p: string, suffix?: string): string {
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
  },

  /** Return the directory name of pathname */
  dirname(p: string): string {
    // Remove trailing slashes
    const s = p.replace(/[/\\]+$/, "")
    const idx = Math.max(s.lastIndexOf("/"), s.lastIndexOf("\\"))
    if (idx < 0) return ""
    if (idx === 0) return s[0] ?? ""
    return s.slice(0, idx)
  },

  /** Split pathname into (head, tail) */
  split(p: string): [string, string] {
    return [path.dirname(p), path.basename(p)]
  },

  /** Split pathname into root and extension */
  splitExt(p: string): [string, string] {
    const base = path.basename(p)
    const dotIdx = base.lastIndexOf(".")
    if (dotIdx <= 0) {
      return [p, ""]
    }
    const dir = path.dirname(p)
    const root = base.slice(0, dotIdx)
    const ext = base.slice(dotIdx)
    return [dir ? path.join(dir, root) : root, ext]
  },

  /** Return the extension of pathname */
  extName(p: string): string {
    return path.splitExt(p)[1]
  },

  /** Test whether a path is absolute */
  isAbs(p: string): boolean {
    if (p.startsWith("/")) return true
    // Windows: C:\ or C:/
    if (p.length >= 3 && p[1] === ":" && (p[2] === "/" || p[2] === "\\")) return true
    // Windows UNC: \\server\share
    if (p.startsWith("\\\\")) return true
    return false
  },

  /** Normalize a pathname */
  normPath(p: string): string {
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
  },

  /** Return normalized absolutized version of pathname */
  absPath(p: string): string {
    if (path.isAbs(p)) {
      return path.normPath(p)
    }
    // In browser, we can't get cwd, so just normalize
    return path.normPath(p)
  },

  /** Return canonical path, eliminating symlinks (stub - just normalizes) */
  realPath(p: string): string {
    return path.absPath(p)
  },

  /** Return relative path from start to path */
  relPath(p: string, start: string = "."): string {
    const pParts = path.normPath(p).split(/[/\\]/).filter(Boolean)
    const startParts = path.normPath(start).split(/[/\\]/).filter(Boolean)

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
  },

  /** Return common path prefix */
  commonPath(paths: string[]): string {
    if (paths.length === 0) {
      throw new Error("commonPath() arg is an empty sequence")
    }

    const splitPaths = paths.map((p) => path.normPath(p).split(/[/\\]/))
    const first = splitPaths[0] as string[]
    let commonLen = first.length

    for (let i = 1; i < splitPaths.length; i++) {
      const parts = splitPaths[i] as string[]
      commonLen = Math.min(commonLen, parts.length)
      for (let j = 0; j < commonLen; j++) {
        if (parts[j] !== first[j]) {
          commonLen = j
          break
        }
      }
    }

    return first.slice(0, commonLen).join(sep) || sep
  },

  /** Expand ~ and ~user (stub - returns unchanged in browser) */
  expandUser(p: string): string {
    if (!p.startsWith("~")) return p
    const home =
      typeof process !== "undefined" ? (process.env.HOME ?? process.env.USERPROFILE) : undefined
    if (!home) return p
    if (p === "~" || p.startsWith("~/") || p.startsWith("~\\")) {
      return home + p.slice(1)
    }
    return p
  },

  /** Expand shell variables (stub - returns unchanged) */
  expandVars(p: string): string {
    // Simple $VAR and ${VAR} expansion
    return p.replace(/\$(\w+)|\$\{(\w+)\}/g, (_, v1: string, v2: string) => {
      const key = v1 || v2
      return environ[key] ?? ""
    })
  },

  /* v8 ignore start -- browser stubs @preserve */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  /** Test if path exists (stub - always returns false in browser) */
  exists(_p: string): boolean {
    return false
  },

  /** Test if path is a file (stub - always returns false in browser) */
  isFile(_p: string): boolean {
    return false
  },

  /** Test if path is a directory (stub - always returns false in browser) */
  isDir(_p: string): boolean {
    return false
  },

  /** Test if path is a symbolic link (stub - always returns false in browser) */
  isLink(_p: string): boolean {
    return false
  },

  /** Return size of file (stub - returns 0 in browser) */
  getSize(_p: string): number {
    return 0
  },

  /** Return modification time (stub - returns 0 in browser) */
  getMtime(_p: string): number {
    return 0
  },

  /** Return access time (stub - returns 0 in browser) */
  getAtime(_p: string): number {
    return 0
  },

  /** Return creation time (stub - returns 0 in browser) */
  getCtime(_p: string): number {
    return 0
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
  /* v8 ignore stop */
}

// ============================================================================
// Process functions (stubs for browser compatibility)
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

/** Change current working directory (stub in browser) */
export function chdir(p: string): void {
  if (typeof process !== "undefined") {
    process.chdir(p)
  }
}

/* v8 ignore start -- browser stubs for filesystem operations @preserve */
/* eslint-disable @typescript-eslint/no-unused-vars */
/** List directory contents (stub - returns empty array in browser) */
export function listDir(_p: string = "."): string[] {
  return []
}

/** Create a directory (stub in browser) */
export function mkdir(_p: string, _mode: number = 0o777): void {
  // No-op in browser
}

/** Create a directory and parents (stub in browser) */
export function makeDirs(_p: string, _mode: number = 0o777, _existOk: boolean = false): void {
  // No-op in browser
}

/** Remove a file (stub in browser) */
export function remove(_p: string): void {
  // No-op in browser
}

/** Remove a file (alias for remove) */
export const unlink = remove

/** Remove a directory (stub in browser) */
export function rmdir(_p: string): void {
  // No-op in browser
}

/** Remove directory tree (stub in browser) */
export function removeDirs(_p: string): void {
  // No-op in browser
}

/** Rename a file or directory (stub in browser) */
export function rename(_src: string, _dst: string): void {
  // No-op in browser
}

/** Rename with automatic directory creation (stub in browser) */
export function renames(_src: string, _dst: string): void {
  // No-op in browser
}

/** Replace file (stub in browser) */
export function replace(_src: string, _dst: string): void {
  // No-op in browser
}

/** Walk directory tree (stub - yields nothing in browser) */
export function* walk(
  _top: string,
  _options?: { topdown?: boolean; followlinks?: boolean }
): Generator<[string, string[], string[]]> {
  // No-op in browser
}

/** Get file stat (stub in browser) */
export function stat(_p: string): {
  st_mode: number
  st_size: number
  st_mtime: number
  st_atime: number
  st_ctime: number
} {
  return { st_mode: 0, st_size: 0, st_mtime: 0, st_atime: 0, st_ctime: 0 }
}
/* eslint-enable @typescript-eslint/no-unused-vars */
/* v8 ignore stop */

// ============================================================================
// Name and platform info
// ============================================================================

/** Operating system name */
export const name: string =
  typeof process !== "undefined" && process.platform === "win32" ? "nt" : "posix"

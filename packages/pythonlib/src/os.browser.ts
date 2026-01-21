/**
 * Python os module for TypeScript - Browser version
 *
 * Provides operating system interface functions matching Python's os module.
 * Filesystem operations are stubs in browser environment.
 *
 * @see {@link https://docs.python.org/3/library/os.html | Python os documentation}
 * @see {@link https://docs.python.org/3/library/os.path.html | Python os.path documentation}
 * @module
 */

// Re-export shared code
export {
  environ,
  getenv,
  sep,
  altSep,
  pathSep,
  lineSep,
  curDir,
  parDir,
  extSep,
  name,
  getCwd,
  getCwdb,
  chdir,
  pathJoin,
  pathBasename,
  pathDirname,
  pathSplitFn,
  pathSplitExt,
  pathExtName,
  pathIsAbs,
  pathNormPath,
  pathRelPath,
  pathCommonPath,
  pathExpandUser,
  pathExpandVars
} from "./os.shared.js"

import {
  pathJoin,
  pathBasename,
  pathDirname,
  pathSplitFn,
  pathSplitExt,
  pathExtName,
  pathIsAbs,
  pathNormPath,
  pathRelPath,
  pathCommonPath,
  pathExpandUser,
  pathExpandVars
} from "./os.shared.js"

// ============================================================================
// os.path module - Browser version with stubs
// ============================================================================

export const path = {
  join: pathJoin,
  basename: pathBasename,
  dirname: pathDirname,
  split: pathSplitFn,
  splitExt: pathSplitExt,
  extName: pathExtName,
  isAbs: pathIsAbs,
  normPath: pathNormPath,
  relPath: pathRelPath,
  commonPath: pathCommonPath,
  expandUser: pathExpandUser,
  expandVars: pathExpandVars,

  /** Return normalized absolutized version of pathname */
  absPath(p: string): string {
    if (pathIsAbs(p)) {
      return pathNormPath(p)
    }
    // In browser, we can't get cwd, so just normalize
    return pathNormPath(p)
  },

  /** Return canonical path, eliminating symlinks (stub - just normalizes) */
  realPath(p: string): string {
    return path.absPath(p)
  },

  /* v8 ignore start -- browser stubs @preserve */

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

  /* v8 ignore stop */
}

// ============================================================================
// Filesystem operations - Browser stubs
// ============================================================================

/* v8 ignore start -- browser stubs for filesystem operations @preserve */

/** List directory contents (stub - returns empty array in browser) */
export function listDir(_p = "."): string[] {
  return []
}

/** Create a directory (stub in browser) */
export function mkdir(_p: string, _mode = 0o777): void {
  // No-op in browser
}

/** Create a directory and parents (stub in browser) */
export function makeDirs(_p: string, _mode = 0o777, _existOk = false): void {
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

/* v8 ignore stop */

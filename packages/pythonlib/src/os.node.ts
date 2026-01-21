/**
 * Python os module for TypeScript - Node.js version
 *
 * Provides operating system interface functions matching Python's os module,
 * with real filesystem operations using Node.js fs module.
 *
 * @see {@link https://docs.python.org/3/library/os.html | Python os documentation}
 * @see {@link https://docs.python.org/3/library/os.path.html | Python os.path documentation}
 * @module
 */

import * as fs from "node:fs"
import * as nodePath from "node:path"

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
  pathExpandVars,
  getCwd
} from "./os.shared.js"

// ============================================================================
// os.path module - Node.js version with real implementations
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
    return pathNormPath(pathJoin(getCwd(), p))
  },

  /** Return canonical path, eliminating symlinks */
  realPath(p: string): string {
    try {
      return fs.realpathSync(p)
    } catch {
      return path.absPath(p)
    }
  },

  /** Test if path exists */
  exists(p: string): boolean {
    try {
      fs.accessSync(p)
      return true
    } catch {
      return false
    }
  },

  /** Test if path is a file */
  isFile(p: string): boolean {
    try {
      return fs.statSync(p).isFile()
    } catch {
      return false
    }
  },

  /** Test if path is a directory */
  isDir(p: string): boolean {
    try {
      return fs.statSync(p).isDirectory()
    } catch {
      return false
    }
  },

  /** Test if path is a symbolic link */
  isLink(p: string): boolean {
    try {
      return fs.lstatSync(p).isSymbolicLink()
    } catch {
      return false
    }
  },

  /** Return size of file */
  getSize(p: string): number {
    try {
      return fs.statSync(p).size
    } catch {
      return 0
    }
  },

  /** Return modification time as Unix timestamp */
  getMtime(p: string): number {
    try {
      return Math.floor(fs.statSync(p).mtimeMs / 1000)
    } catch {
      return 0
    }
  },

  /** Return access time as Unix timestamp */
  getAtime(p: string): number {
    try {
      return Math.floor(fs.statSync(p).atimeMs / 1000)
    } catch {
      return 0
    }
  },

  /** Return creation time as Unix timestamp */
  getCtime(p: string): number {
    try {
      return Math.floor(fs.statSync(p).ctimeMs / 1000)
    } catch {
      return 0
    }
  }
}

// ============================================================================
// Filesystem operations - Node.js implementations
// ============================================================================

/** List directory contents */
export function listDir(p = "."): string[] {
  try {
    return fs.readdirSync(p)
  } catch {
    return []
  }
}

/** Create a directory */
export function mkdir(p: string, mode = 0o777): void {
  fs.mkdirSync(p, { mode })
}

/** Create a directory and parents */
export function makeDirs(p: string, mode = 0o777, existOk = false): void {
  try {
    fs.mkdirSync(p, { recursive: true, mode })
  } catch (e) {
    if (!existOk || !(e instanceof Error && "code" in e && e.code === "EEXIST")) {
      throw e
    }
  }
}

/** Remove a file */
export function remove(p: string): void {
  fs.unlinkSync(p)
}

/** Remove a file (alias for remove) */
export const unlink = remove

/** Remove a directory */
export function rmdir(p: string): void {
  fs.rmdirSync(p)
}

/** Remove directory tree (removes empty parent directories) */
export function removeDirs(p: string): void {
  fs.rmdirSync(p)
  // Try to remove parent directories
  let parent = pathDirname(p)
  while (parent && parent !== p) {
    try {
      fs.rmdirSync(parent)
      p = parent
      parent = pathDirname(p)
    } catch {
      break
    }
  }
}

/** Rename a file or directory */
export function rename(src: string, dst: string): void {
  fs.renameSync(src, dst)
}

/** Rename with automatic directory creation */
export function renames(src: string, dst: string): void {
  const dstDir = pathDirname(dst)
  if (dstDir) {
    makeDirs(dstDir, 0o777, true)
  }
  rename(src, dst)
  // Try to remove empty source directories
  const srcDir = pathDirname(src)
  if (srcDir) {
    try {
      removeDirs(srcDir)
    } catch {
      // Ignore errors when removing source directories
    }
  }
}

/** Replace file (atomic rename) */
export function replace(src: string, dst: string): void {
  fs.renameSync(src, dst)
}

/** Walk directory tree */
export function* walk(
  top: string,
  options?: { topdown?: boolean; followlinks?: boolean }
): Generator<[string, string[], string[]]> {
  const topdown = options?.topdown ?? true
  const followlinks = options?.followlinks ?? false

  const dirs: string[] = []
  const files: string[] = []

  try {
    const entries = fs.readdirSync(top, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        dirs.push(entry.name)
      } else if (entry.isFile()) {
        files.push(entry.name)
      } else if (entry.isSymbolicLink()) {
        if (followlinks) {
          try {
            const realPath = fs.realpathSync(nodePath.join(top, entry.name))
            if (fs.statSync(realPath).isDirectory()) {
              dirs.push(entry.name)
            } else {
              files.push(entry.name)
            }
          } catch {
            files.push(entry.name)
          }
        } else {
          files.push(entry.name)
        }
      }
    }
  } catch {
    return
  }

  if (topdown) {
    yield [top, dirs, files]
  }

  for (const dir of dirs) {
    const dirPath = nodePath.join(top, dir)
    yield* walk(dirPath, options)
  }

  if (!topdown) {
    yield [top, dirs, files]
  }
}

/** Get file stat */
export function stat(p: string): {
  st_mode: number
  st_size: number
  st_mtime: number
  st_atime: number
  st_ctime: number
} {
  try {
    const s = fs.statSync(p)
    return {
      st_mode: s.mode,
      st_size: s.size,
      st_mtime: Math.floor(s.mtimeMs / 1000),
      st_atime: Math.floor(s.atimeMs / 1000),
      st_ctime: Math.floor(s.ctimeMs / 1000)
    }
  } catch {
    return { st_mode: 0, st_size: 0, st_mtime: 0, st_atime: 0, st_ctime: 0 }
  }
}

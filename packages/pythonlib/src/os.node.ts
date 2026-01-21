/**
 * Python os module for TypeScript - Node.js version
 *
 * Provides operating system interface functions matching Python's os module,
 * with real filesystem operations using Node.js fs module (async).
 *
 * @see {@link https://docs.python.org/3/library/os.html | Python os documentation}
 * @see {@link https://docs.python.org/3/library/os.path.html | Python os.path documentation}
 * @module
 */

import * as fsp from "node:fs/promises"
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
// os.path module - Node.js version with async implementations
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
  async realPath(p: string): Promise<string> {
    try {
      return await fsp.realpath(p)
    } catch {
      return path.absPath(p)
    }
  },

  /** Test if path exists */
  async exists(p: string): Promise<boolean> {
    try {
      await fsp.access(p)
      return true
    } catch {
      return false
    }
  },

  /** Test if path is a file */
  async isFile(p: string): Promise<boolean> {
    try {
      return (await fsp.stat(p)).isFile()
    } catch {
      return false
    }
  },

  /** Test if path is a directory */
  async isDir(p: string): Promise<boolean> {
    try {
      return (await fsp.stat(p)).isDirectory()
    } catch {
      return false
    }
  },

  /** Test if path is a symbolic link */
  async isLink(p: string): Promise<boolean> {
    try {
      return (await fsp.lstat(p)).isSymbolicLink()
    } catch {
      return false
    }
  },

  /** Return size of file */
  async getSize(p: string): Promise<number> {
    try {
      return (await fsp.stat(p)).size
    } catch {
      return 0
    }
  },

  /** Return modification time as Unix timestamp */
  async getMtime(p: string): Promise<number> {
    try {
      return Math.floor((await fsp.stat(p)).mtimeMs / 1000)
    } catch {
      return 0
    }
  },

  /** Return access time as Unix timestamp */
  async getAtime(p: string): Promise<number> {
    try {
      return Math.floor((await fsp.stat(p)).atimeMs / 1000)
    } catch {
      return 0
    }
  },

  /** Return creation time as Unix timestamp */
  async getCtime(p: string): Promise<number> {
    try {
      return Math.floor((await fsp.stat(p)).ctimeMs / 1000)
    } catch {
      return 0
    }
  }
}

// ============================================================================
// Filesystem operations - Node.js async implementations
// ============================================================================

/** List directory contents */
export async function listDir(p = "."): Promise<string[]> {
  try {
    return await fsp.readdir(p)
  } catch {
    return []
  }
}

/** Create a directory */
export async function mkdir(p: string, mode = 0o777): Promise<void> {
  await fsp.mkdir(p, { mode })
}

/** Create a directory and parents */
export async function makeDirs(p: string, mode = 0o777, existOk = false): Promise<void> {
  try {
    await fsp.mkdir(p, { recursive: true, mode })
  } catch (e) {
    if (!existOk || !(e instanceof Error && "code" in e && e.code === "EEXIST")) {
      throw e
    }
  }
}

/** Remove a file */
export async function remove(p: string): Promise<void> {
  await fsp.unlink(p)
}

/** Remove a file (alias for remove) */
export const unlink = remove

/** Remove a directory */
export async function rmdir(p: string): Promise<void> {
  await fsp.rmdir(p)
}

/** Remove directory tree (removes empty parent directories) */
export async function removeDirs(p: string): Promise<void> {
  await fsp.rmdir(p)
  // Try to remove parent directories
  let parent = pathDirname(p)
  while (parent && parent !== p) {
    try {
      await fsp.rmdir(parent)
      p = parent
      parent = pathDirname(p)
    } catch {
      break
    }
  }
}

/** Rename a file or directory */
export async function rename(src: string, dst: string): Promise<void> {
  await fsp.rename(src, dst)
}

/** Rename with automatic directory creation */
export async function renames(src: string, dst: string): Promise<void> {
  const dstDir = pathDirname(dst)
  if (dstDir) {
    await makeDirs(dstDir, 0o777, true)
  }
  await rename(src, dst)
  // Try to remove empty source directories
  const srcDir = pathDirname(src)
  if (srcDir) {
    try {
      await removeDirs(srcDir)
    } catch {
      // Ignore errors when removing source directories
    }
  }
}

/** Replace file (atomic rename) */
export async function replace(src: string, dst: string): Promise<void> {
  await fsp.rename(src, dst)
}

/** Walk directory tree */
export async function* walk(
  top: string,
  options?: { topdown?: boolean; followlinks?: boolean }
): AsyncGenerator<[string, string[], string[]]> {
  const topdown = options?.topdown ?? true
  const followlinks = options?.followlinks ?? false

  const dirs: string[] = []
  const files: string[] = []

  try {
    const entries = await fsp.readdir(top, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        dirs.push(entry.name)
      } else if (entry.isFile()) {
        files.push(entry.name)
      } else if (entry.isSymbolicLink()) {
        if (followlinks) {
          try {
            const realPath = await fsp.realpath(nodePath.join(top, entry.name))
            if ((await fsp.stat(realPath)).isDirectory()) {
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
export async function stat(p: string): Promise<{
  st_mode: number
  st_size: number
  st_mtime: number
  st_atime: number
  st_ctime: number
}> {
  try {
    const s = await fsp.stat(p)
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

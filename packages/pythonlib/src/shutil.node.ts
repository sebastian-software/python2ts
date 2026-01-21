/**
 * Python shutil module for TypeScript
 *
 * Provides high-level file operations with async API.
 *
 * @see {@link https://docs.python.org/3/library/shutil.html | Python shutil documentation}
 * @module
 */

import type { ReadStream, WriteStream } from "node:fs"
import { constants } from "node:fs"
import {
  access,
  chmod,
  copyFile,
  lstat,
  mkdir,
  readdir,
  readlink,
  rename as fsRename,
  rm,
  stat,
  statfs,
  symlink,
  unlink,
  utimes
} from "node:fs/promises"
import { basename, delimiter, join } from "node:path"

/**
 * Copy the file src to the file or directory dst.
 *
 * @param src - Source file path
 * @param dst - Destination file or directory path
 * @returns The path to the newly created file
 */
export async function copy(src: string, dst: string): Promise<string> {
  let finalDst = dst

  // If dst is a directory, copy into it
  try {
    if ((await stat(dst)).isDirectory()) {
      finalDst = join(dst, basename(src))
    }
  } catch {
    // dst doesn't exist, use as-is
  }

  await copyFile(src, finalDst)
  return finalDst
}

/**
 * Copy the file src to the file or directory dst, preserving metadata.
 *
 * @param src - Source file path
 * @param dst - Destination file or directory path
 * @returns The path to the newly created file
 */
export async function copy2(src: string, dst: string): Promise<string> {
  const finalDst = await copy(src, dst)

  // Copy metadata
  const srcStat = await stat(src)
  await utimes(finalDst, srcStat.atime, srcStat.mtime)

  return finalDst
}

/**
 * Recursively copy an entire directory tree.
 *
 * @param src - Source directory path
 * @param dst - Destination directory path
 * @param options - Options object
 * @returns The destination directory path
 */
export async function copytree(
  src: string,
  dst: string,
  options?: {
    symlinkss?: boolean
    ignore?: (dir: string, names: string[]) => string[]
    copyFunction?: (src: string, dst: string) => Promise<void>
    dirsExistOk?: boolean
  }
): Promise<string> {
  const copyFunc =
    options?.copyFunction ??
    (async (s: string, d: string) => {
      await copy2(s, d)
    })
  const ignoreFunc = options?.ignore

  // Create destination directory
  await mkdir(dst, { recursive: options?.dirsExistOk })

  const entries = await readdir(src)
  const ignoredNames = ignoreFunc ? ignoreFunc(src, entries) : []

  for (const entry of entries) {
    if (ignoredNames.includes(entry)) {
      continue
    }

    const srcPath = join(src, entry)
    const dstPath = join(dst, entry)
    const entryStat = await lstat(srcPath)

    if (entryStat.isDirectory()) {
      await copytree(srcPath, dstPath, options)
    } else if (entryStat.isSymbolicLink() && options?.symlinkss) {
      const target = await readlink(srcPath)
      await symlink(target, dstPath)
    } else {
      await copyFunc(srcPath, dstPath)
    }
  }

  return dst
}

/**
 * Recursively move a file or directory to another location.
 *
 * @param src - Source path
 * @param dst - Destination path
 * @returns The destination path
 */
export async function move(src: string, dst: string): Promise<string> {
  let finalDst = dst

  // If dst is a directory, move into it
  try {
    if ((await stat(dst)).isDirectory()) {
      finalDst = join(dst, basename(src))
    }
  } catch {
    // dst doesn't exist, use as-is
  }

  try {
    // Try atomic rename first
    await fsRename(src, finalDst)
  } catch {
    // If rename fails (cross-device), copy and delete
    const srcStat = await stat(src)
    if (srcStat.isDirectory()) {
      await copytree(src, finalDst)
      await rmtree(src)
    } else {
      await copy2(src, finalDst)
      await unlink(src)
    }
  }

  return finalDst
}

/**
 * Recursively delete a directory tree.
 *
 * @param path - Directory path to delete
 * @param options - Options object
 */
export async function rmtree(
  path: string,
  options?: {
    ignoreErrors?: boolean
  }
): Promise<void> {
  try {
    await rm(path, { recursive: true, force: options?.ignoreErrors ?? false })
  } catch (err) {
    if (!options?.ignoreErrors) {
      throw err
    }
  }
}

/**
 * Return the path to an executable which would be run if the given cmd was called.
 *
 * @param cmd - Command name to find
 * @param path - Optional PATH string to search (defaults to process.env.PATH)
 * @returns Path to the executable, or null if not found
 */
export async function which(cmd: string, path?: string): Promise<string | null> {
  const pathDirs = (path ?? process.env.PATH ?? "").split(delimiter)
  const extensions = process.platform === "win32" ? [".exe", ".cmd", ".bat", ".com", ""] : [""]

  for (const dir of pathDirs) {
    for (const ext of extensions) {
      const fullPath = join(dir, cmd + ext)
      try {
        await access(fullPath, constants.X_OK)
        return fullPath
      } catch {
        // Not found or not executable
      }
    }
  }

  return null
}

/**
 * Disk usage statistics.
 */
export interface DiskUsage {
  total: number
  used: number
  free: number
}

/**
 * Return disk usage statistics for the given path.
 *
 * @param path - Path to check
 * @returns Object with total, used, and free bytes
 */
export async function diskUsage(path: string): Promise<DiskUsage> {
  /* v8 ignore next 3 -- Windows-specific check @preserve */
  if (process.platform === "win32") {
    throw new Error("diskUsage is not implemented on Windows")
  }

  const fsStat = await statfs(path)
  const total = fsStat.blocks * fsStat.bsize
  const free = fsStat.bavail * fsStat.bsize
  return { total, used: total - free, free }
}

/**
 * Return the size of the terminal window.
 *
 * @returns Object with columns and lines
 */
export function getTerminalSize(): { columns: number; lines: number } {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const columns = process.stdout.columns ?? 80
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const lines = process.stdout.rows ?? 24
  return { columns, lines }
}

/**
 * Copy file mode bits from src to dst.
 *
 * @param src - Source path
 * @param dst - Destination path
 */
export async function copymode(src: string, dst: string): Promise<void> {
  const srcStat = await stat(src)
  await chmod(dst, srcStat.mode)
}

/**
 * Copy all stat info (mode bits, atime, mtime, flags) from src to dst.
 *
 * @param src - Source path
 * @param dst - Destination path
 */
export async function copystat(src: string, dst: string): Promise<void> {
  const srcStat = await stat(src)
  await chmod(dst, srcStat.mode)
  await utimes(dst, srcStat.atime, srcStat.mtime)
}

/**
 * Copy a file's content (but not metadata) to another file.
 *
 * @param src - Source file path
 * @param dst - Destination file path
 */
export async function copyfile(src: string, dst: string): Promise<void> {
  await copyFile(src, dst)
}

/**
 * Copy data from a file-like object to another file-like object.
 *
 * @param fsrc - Source readable stream
 * @param fdst - Destination writable stream
 * @param length - Number of bytes to copy (optional, copies all if not specified)
 */
/* v8 ignore start -- stream operations are tested via integration @preserve */
export function copyfileobj(
  fsrc: ReadStream | NodeJS.ReadableStream,
  fdst: WriteStream | NodeJS.WritableStream,
  length?: number
): void {
  if (length === undefined) {
    ;(fsrc as NodeJS.ReadableStream).pipe(fdst as NodeJS.WritableStream)
  } else {
    // Read specified number of bytes
    let remaining = length
    ;(fsrc as NodeJS.ReadableStream).on("data", (chunk: Buffer) => {
      if (remaining <= 0) return
      const toWrite = chunk.subarray(0, Math.min(chunk.length, remaining))
      ;(fdst as NodeJS.WritableStream).write(toWrite)
      remaining -= toWrite.length
    })
  }
}
/* v8 ignore stop */

/**
 * Create an archive file from a directory.
 *
 * Not implemented - requires external tools (tar, zip).
 *
 * @param baseName - Name of the archive file (without extension)
 * @param format - Archive format ('zip', 'tar', 'gztar', 'bztar', 'xztar')
 * @param rootDir - Directory to archive
 * @returns Path to the created archive
 */
export function makeArchive(_baseName: string, _format: string, _rootDir: string): string {
  throw new Error("makeArchive is not implemented (requires external tools)")
}

/**
 * Unpack an archive file.
 *
 * Not implemented - requires external tools (tar, unzip).
 *
 * @param filename - Path to the archive
 * @param extractDir - Directory to extract to (optional)
 */
export function unpackArchive(_filename: string, _extractDir?: string): void {
  throw new Error("unpackArchive is not implemented (requires external tools)")
}

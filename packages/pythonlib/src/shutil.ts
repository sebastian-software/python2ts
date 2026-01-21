/**
 * Python shutil module for TypeScript
 *
 * Provides high-level file operations.
 *
 * @see {@link https://docs.python.org/3/library/shutil.html | Python shutil documentation}
 * @module
 */

import * as fs from "node:fs"
import * as nodePath from "node:path"
import * as childProcess from "node:child_process"

/**
 * Copy the file src to the file or directory dst.
 *
 * @param src - Source file path
 * @param dst - Destination file or directory path
 * @returns The path to the newly created file
 */
export function copy(src: string, dst: string): string {
  let finalDst = dst

  // If dst is a directory, copy into it
  try {
    if (fs.statSync(dst).isDirectory()) {
      finalDst = nodePath.join(dst, nodePath.basename(src))
    }
  } catch {
    // dst doesn't exist, use as-is
  }

  fs.copyFileSync(src, finalDst)
  return finalDst
}

/**
 * Copy the file src to the file or directory dst, preserving metadata.
 *
 * @param src - Source file path
 * @param dst - Destination file or directory path
 * @returns The path to the newly created file
 */
export function copy2(src: string, dst: string): string {
  const finalDst = copy(src, dst)

  // Copy metadata
  const stat = fs.statSync(src)
  fs.utimesSync(finalDst, stat.atime, stat.mtime)

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
export function copytree(
  src: string,
  dst: string,
  options?: {
    symlinkss?: boolean
    ignore?: (dir: string, names: string[]) => string[]
    copyFunction?: (src: string, dst: string) => void
    dirsExistOk?: boolean
  }
): string {
  const copyFunc = options?.copyFunction ?? copy2
  const ignoreFunc = options?.ignore

  // Create destination directory
  fs.mkdirSync(dst, { recursive: options?.dirsExistOk })

  const entries = fs.readdirSync(src)
  const ignoredNames = ignoreFunc ? ignoreFunc(src, entries) : []

  for (const entry of entries) {
    if (ignoredNames.includes(entry)) {
      continue
    }

    const srcPath = nodePath.join(src, entry)
    const dstPath = nodePath.join(dst, entry)
    const stat = fs.lstatSync(srcPath)

    if (stat.isDirectory()) {
      copytree(srcPath, dstPath, options)
    } else if (stat.isSymbolicLink() && options?.symlinkss) {
      const target = fs.readlinkSync(srcPath)
      fs.symlinkSync(target, dstPath)
    } else {
      copyFunc(srcPath, dstPath)
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
export function move(src: string, dst: string): string {
  let finalDst = dst

  // If dst is a directory, move into it
  try {
    if (fs.statSync(dst).isDirectory()) {
      finalDst = nodePath.join(dst, nodePath.basename(src))
    }
  } catch {
    // dst doesn't exist, use as-is
  }

  try {
    // Try atomic rename first
    fs.renameSync(src, finalDst)
  } catch {
    // If rename fails (cross-device), copy and delete
    const stat = fs.statSync(src)
    if (stat.isDirectory()) {
      copytree(src, finalDst)
      rmtree(src)
    } else {
      copy2(src, finalDst)
      fs.unlinkSync(src)
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
export function rmtree(
  path: string,
  options?: {
    ignoreErrors?: boolean
  }
): void {
  try {
    fs.rmSync(path, { recursive: true, force: options?.ignoreErrors ?? false })
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
export function which(cmd: string, path?: string): string | null {
  const pathDirs = (path ?? process.env.PATH ?? "").split(nodePath.delimiter)
  const extensions = process.platform === "win32" ? [".exe", ".cmd", ".bat", ".com", ""] : [""]

  for (const dir of pathDirs) {
    for (const ext of extensions) {
      const fullPath = nodePath.join(dir, cmd + ext)
      try {
        fs.accessSync(fullPath, fs.constants.X_OK)
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
export function diskUsage(path: string): DiskUsage {
  // This is platform-specific and requires native calls
  // For Node.js, we can use df command on Unix or wmic on Windows
  try {
    if (process.platform === "win32") {
      const driveLetter = path[0] ?? "C"
      const result = childProcess.execSync(
        `wmic logicaldisk where "DeviceID='${driveLetter}:'" get Size,FreeSpace`,
        {
          encoding: "utf8"
        }
      )
      const lines = result.trim().split("\n")
      if (lines.length >= 2) {
        const values = (lines[1] ?? "").trim().split(/\s+/)
        const free = parseInt(values[0] ?? "0", 10)
        const total = parseInt(values[1] ?? "0", 10)
        return { total, used: total - free, free }
      }
    } else {
      const stat = fs.statfsSync(path)
      const total = stat.blocks * stat.bsize
      const free = stat.bavail * stat.bsize
      return { total, used: total - free, free }
    }
  } catch {
    // Fallback
  }

  return { total: 0, used: 0, free: 0 }
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
export function copymode(src: string, dst: string): void {
  const stat = fs.statSync(src)
  fs.chmodSync(dst, stat.mode)
}

/**
 * Copy all stat info (mode bits, atime, mtime, flags) from src to dst.
 *
 * @param src - Source path
 * @param dst - Destination path
 */
export function copystat(src: string, dst: string): void {
  const stat = fs.statSync(src)
  fs.chmodSync(dst, stat.mode)
  fs.utimesSync(dst, stat.atime, stat.mtime)
}

/**
 * Copy a file's content (but not metadata) to another file.
 *
 * @param src - Source file path
 * @param dst - Destination file path
 */
export function copyfile(src: string, dst: string): void {
  fs.copyFileSync(src, dst)
}

/**
 * Copy data from a file-like object to another file-like object.
 *
 * @param fsrc - Source readable stream
 * @param fdst - Destination writable stream
 * @param length - Number of bytes to copy (optional, copies all if not specified)
 */
export function copyfileobj(
  fsrc: fs.ReadStream | NodeJS.ReadableStream,
  fdst: fs.WriteStream | NodeJS.WritableStream,
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

/**
 * Create an archive file from a directory.
 *
 * @param baseName - Name of the archive file (without extension)
 * @param format - Archive format ('zip', 'tar', 'gztar', 'bztar', 'xztar')
 * @param rootDir - Directory to archive
 * @returns Path to the created archive
 */
export function makeArchive(baseName: string, format: string, rootDir: string): string {
  const archiveName = `${baseName}.${format === "gztar" ? "tar.gz" : format}`

  // Use tar command for tar formats
  if (format === "tar" || format === "gztar" || format === "bztar" || format === "xztar") {
    const compression =
      format === "gztar" ? "z" : format === "bztar" ? "j" : format === "xztar" ? "J" : ""
    childProcess.execSync(
      `tar -c${compression}f "${archiveName}" -C "${nodePath.dirname(rootDir)}" "${nodePath.basename(rootDir)}"`
    )
  } else if (format === "zip") {
    childProcess.execSync(`zip -r "${archiveName}" "${nodePath.basename(rootDir)}"`, {
      cwd: nodePath.dirname(rootDir)
    })
  }

  return archiveName
}

/**
 * Unpack an archive file.
 *
 * @param filename - Path to the archive
 * @param extractDir - Directory to extract to (optional)
 */
export function unpackArchive(filename: string, extractDir?: string): void {
  const dst = extractDir ?? "."

  if (filename.endsWith(".tar.gz") || filename.endsWith(".tgz")) {
    childProcess.execSync(`tar -xzf "${filename}" -C "${dst}"`)
  } else if (filename.endsWith(".tar.bz2")) {
    childProcess.execSync(`tar -xjf "${filename}" -C "${dst}"`)
  } else if (filename.endsWith(".tar.xz")) {
    childProcess.execSync(`tar -xJf "${filename}" -C "${dst}"`)
  } else if (filename.endsWith(".tar")) {
    childProcess.execSync(`tar -xf "${filename}" -C "${dst}"`)
  } else if (filename.endsWith(".zip")) {
    childProcess.execSync(`unzip -o "${filename}" -d "${dst}"`)
  }
}

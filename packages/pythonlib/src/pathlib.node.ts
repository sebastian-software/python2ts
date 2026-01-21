/**
 * Python pathlib module for TypeScript
 *
 * Provides object-oriented filesystem paths with async operations.
 *
 * @see {@link https://docs.python.org/3/library/pathlib.html | Python pathlib documentation}
 * @module
 */

import type { Stats } from "node:fs"
import {
  access,
  chmod,
  link,
  lstat,
  mkdir,
  readdir,
  readFile,
  readlink,
  rename,
  rmdir,
  stat,
  symlink,
  unlink,
  utimes,
  writeFile
} from "node:fs/promises"
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  join,
  parse,
  relative,
  resolve,
  sep
} from "node:path"

/**
 * Path class representing a filesystem path.
 * Provides both path manipulation (pure) and filesystem operations.
 */
export class Path {
  private readonly _path: string

  /**
   * Create a new Path instance.
   *
   * @param pathSegments - Path segments to join
   */
  constructor(...pathSegments: string[]) {
    if (pathSegments.length === 0) {
      this._path = "."
    } else {
      this._path = join(...pathSegments)
    }
  }

  /**
   * Static factory method to create a Path.
   */
  static of(...pathSegments: string[]): Path {
    return new Path(...pathSegments)
  }

  /**
   * The final component of the path.
   */
  get name(): string {
    return basename(this._path)
  }

  /**
   * The final component without its suffix.
   */
  get stem(): string {
    const base = basename(this._path)
    const ext = extname(base)
    return ext ? base.slice(0, -ext.length) : base
  }

  /**
   * The file extension of the final component.
   */
  get suffix(): string {
    return extname(this._path)
  }

  /**
   * A list of the path's file extensions.
   */
  get suffixes(): string[] {
    const name = this.name
    const suffixes: string[] = []
    let remaining = name
    let ext = extname(remaining)
    while (ext) {
      suffixes.unshift(ext)
      remaining = remaining.slice(0, -ext.length)
      ext = extname(remaining)
    }
    return suffixes
  }

  /**
   * The logical parent of the path.
   */
  get parent(): Path {
    const parent = dirname(this._path)
    return new Path(parent)
  }

  /**
   * An immutable sequence of the path's ancestors.
   */
  get parents(): Path[] {
    const parents: Path[] = []
    let current = this._path
    let parent = dirname(current)
    while (parent !== current) {
      parents.push(new Path(parent))
      current = parent
      parent = dirname(current)
    }
    return parents
  }

  /**
   * The individual components of the path.
   */
  get parts(): string[] {
    const parsed = parse(this._path)
    const parts: string[] = []
    if (parsed.root) {
      parts.push(parsed.root)
    }
    if (parsed.dir) {
      const dirParts = parsed.dir.replace(parsed.root, "").split(sep).filter(Boolean)
      parts.push(...dirParts)
    }
    if (parsed.base) {
      parts.push(parsed.base)
    }
    return parts
  }

  /**
   * The drive or root (on Windows, the drive letter; on Unix, empty or /).
   */
  get anchor(): string {
    const parsed = parse(this._path)
    return parsed.root
  }

  /**
   * The drive letter (Windows only, empty on Unix).
   */
  get drive(): string {
    if (process.platform === "win32") {
      const match = /^([A-Za-z]:)/.exec(this._path)
      return match ? (match[1] ?? "") : ""
    }
    return ""
  }

  /**
   * The root of the path (/ on Unix, \\ or drive:\\ on Windows).
   */
  get root(): string {
    const parsed = parse(this._path)
    return parsed.root
  }

  /**
   * Whether the path is absolute.
   */
  isAbsolute(): boolean {
    return isAbsolute(this._path)
  }

  /**
   * Combine this path with additional segments.
   *
   * @param pathSegments - Path segments to join
   * @returns A new Path
   */
  joinpath(...pathSegments: string[]): Path {
    return new Path(this._path, ...pathSegments)
  }

  /**
   * Division operator alternative: join paths.
   *
   * @param other - Path segment to join
   * @returns A new Path
   */
  div(other: string | Path): Path {
    const otherPath = other instanceof Path ? other.toString() : other
    return new Path(this._path, otherPath)
  }

  /**
   * Return a string representation of the path.
   */
  toString(): string {
    return this._path
  }

  /**
   * Return the path as a POSIX path string.
   */
  asPosix(): string {
    return this._path.split(sep).join("/")
  }

  /**
   * Return the path as a URI.
   */
  asUri(): string {
    const absolute = resolve(this._path)
    return `file://${absolute}`
  }

  // Filesystem operations (async)

  /**
   * Whether the path exists.
   */
  async exists(): Promise<boolean> {
    try {
      await access(this._path)
      return true
    } catch {
      return false
    }
  }

  /**
   * Whether the path is a file.
   */
  async isFile(): Promise<boolean> {
    try {
      return (await stat(this._path)).isFile()
    } catch {
      return false
    }
  }

  /**
   * Whether the path is a directory.
   */
  async isDir(): Promise<boolean> {
    try {
      return (await stat(this._path)).isDirectory()
    } catch {
      return false
    }
  }

  /**
   * Whether the path is a symbolic link.
   */
  async isSymlink(): Promise<boolean> {
    try {
      return (await lstat(this._path)).isSymbolicLink()
    } catch {
      return false
    }
  }

  /**
   * Read the file contents as text.
   *
   * @param encoding - Text encoding (default: utf-8)
   * @returns File contents as string
   */
  async readText(encoding: BufferEncoding = "utf-8"): Promise<string> {
    return readFile(this._path, { encoding })
  }

  /**
   * Write text to the file.
   *
   * @param data - Text to write
   * @param encoding - Text encoding (default: utf-8)
   */
  async writeText(data: string, encoding: BufferEncoding = "utf-8"): Promise<void> {
    await writeFile(this._path, data, { encoding })
  }

  /**
   * Read the file contents as bytes.
   *
   * @returns File contents as Uint8Array
   */
  async readBytes(): Promise<Uint8Array> {
    return new Uint8Array(await readFile(this._path))
  }

  /**
   * Write bytes to the file.
   *
   * @param data - Bytes to write
   */
  async writeBytes(data: Uint8Array): Promise<void> {
    await writeFile(this._path, data)
  }

  /**
   * Create the directory (and parents if necessary).
   *
   * @param options - Options object
   */
  async mkdir(options?: { parents?: boolean; existOk?: boolean }): Promise<void> {
    try {
      await mkdir(this._path, { recursive: options?.parents ?? false })
    } catch (err) {
      if (!(options?.existOk && (err as NodeJS.ErrnoException).code === "EEXIST")) {
        throw err
      }
    }
  }

  /**
   * Remove the directory.
   */
  async rmdir(): Promise<void> {
    await rmdir(this._path)
  }

  /**
   * Remove the file or symbolic link.
   */
  async unlink(): Promise<void> {
    await unlink(this._path)
  }

  /**
   * Rename the path to target.
   *
   * @param target - New path
   * @returns The new Path
   */
  async rename(target: string | Path): Promise<Path> {
    const targetPath = target instanceof Path ? target.toString() : target
    await rename(this._path, targetPath)
    return new Path(targetPath)
  }

  /**
   * Replace target with this file.
   *
   * @param target - Target path to replace
   * @returns The new Path
   */
  async replace(target: string | Path): Promise<Path> {
    return this.rename(target)
  }

  /**
   * Make the path absolute.
   *
   * @returns Absolute path
   */
  resolve(): Path {
    return new Path(resolve(this._path))
  }

  /**
   * Return the absolute path.
   *
   * @returns Absolute path
   */
  absolute(): Path {
    return this.resolve()
  }

  /**
   * Return the real path (resolving symlinks).
   *
   * @returns Real path
   */
  async readlink(): Promise<Path> {
    return new Path(await readlink(this._path))
  }

  /**
   * Get file statistics.
   *
   * @returns File stat object
   */
  async stat(): Promise<Stats> {
    return stat(this._path)
  }

  /**
   * Get symbolic link statistics.
   *
   * @returns Stat object for the symlink itself
   */
  async lstat(): Promise<Stats> {
    return lstat(this._path)
  }

  /**
   * Iterate over directory contents.
   *
   * @returns Array of Path objects
   */
  async iterdir(): Promise<Path[]> {
    const entries = await readdir(this._path)
    return entries.map((name) => new Path(this._path, name))
  }

  /**
   * Glob pattern matching.
   *
   * @param pattern - Glob pattern
   * @returns Array of matching Path objects
   */
  async glob(pattern: string): Promise<Path[]> {
    return this.matchGlob(pattern, false)
  }

  /**
   * Recursive glob pattern matching.
   *
   * @param pattern - Glob pattern
   * @returns Array of matching Path objects
   */
  async rglob(pattern: string): Promise<Path[]> {
    return this.matchGlob(pattern, true)
  }

  /**
   * Internal glob matching implementation.
   */
  private async matchGlob(pattern: string, recursive: boolean): Promise<Path[]> {
    const results: Path[] = []
    const regex = this.globToRegex(pattern)

    const walk = async (dir: string): Promise<void> => {
      let entries: string[]
      try {
        entries = await readdir(dir)
      } catch {
        return
      }

      for (const entry of entries) {
        const fullPath = join(dir, entry)
        const relativePath = relative(this._path, fullPath)

        if (regex.test(relativePath) || regex.test(entry)) {
          results.push(new Path(fullPath))
        }

        if (recursive) {
          try {
            if ((await stat(fullPath)).isDirectory()) {
              await walk(fullPath)
            }
          } catch {
            // Ignore errors accessing directories
          }
        }
      }
    }

    await walk(this._path)
    return results
  }

  /**
   * Convert glob pattern to regex.
   */
  private globToRegex(pattern: string): RegExp {
    const regex = pattern
      .replace(/[.+^${}()|[\]\\]/g, "\\$&") // Escape special regex chars
      .replace(/\*\*/g, "<<<GLOBSTAR>>>") // Temporarily replace **
      .replace(/\*/g, "[^/]*") // * matches any except /
      .replace(/\?/g, "[^/]") // ? matches single char except /
      .replace(/<<<GLOBSTAR>>>/g, ".*") // ** matches anything

    return new RegExp(`^${regex}$`)
  }

  /**
   * Create a symbolic link.
   *
   * @param target - Target of the symlink
   */
  async symlinkTo(target: string | Path): Promise<void> {
    const targetPath = target instanceof Path ? target.toString() : target
    await symlink(targetPath, this._path)
  }

  /**
   * Create a hard link.
   *
   * @param target - Target of the link
   */
  async linkTo(target: string | Path): Promise<void> {
    const targetPath = target instanceof Path ? target.toString() : target
    await link(targetPath, this._path)
  }

  /**
   * Change file permissions.
   *
   * @param mode - Permission mode
   */
  async chmod(mode: number): Promise<void> {
    await chmod(this._path, mode)
  }

  /**
   * Update access and modification times.
   *
   * @param atime - Access time
   * @param mtime - Modification time
   */
  async touch(atime?: Date, mtime?: Date): Promise<void> {
    const now = new Date()
    const accessTime = atime ?? now
    const modTime = mtime ?? now

    if (!(await this.exists())) {
      await writeFile(this._path, "")
    }
    await utimes(this._path, accessTime, modTime)
  }

  /**
   * Check if path matches a pattern.
   *
   * @param pattern - Glob pattern
   * @returns True if matches
   */
  match(pattern: string): boolean {
    const regex = this.globToRegex(pattern)
    return regex.test(this.name) || regex.test(this._path)
  }

  /**
   * Return path relative to another path.
   *
   * @param other - Base path
   * @returns Relative path
   */
  relativeTo(other: string | Path): Path {
    const otherPath = other instanceof Path ? other.toString() : other
    return new Path(relative(otherPath, this._path))
  }

  /**
   * Return a new path with a different suffix.
   *
   * @param suffix - New suffix
   * @returns New Path
   */
  withSuffix(suffix: string): Path {
    const parsed = parse(this._path)
    return new Path(join(parsed.dir, parsed.name + suffix))
  }

  /**
   * Return a new path with a different name.
   *
   * @param name - New name
   * @returns New Path
   */
  withName(name: string): Path {
    const parent = dirname(this._path)
    return new Path(parent, name)
  }

  /**
   * Return a new path with a different stem.
   *
   * @param stem - New stem
   * @returns New Path
   */
  withStem(stem: string): Path {
    const suffix = this.suffix
    return this.withName(stem + suffix)
  }

  /**
   * Get the current working directory as a Path.
   */
  static cwd(): Path {
    return new Path(process.cwd())
  }

  /**
   * Get the home directory as a Path.
   */
  static home(): Path {
    return new Path(process.env.HOME ?? process.env.USERPROFILE ?? "")
  }
}

/**
 * PurePath class for path manipulation without filesystem access.
 * This is an alias for Path that only uses the pure path operations.
 */
export const PurePath = Path

/**
 * PurePosixPath for POSIX-style paths.
 */
export const PurePosixPath = Path

/**
 * PureWindowsPath for Windows-style paths.
 */
export const PureWindowsPath = Path

/**
 * PosixPath for POSIX filesystem operations.
 */
export const PosixPath = Path

/**
 * WindowsPath for Windows filesystem operations.
 */
export const WindowsPath = Path

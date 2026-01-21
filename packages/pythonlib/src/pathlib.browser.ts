/**
 * Python pathlib module for TypeScript - Browser version
 *
 * Provides object-oriented filesystem paths.
 * Filesystem operations throw errors in browser environment.
 *
 * @see {@link https://docs.python.org/3/library/pathlib.html | Python pathlib documentation}
 * @module
 */

// Simple path utilities for browser (no node:path dependency)
const SEP = "/"

function basename(p: string): string {
  const normalized = p.replace(/\/+$/, "")
  const idx = normalized.lastIndexOf(SEP)
  return idx === -1 ? normalized : normalized.slice(idx + 1)
}

function dirname(p: string): string {
  const normalized = p.replace(/\/+$/, "")
  const idx = normalized.lastIndexOf(SEP)
  if (idx === -1) return ""
  if (idx === 0) return SEP
  return normalized.slice(0, idx)
}

function extname(p: string): string {
  const base = basename(p)
  const dotIdx = base.lastIndexOf(".")
  if (dotIdx <= 0) return ""
  return base.slice(dotIdx)
}

function join(...parts: string[]): string {
  return parts.filter(Boolean).join(SEP).replace(/\/+/g, "/")
}

function isAbsolute(p: string): boolean {
  return p.startsWith(SEP)
}

function normalize(p: string): string {
  if (!p) return "."
  const isAbs = isAbsolute(p)
  const parts = p.split(SEP).filter(Boolean)
  const result: string[] = []

  for (const part of parts) {
    if (part === "..") {
      if (result.length > 0 && result[result.length - 1] !== "..") {
        result.pop()
      } else if (!isAbs) {
        result.push("..")
      }
    } else if (part !== ".") {
      result.push(part)
    }
  }

  const normalized = result.join(SEP)
  if (isAbs) return SEP + normalized
  return normalized || "."
}

/**
 * Path class representing a filesystem path.
 * Provides path manipulation; filesystem operations throw in browser.
 */
export class Path {
  private readonly _path: string

  constructor(...pathSegments: string[]) {
    if (pathSegments.length === 0) {
      this._path = "."
    } else {
      this._path = join(...pathSegments)
    }
  }

  static of(...pathSegments: string[]): Path {
    return new Path(...pathSegments)
  }

  get name(): string {
    return basename(this._path)
  }

  get stem(): string {
    const base = basename(this._path)
    const ext = extname(base)
    return ext ? base.slice(0, -ext.length) : base
  }

  get suffix(): string {
    return extname(this._path)
  }

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

  get parent(): Path {
    const parentPath = dirname(this._path)
    return new Path(parentPath || ".")
  }

  get parents(): Path[] {
    const parents: Path[] = []
    let current = this.parent
    while (current._path !== "." && current._path !== SEP) {
      parents.push(current)
      current = current.parent
    }
    if (current._path === SEP) {
      parents.push(current)
    }
    return parents
  }

  get parts(): string[] {
    const parts: string[] = []
    if (this._path.startsWith(SEP)) {
      parts.push(SEP)
    }
    parts.push(...this._path.split(SEP).filter(Boolean))
    return parts
  }

  get anchor(): string {
    return this._path.startsWith(SEP) ? SEP : ""
  }

  get root(): string {
    return this.anchor
  }

  isAbsolute(): boolean {
    return isAbsolute(this._path)
  }

  isRelativeTo(other: string | Path): boolean {
    const otherPath = other instanceof Path ? other._path : other
    const normalizedThis = normalize(this._path)
    const normalizedOther = normalize(otherPath)
    return normalizedThis.startsWith(normalizedOther + SEP) || normalizedThis === normalizedOther
  }

  joinpath(...pathSegments: (string | Path)[]): Path {
    const segments = pathSegments.map((p) => (p instanceof Path ? p._path : p))
    return new Path(this._path, ...segments)
  }

  div(other: string | Path): Path {
    return this.joinpath(other)
  }

  withName(name: string): Path {
    return new Path(dirname(this._path), name)
  }

  withStem(stem: string): Path {
    return new Path(dirname(this._path), stem + this.suffix)
  }

  withSuffix(suffix: string): Path {
    return new Path(dirname(this._path), this.stem + suffix)
  }

  toString(): string {
    return this._path
  }

  valueOf(): string {
    return this._path
  }

  [Symbol.toPrimitive](_hint: string): string {
    return this._path
  }

  /* v8 ignore start -- browser stubs for filesystem operations @preserve */
  /* eslint-disable @typescript-eslint/require-await */

  async exists(): Promise<boolean> {
    return false
  }

  async isFile(): Promise<boolean> {
    return false
  }

  async isDir(): Promise<boolean> {
    return false
  }

  async isSymlink(): Promise<boolean> {
    return false
  }

  async stat(): Promise<unknown> {
    throw new Error("Path.stat is not supported in browser environment")
  }

  async lstat(): Promise<unknown> {
    throw new Error("Path.lstat is not supported in browser environment")
  }

  async readText(_encoding?: BufferEncoding): Promise<string> {
    throw new Error("Path.readText is not supported in browser environment")
  }

  async writeText(_content: string, _encoding?: BufferEncoding): Promise<void> {
    throw new Error("Path.writeText is not supported in browser environment")
  }

  async readBytes(): Promise<Uint8Array> {
    throw new Error("Path.readBytes is not supported in browser environment")
  }

  async writeBytes(_content: Uint8Array): Promise<void> {
    throw new Error("Path.writeBytes is not supported in browser environment")
  }

  async mkdir(_options?: { parents?: boolean; existOk?: boolean; mode?: number }): Promise<void> {
    throw new Error("Path.mkdir is not supported in browser environment")
  }

  async rmdir(): Promise<void> {
    throw new Error("Path.rmdir is not supported in browser environment")
  }

  async unlink(): Promise<void> {
    throw new Error("Path.unlink is not supported in browser environment")
  }

  async rename(_target: string | Path): Promise<Path> {
    throw new Error("Path.rename is not supported in browser environment")
  }

  async replace(_target: string | Path): Promise<Path> {
    throw new Error("Path.replace is not supported in browser environment")
  }

  resolve(): Path {
    return new Path(normalize(this._path))
  }

  absolute(): Path {
    if (this.isAbsolute()) {
      return this.resolve()
    }
    return new Path(SEP + this._path).resolve()
  }

  async readlink(): Promise<Path> {
    throw new Error("Path.readlink is not supported in browser environment")
  }

  async symlinkTo(_target: string | Path): Promise<void> {
    throw new Error("Path.symlinkTo is not supported in browser environment")
  }

  async linkTo(_target: string | Path): Promise<void> {
    throw new Error("Path.linkTo is not supported in browser environment")
  }

  async chmod(_mode: number): Promise<void> {
    throw new Error("Path.chmod is not supported in browser environment")
  }

  async touch(_options?: { mode?: number; existOk?: boolean }): Promise<void> {
    throw new Error("Path.touch is not supported in browser environment")
  }

  async iterdir(): Promise<Path[]> {
    throw new Error("Path.iterdir is not supported in browser environment")
  }

  async glob(_pattern: string): Promise<Path[]> {
    return []
  }

  async rglob(_pattern: string): Promise<Path[]> {
    return []
  }

  /* v8 ignore stop */
}

/**
 * PurePath provides path operations without filesystem access.
 * In browser, this is identical to Path.
 */
export const PurePath = Path
export const PurePosixPath = Path
export const PureWindowsPath = Path
export const PosixPath = Path
export const WindowsPath = Path

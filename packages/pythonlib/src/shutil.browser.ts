/**
 * Python shutil module for TypeScript - Browser version
 *
 * Browser stub - file operations are not available.
 *
 * @see {@link https://docs.python.org/3/library/shutil.html | Python shutil documentation}
 * @module
 */

/* v8 ignore start -- browser stubs @preserve */
/* eslint-disable @typescript-eslint/require-await */

/**
 * Copy file from src to dst.
 * Browser stub - throws error.
 */
export async function copy(_src: string, _dst: string): Promise<string> {
  throw new Error("shutil.copy is not supported in browser environment")
}

/**
 * Copy file with metadata from src to dst.
 * Browser stub - throws error.
 */
export async function copy2(_src: string, _dst: string): Promise<string> {
  throw new Error("shutil.copy2 is not supported in browser environment")
}

/**
 * Copy an entire directory tree.
 * Browser stub - throws error.
 */
export async function copytree(
  _src: string,
  _dst: string,
  _options?: {
    symlinks?: boolean
    ignore?: (dir: string, files: string[]) => string[]
    copyFunction?: (src: string, dst: string) => Promise<string>
    dirsExist_ok?: boolean
  }
): Promise<string> {
  throw new Error("shutil.copytree is not supported in browser environment")
}

/**
 * Move a file or directory.
 * Browser stub - throws error.
 */
export async function move(_src: string, _dst: string): Promise<string> {
  throw new Error("shutil.move is not supported in browser environment")
}

/**
 * Remove a directory tree.
 * Browser stub - throws error.
 */
export async function rmtree(_path: string, _ignoreErrors = false): Promise<void> {
  throw new Error("shutil.rmtree is not supported in browser environment")
}

/**
 * Find an executable in PATH.
 * Browser stub - returns null.
 */
export async function which(_cmd: string, _mode?: number, _path?: string): Promise<string | null> {
  return null
}

/**
 * Return disk usage statistics.
 * Browser stub - throws error.
 */
export async function diskUsage(
  _path: string
): Promise<{ total: number; used: number; free: number }> {
  throw new Error("shutil.diskUsage is not supported in browser environment")
}

/**
 * Copy file permission bits.
 * Browser stub - no-op.
 */
export async function copyMode(_src: string, _dst: string): Promise<void> {
  // No-op in browser
}

/**
 * Copy file stat info.
 * Browser stub - no-op.
 */
export async function copyStat(_src: string, _dst: string): Promise<void> {
  // No-op in browser
}

/**
 * Copy file without metadata.
 * Browser stub - throws error.
 */
export async function copyFile(_src: string, _dst: string): Promise<string> {
  throw new Error("shutil.copyFile is not supported in browser environment")
}

/**
 * Copy file object.
 * Browser stub - throws error.
 */
export async function copyFileObj(
  _fsrc: { read: (size: number) => Promise<Uint8Array | null> },
  _fdst: { write: (data: Uint8Array) => Promise<number> },
  _length?: number
): Promise<void> {
  throw new Error("shutil.copyFileObj is not supported in browser environment")
}

/**
 * Get terminal size.
 */
export function getTerminalSize(fallback?: [number, number]): { columns: number; lines: number } {
  const [columns, lines] = fallback ?? [80, 24]
  return { columns, lines }
}

/**
 * Make an archive file.
 * Browser stub - throws error.
 */
export function makeArchive(_baseName: string, _format: string, _rootDir: string): string {
  throw new Error("makeArchive is not supported in browser environment")
}

/**
 * Unpack an archive file.
 * Browser stub - throws error.
 */
export function unpackArchive(_filename: string, _extractDir?: string): void {
  throw new Error("unpackArchive is not supported in browser environment")
}

/* v8 ignore stop */

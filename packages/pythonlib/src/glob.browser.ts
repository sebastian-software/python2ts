/**
 * Python glob module for TypeScript - Browser version
 *
 * Browser stub - filesystem operations are not available.
 *
 * @see {@link https://docs.python.org/3/library/glob.html | Python glob documentation}
 * @module
 */

/* v8 ignore start -- browser stubs @preserve */
/* eslint-disable @typescript-eslint/require-await */

/**
 * Return a list of paths matching a pathname pattern.
 * Browser stub - always returns empty array.
 */
export async function glob(
  _pattern: string,
  _options?: {
    recursive?: boolean
    rootDir?: string
    includeHidden?: boolean
  }
): Promise<string[]> {
  return []
}

/**
 * Return an async iterator of paths matching a pathname pattern.
 * Browser stub - yields nothing.
 */
export async function* iglob(
  _pattern: string,
  _options?: {
    recursive?: boolean
    rootDir?: string
    includeHidden?: boolean
  }
): AsyncGenerator<string> {
  // No-op in browser
}

/**
 * Escape all special characters in a pathname.
 */
export function escape(pathname: string): string {
  return pathname.replace(/([*?[])/g, "[$1]")
}

/**
 * Return true if the pattern contains any magic glob characters.
 */
export function hasMagic(pattern: string): boolean {
  return /[*?[\]]/.test(pattern)
}

/**
 * Return a list of all files matching pattern recursively.
 * Browser stub - always returns empty array.
 */
export async function rglob(_pattern: string, _rootDir = "."): Promise<string[]> {
  return []
}

/* v8 ignore stop */

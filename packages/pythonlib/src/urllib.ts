/**
 * Python urllib module for TypeScript
 *
 * Provides URL handling and parsing utilities.
 *
 * @see {@link https://docs.python.org/3/library/urllib.html | Python urllib documentation}
 * @module
 */

/**
 * Parsed URL result structure.
 */
export interface ParseResult {
  /** URL scheme (e.g., "http", "https") */
  scheme: string
  /** Network location (e.g., "example.com:8080") */
  netloc: string
  /** URL path */
  path: string
  /** Query parameters (without leading ?) */
  params: string
  /** Query string (without leading ?) */
  query: string
  /** Fragment (without leading #) */
  fragment: string
  /** Username if present */
  username: string | null
  /** Password if present */
  password: string | null
  /** Hostname */
  hostname: string | null
  /** Port number */
  port: number | null
}

/**
 * Parse a URL into its components.
 *
 * @param urlstring - The URL to parse
 * @param scheme - Default scheme if not present in URL
 * @param allowFragments - Whether to parse fragments (default: true)
 * @returns Parsed URL components
 *
 * @example
 * ```typescript
 * const result = urlparse("https://user:pass@example.com:8080/path?query=1#frag")
 * console.log(result.scheme)   // "https"
 * console.log(result.hostname) // "example.com"
 * console.log(result.port)     // 8080
 * ```
 */
export function urlparse(urlstring: string, scheme = "", allowFragments = true): ParseResult {
  try {
    // Handle URLs without scheme
    let url: URL
    if (!urlstring.includes("://")) {
      url = new URL((scheme || "http") + "://" + urlstring)
    } else {
      url = new URL(urlstring)
    }

    let fragment = ""
    if (allowFragments && url.hash) {
      fragment = url.hash.slice(1)
    }

    // Build netloc to include userinfo if present (Python compatibility)
    let netloc = url.host
    if (url.username) {
      const userinfo = url.password ? `${url.username}:${url.password}` : url.username
      netloc = `${userinfo}@${url.host}`
    }

    return {
      scheme: url.protocol.slice(0, -1),
      netloc,
      path: url.pathname,
      params: "",
      query: url.search ? url.search.slice(1) : "",
      fragment,
      username: url.username || null,
      password: url.password || null,
      hostname: url.hostname || null,
      port: url.port ? parseInt(url.port, 10) : null
    }
  } catch {
    // Fallback for invalid URLs
    return {
      scheme: scheme,
      netloc: "",
      path: urlstring,
      params: "",
      query: "",
      fragment: "",
      username: null,
      password: null,
      hostname: null,
      port: null
    }
  }
}

/**
 * Combine URL components back into a URL string.
 *
 * @param components - URL components tuple [scheme, netloc, path, params, query, fragment]
 * @returns Combined URL string
 */
export function urlunparse(
  components: [string, string, string, string, string, string] | ParseResult
): string {
  let scheme: string, netloc: string, path: string, params: string, query: string, fragment: string

  if (Array.isArray(components)) {
    ;[scheme, netloc, path, params, query, fragment] = components
  } else {
    ;({ scheme, netloc, path, params, query, fragment } = components)
  }

  let url = ""

  if (scheme) {
    url += scheme + "://"
  }

  if (netloc) {
    url += netloc
  }

  url += path

  if (params) {
    url += ";" + params
  }

  if (query) {
    url += "?" + query
  }

  if (fragment) {
    url += "#" + fragment
  }

  return url
}

/**
 * Join a base URL with another URL.
 *
 * @param base - Base URL
 * @param url - URL to join (can be relative)
 * @param allowFragments - Whether to allow fragments
 * @returns Combined URL
 */
export function urljoin(base: string, url: string, allowFragments = true): string {
  if (!base) return url
  if (!url) return base

  try {
    const result = new URL(url, base)
    if (!allowFragments) {
      result.hash = ""
    }
    return result.href
  } catch {
    return url
  }
}

/**
 * Encode a dictionary or sequence of tuples as a query string.
 *
 * @param query - Query parameters as object or array of tuples
 * @param doseq - If true, treat sequence values as separate parameters
 * @returns URL-encoded query string
 */
export function urlencode(
  query: Record<string, string | string[]> | Array<[string, string]>,
  doseq = false
): string {
  const params = new URLSearchParams()

  if (Array.isArray(query)) {
    for (const [key, value] of query) {
      params.append(key, value)
    }
  } else {
    for (const [key, value] of Object.entries(query)) {
      if (Array.isArray(value) && doseq) {
        for (const v of value) {
          params.append(key, v)
        }
      } else if (Array.isArray(value)) {
        params.append(key, value.join(","))
      } else {
        params.append(key, value)
      }
    }
  }

  return params.toString()
}

/**
 * Parse a query string into a dictionary.
 *
 * @param qs - Query string to parse
 * @param keepBlankValues - Whether to keep blank values
 * @returns Object mapping keys to arrays of values
 */
export function parseQs(qs: string, keepBlankValues = false): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  const params = new URLSearchParams(qs)

  for (const [key, value] of params) {
    if (!keepBlankValues && value === "") {
      continue
    }
    if (!(key in result)) {
      result[key] = []
    }
    result[key]?.push(value)
  }

  return result
}

/**
 * Parse a query string into a dictionary (single values).
 *
 * @param qs - Query string to parse
 * @param keepBlankValues - Whether to keep blank values
 * @returns Object mapping keys to single values
 */
export function parseQsl(qs: string, keepBlankValues = false): Array<[string, string]> {
  const result: Array<[string, string]> = []
  const params = new URLSearchParams(qs)

  for (const [key, value] of params) {
    if (!keepBlankValues && value === "") {
      continue
    }
    result.push([key, value])
  }

  return result
}

/**
 * Percent-encode a string for use in a URL.
 *
 * @param s - String to encode
 * @param safe - Characters that should not be encoded (default: empty)
 * @returns Percent-encoded string
 */
export function quote(s: string, safe = ""): string {
  let result = encodeURIComponent(s)

  // Don't encode safe characters
  for (const char of safe) {
    result = result.replace(new RegExp(encodeURIComponent(char), "g"), char)
  }

  return result
}

/**
 * Like quote() but also encodes forward slashes.
 *
 * @param s - String to encode
 * @param safe - Characters that should not be encoded
 * @returns Percent-encoded string
 */
export function quotePlus(s: string, safe = ""): string {
  return quote(s, safe).replace(/%20/g, "+")
}

/**
 * Decode a percent-encoded string.
 *
 * @param s - String to decode
 * @returns Decoded string
 */
export function unquote(s: string): string {
  return decodeURIComponent(s)
}

/**
 * Like unquote() but also decodes plus signs as spaces.
 *
 * @param s - String to decode
 * @returns Decoded string
 */
export function unquotePlus(s: string): string {
  return decodeURIComponent(s.replace(/\+/g, " "))
}

/**
 * Split a URL after the scheme into [scheme, rest].
 *
 * @param url - URL to split
 * @returns Tuple of [scheme, rest]
 */
export function splittype(url: string): [string, string] {
  const match = /^([a-zA-Z][a-zA-Z0-9+.-]*):(.*)$/.exec(url)
  if (match) {
    return [match[1] ?? "", match[2] ?? ""]
  }
  return ["", url]
}

/**
 * Split a URL after the host into [host, rest].
 *
 * @param url - URL to split
 * @returns Tuple of [host, rest]
 */
export function splithost(url: string): [string | null, string] {
  const match = /^\/\/([^/?#]*)(.*)$/.exec(url)
  if (match) {
    return [match[1] ?? null, match[2] ?? ""]
  }
  return [null, url]
}

/**
 * Split a host into [user, host].
 *
 * @param host - Host string (may include user:pass@)
 * @returns Tuple of [user, host]
 */
export function splituser(host: string): [string | null, string] {
  const match = /^([^@]*)@(.*)$/.exec(host)
  if (match) {
    return [match[1] ?? null, match[2] ?? ""]
  }
  return [null, host]
}

/**
 * Split a user:pass into [user, password].
 *
 * @param user - User string (may include :pass)
 * @returns Tuple of [user, password]
 */
export function splitpasswd(user: string): [string, string | null] {
  const match = /^([^:]*):(.*)$/.exec(user)
  if (match) {
    return [match[1] ?? "", match[2] ?? null]
  }
  return [user, null]
}

/**
 * Split a host:port into [host, port].
 *
 * @param host - Host string (may include :port)
 * @returns Tuple of [host, port]
 */
export function splitport(host: string): [string, string | null] {
  // Handle IPv6 addresses
  if (host.startsWith("[")) {
    const match = /^\[([^\]]+)\]:?(\d*)$/.exec(host)
    if (match) {
      return [match[1] ?? "", match[2] || null]
    }
    return [host, null]
  }

  const match = /^(.*):(\d+)$/.exec(host)
  if (match) {
    return [match[1] ?? "", match[2] ?? null]
  }
  return [host, null]
}

/**
 * Namespace object for parse functions (urllib.parse compatibility).
 */
export const parse = {
  urlparse,
  urlunparse,
  urljoin,
  urlencode,
  parseQs,
  parseQsl,
  quote,
  quotePlus,
  unquote,
  unquotePlus,
  splittype,
  splithost,
  splituser,
  splitpasswd,
  splitport
}

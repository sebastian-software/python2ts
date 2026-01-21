/**
 * Python base64 module for TypeScript
 *
 * Provides encoding and decoding using Base64 and URL-safe Base64.
 *
 * @see {@link https://docs.python.org/3/library/base64.html | Python base64 documentation}
 * @module
 */

/**
 * Helper function to convert Uint8Array to base64 string
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    // Node.js environment
    return Buffer.from(bytes).toString("base64")
  }
  /* v8 ignore start -- browser fallback @preserve */
  // Browser environment
  let binary = ""
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
  /* v8 ignore stop */
}

/**
 * Helper function to convert base64 string to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    // Node.js environment
    return new Uint8Array(Buffer.from(base64, "base64"))
  }
  /* v8 ignore start -- browser fallback @preserve */
  // Browser environment
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
  /* v8 ignore stop */
}

/**
 * Encode bytes-like object using Base64 and return bytes.
 *
 * @param s - Bytes to encode (Uint8Array or string)
 * @returns Base64 encoded Uint8Array
 *
 * @example
 * ```typescript
 * const encoded = b64encode(new TextEncoder().encode("hello"))
 * console.log(new TextDecoder().decode(encoded)) // "aGVsbG8="
 * ```
 */
export function b64encode(s: Uint8Array | string): Uint8Array {
  const bytes = typeof s === "string" ? new TextEncoder().encode(s) : s
  const base64String = uint8ArrayToBase64(bytes)
  return new TextEncoder().encode(base64String)
}

/**
 * Decode Base64 encoded bytes-like object or ASCII string and return bytes.
 *
 * @param s - Base64 encoded data (Uint8Array or string)
 * @returns Decoded Uint8Array
 *
 * @example
 * ```typescript
 * const decoded = b64decode("aGVsbG8=")
 * console.log(new TextDecoder().decode(decoded)) // "hello"
 * ```
 */
export function b64decode(s: Uint8Array | string): Uint8Array {
  const base64String = typeof s === "string" ? s : new TextDecoder().decode(s)
  // Remove whitespace (Python's b64decode is lenient)
  const cleaned = base64String.replace(/\s/g, "")
  return base64ToUint8Array(cleaned)
}

/**
 * Encode bytes-like object using standard Base64 and return bytes.
 * This is identical to b64encode().
 *
 * @param s - Bytes to encode
 * @returns Base64 encoded Uint8Array
 */
export function standardB64encode(s: Uint8Array | string): Uint8Array {
  return b64encode(s)
}

/**
 * Decode standard Base64 encoded bytes-like object and return bytes.
 * This is identical to b64decode().
 *
 * @param s - Base64 encoded data
 * @returns Decoded Uint8Array
 */
export function standardB64decode(s: Uint8Array | string): Uint8Array {
  return b64decode(s)
}

/**
 * Encode bytes-like object using URL-safe Base64 and return bytes.
 *
 * URL-safe Base64 uses - instead of + and _ instead of /,
 * and omits padding characters.
 *
 * @param s - Bytes to encode
 * @returns URL-safe Base64 encoded Uint8Array
 *
 * @example
 * ```typescript
 * const encoded = urlsafeB64encode(new Uint8Array([255, 239]))
 * // Uses - and _ instead of + and /
 * ```
 */
export function urlsafeB64encode(s: Uint8Array | string): Uint8Array {
  const bytes = typeof s === "string" ? new TextEncoder().encode(s) : s
  const base64String = uint8ArrayToBase64(bytes)
  // Convert to URL-safe: + -> -, / -> _
  const urlSafe = base64String.replace(/\+/g, "-").replace(/\//g, "_")
  return new TextEncoder().encode(urlSafe)
}

/**
 * Decode URL-safe Base64 encoded bytes-like object and return bytes.
 *
 * @param s - URL-safe Base64 encoded data
 * @returns Decoded Uint8Array
 */
export function urlsafeB64decode(s: Uint8Array | string): Uint8Array {
  const base64String = typeof s === "string" ? s : new TextDecoder().decode(s)
  // Convert from URL-safe: - -> +, _ -> /
  const cleaned = base64String.replace(/\s/g, "").replace(/-/g, "+").replace(/_/g, "/")
  // Add padding if needed
  const padding = (4 - (cleaned.length % 4)) % 4
  const padded = cleaned + "=".repeat(padding)
  return base64ToUint8Array(padded)
}

/**
 * Encode bytes-like object using Base16 (hexadecimal) and return bytes.
 *
 * @param s - Bytes to encode
 * @returns Hexadecimal encoded Uint8Array (uppercase)
 */
export function b16encode(s: Uint8Array | string): Uint8Array {
  const bytes = typeof s === "string" ? new TextEncoder().encode(s) : s
  let hex = ""
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, "0").toUpperCase()
  }
  return new TextEncoder().encode(hex)
}

/**
 * Decode Base16 (hexadecimal) encoded bytes-like object and return bytes.
 *
 * @param s - Hexadecimal encoded data
 * @returns Decoded Uint8Array
 */
export function b16decode(s: Uint8Array | string): Uint8Array {
  const hexString = typeof s === "string" ? s : new TextDecoder().decode(s)
  const cleaned = hexString.replace(/\s/g, "")
  if (cleaned.length % 2 !== 0) {
    throw new Error("Non-hexadecimal digit found")
  }
  const bytes = new Uint8Array(cleaned.length / 2)
  for (let i = 0; i < cleaned.length; i += 2) {
    const byte = parseInt(cleaned.substring(i, i + 2), 16)
    if (isNaN(byte)) {
      throw new Error("Non-hexadecimal digit found")
    }
    bytes[i / 2] = byte
  }
  return bytes
}

/**
 * Encode bytes-like object using Base32 and return bytes.
 *
 * @param s - Bytes to encode
 * @returns Base32 encoded Uint8Array
 */
export function b32encode(s: Uint8Array | string): Uint8Array {
  const bytes = typeof s === "string" ? new TextEncoder().encode(s) : s
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
  let result = ""
  let bits = 0
  let value = 0

  for (const byte of bytes) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      bits -= 5
      const idx = (value >> bits) & 0x1f
      result += alphabet[idx] ?? ""
    }
  }

  if (bits > 0) {
    const idx = (value << (5 - bits)) & 0x1f
    result += alphabet[idx] ?? ""
  }

  // Add padding
  while (result.length % 8 !== 0) {
    result += "="
  }

  return new TextEncoder().encode(result)
}

/**
 * Decode Base32 encoded bytes-like object and return bytes.
 *
 * @param s - Base32 encoded data
 * @returns Decoded Uint8Array
 */
export function b32decode(s: Uint8Array | string): Uint8Array {
  const base32String = typeof s === "string" ? s : new TextDecoder().decode(s)
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

  // Remove padding and convert to uppercase
  const cleaned = base32String.replace(/=+$/, "").replace(/\s/g, "").toUpperCase()

  let bits = 0
  let value = 0
  const result: number[] = []

  for (const char of cleaned) {
    const idx = alphabet.indexOf(char)
    if (idx === -1) {
      throw new Error("Invalid Base32 character")
    }
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      bits -= 8
      result.push((value >> bits) & 0xff)
    }
  }

  return new Uint8Array(result)
}

/**
 * Encode bytes-like object using Ascii85 (also known as Base85) and return bytes.
 *
 * @param s - Bytes to encode
 * @returns Ascii85 encoded Uint8Array
 */
export function a85encode(s: Uint8Array | string): Uint8Array {
  const bytes = typeof s === "string" ? new TextEncoder().encode(s) : s
  let result = ""

  // Process 4 bytes at a time
  for (let i = 0; i < bytes.length; i += 4) {
    const chunk = bytes.slice(i, i + 4)
    let value = 0

    for (const byte of chunk) {
      value = value * 256 + byte
    }

    // Pad with zeros if less than 4 bytes
    for (let j = chunk.length; j < 4; j++) {
      value = value * 256
    }

    // Special case: all zeros encoded as 'z'
    if (value === 0 && chunk.length === 4) {
      result += "z"
    } else {
      // Encode to 5 base-85 digits
      const chars: string[] = []
      for (let j = 0; j < 5; j++) {
        chars.unshift(String.fromCharCode((value % 85) + 33))
        value = Math.floor(value / 85)
      }
      // Only output as many chars as needed based on input length
      const outputLen = chunk.length + 1
      result += chars.slice(0, outputLen).join("")
    }
  }

  return new TextEncoder().encode(result)
}

/**
 * Decode Ascii85 encoded bytes-like object and return bytes.
 *
 * @param s - Ascii85 encoded data
 * @returns Decoded Uint8Array
 */
export function a85decode(s: Uint8Array | string): Uint8Array {
  const ascii85String = typeof s === "string" ? s : new TextDecoder().decode(s)
  const cleaned = ascii85String.replace(/\s/g, "")
  const result: number[] = []

  let i = 0
  while (i < cleaned.length) {
    if (cleaned[i] === "z") {
      // Special case: 'z' represents 4 zero bytes
      result.push(0, 0, 0, 0)
      i++
    } else {
      // Read up to 5 characters
      let chunk = cleaned.slice(i, i + 5)
      const chunkLen = chunk.length

      // Pad with 'u' (84 in base-85) if less than 5 chars
      while (chunk.length < 5) {
        chunk += "u"
      }

      // Decode 5 chars to value
      let value = 0
      for (let j = 0; j < 5; j++) {
        const charCode = chunk.charCodeAt(j) - 33
        if (charCode < 0 || charCode > 84) {
          throw new Error("Invalid Ascii85 character")
        }
        value = value * 85 + charCode
      }

      // Convert value to 4 bytes
      const bytes: number[] = []
      for (let j = 0; j < 4; j++) {
        bytes.unshift(value & 0xff)
        value = Math.floor(value / 256)
      }

      // Only output as many bytes as indicated by input length
      const outputLen = chunkLen - 1
      result.push(...bytes.slice(0, outputLen))
      i += chunkLen
    }
  }

  return new Uint8Array(result)
}

/**
 * Encode bytes-like object using Base85 (same as a85encode) and return bytes.
 *
 * @param s - Bytes to encode
 * @returns Base85 encoded Uint8Array
 */
export function b85encode(s: Uint8Array | string): Uint8Array {
  return a85encode(s)
}

/**
 * Decode Base85 encoded bytes-like object and return bytes.
 *
 * @param s - Base85 encoded data
 * @returns Decoded Uint8Array
 */
export function b85decode(s: Uint8Array | string): Uint8Array {
  return a85decode(s)
}

/**
 * Encode bytes-like object using Base64 and return as ASCII string.
 *
 * @param s - Bytes to encode
 * @returns Base64 encoded string
 */
export function encodeString(s: Uint8Array | string): string {
  const bytes = typeof s === "string" ? new TextEncoder().encode(s) : s
  return uint8ArrayToBase64(bytes)
}

/**
 * Decode Base64 ASCII string and return bytes.
 *
 * @param s - Base64 encoded string
 * @returns Decoded Uint8Array
 */
export function decodeString(s: string): Uint8Array {
  return base64ToUint8Array(s)
}

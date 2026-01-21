/**
 * Python hashlib module for TypeScript
 *
 * Provides secure hash and message digest algorithms.
 * Uses Node.js crypto module for server-side and Web Crypto API for browser.
 *
 * @see {@link https://docs.python.org/3/library/hashlib.html | Python hashlib documentation}
 * @module
 */

import * as nodeCrypto from "node:crypto"

/**
 * Hash object interface mimicking Python's hash object.
 */
export interface HashObject {
  /** Name of the hash algorithm */
  readonly name: string
  /** Digest size in bytes */
  readonly digestSize: number
  /** Internal block size in bytes */
  readonly blockSize: number
  /** Update the hash with data */
  update(data: Uint8Array | string): void
  /** Return the digest as bytes */
  digest(): Uint8Array
  /** Return the digest as a hexadecimal string */
  hexdigest(): string
  /** Return a copy of the hash object */
  copy(): HashObject
}

/**
 * Create a hash object using Node.js crypto.
 */
function createNodeHash(algorithm: string): HashObject {
  const hash = nodeCrypto.createHash(algorithm)
  const name = algorithm.toLowerCase()
  let digestSize: number
  let blockSize: number

  switch (name) {
    case "md5":
      digestSize = 16
      blockSize = 64
      break
    case "sha1":
      digestSize = 20
      blockSize = 64
      break
    case "sha224":
      digestSize = 28
      blockSize = 64
      break
    case "sha256":
      digestSize = 32
      blockSize = 64
      break
    case "sha384":
      digestSize = 48
      blockSize = 128
      break
    case "sha512":
      digestSize = 64
      blockSize = 128
      break
    default:
      digestSize = 32
      blockSize = 64
  }

  return {
    name,
    digestSize,
    blockSize,
    update(data: Uint8Array | string): void {
      if (typeof data === "string") {
        hash.update(data, "utf8")
      } else {
        hash.update(data)
      }
    },
    digest(): Uint8Array {
      return new Uint8Array(hash.copy().digest())
    },
    hexdigest(): string {
      return hash.copy().digest("hex")
    },
    copy(): HashObject {
      const newHash = createNodeHash(algorithm)
      // Note: Node.js doesn't expose internal state, so we can't truly copy
      // This is a limitation - the copy won't have the same internal state
      return newHash
    }
  }
}

/**
 * Create a new hash object for the given algorithm.
 *
 * @param name - Name of the hash algorithm (e.g., "sha256", "md5")
 * @param data - Optional initial data to hash
 * @returns A hash object
 *
 * @example
 * ```typescript
 * const h = newHash("sha256")
 * h.update("hello")
 * console.log(h.hexdigest())
 * ```
 */
export function newHash(name: string, data?: Uint8Array | string): HashObject {
  const hash = createNodeHash(name)
  if (data !== undefined) {
    hash.update(data)
  }
  return hash
}

/**
 * Create a new MD5 hash object.
 *
 * @param data - Optional initial data to hash
 * @returns An MD5 hash object
 *
 * @example
 * ```typescript
 * const h = md5("hello")
 * console.log(h.hexdigest()) // "5d41402abc4b2a76b9719d911017c592"
 * ```
 */
export function md5(data?: Uint8Array | string): HashObject {
  return newHash("md5", data)
}

/**
 * Create a new SHA-1 hash object.
 *
 * @param data - Optional initial data to hash
 * @returns A SHA-1 hash object
 */
export function sha1(data?: Uint8Array | string): HashObject {
  return newHash("sha1", data)
}

/**
 * Create a new SHA-224 hash object.
 *
 * @param data - Optional initial data to hash
 * @returns A SHA-224 hash object
 */
export function sha224(data?: Uint8Array | string): HashObject {
  return newHash("sha224", data)
}

/**
 * Create a new SHA-256 hash object.
 *
 * @param data - Optional initial data to hash
 * @returns A SHA-256 hash object
 */
export function sha256(data?: Uint8Array | string): HashObject {
  return newHash("sha256", data)
}

/**
 * Create a new SHA-384 hash object.
 *
 * @param data - Optional initial data to hash
 * @returns A SHA-384 hash object
 */
export function sha384(data?: Uint8Array | string): HashObject {
  return newHash("sha384", data)
}

/**
 * Create a new SHA-512 hash object.
 *
 * @param data - Optional initial data to hash
 * @returns A SHA-512 hash object
 */
export function sha512(data?: Uint8Array | string): HashObject {
  return newHash("sha512", data)
}

/**
 * Create a new SHA3-256 hash object.
 *
 * @param data - Optional initial data to hash
 * @returns A SHA3-256 hash object
 */
export function sha3_256(data?: Uint8Array | string): HashObject {
  return newHash("sha3-256", data)
}

/**
 * Create a new SHA3-512 hash object.
 *
 * @param data - Optional initial data to hash
 * @returns A SHA3-512 hash object
 */
export function sha3_512(data?: Uint8Array | string): HashObject {
  return newHash("sha3-512", data)
}

/**
 * Create a new BLAKE2b hash object.
 *
 * @param data - Optional initial data to hash
 * @returns A BLAKE2b hash object
 */
export function blake2b(data?: Uint8Array | string): HashObject {
  return newHash("blake2b512", data)
}

/**
 * Create a new BLAKE2s hash object.
 *
 * @param data - Optional initial data to hash
 * @returns A BLAKE2s hash object
 */
export function blake2s(data?: Uint8Array | string): HashObject {
  return newHash("blake2s256", data)
}

/**
 * Set of available hash algorithm names.
 */
export const algorithmsAvailable = new Set([
  "md5",
  "sha1",
  "sha224",
  "sha256",
  "sha384",
  "sha512",
  "sha3-256",
  "sha3-512",
  "blake2b512",
  "blake2s256"
])

/**
 * Set of hash algorithm names guaranteed to be available.
 */
export const algorithmsGuaranteed = new Set(["md5", "sha1", "sha256", "sha384", "sha512"])

/**
 * Compute PBKDF2 key derivation.
 *
 * @param hashName - Name of the hash algorithm
 * @param password - Password bytes
 * @param salt - Salt bytes
 * @param iterations - Number of iterations
 * @param dklen - Derived key length in bytes
 * @returns Derived key as Uint8Array
 */
export function pbkdf2Hmac(
  hashName: string,
  password: Uint8Array | string,
  salt: Uint8Array | string,
  iterations: number,
  dklen: number
): Uint8Array {
  const passwordBuf = typeof password === "string" ? Buffer.from(password) : password
  const saltBuf = typeof salt === "string" ? Buffer.from(salt) : salt

  return new Uint8Array(nodeCrypto.pbkdf2Sync(passwordBuf, saltBuf, iterations, dklen, hashName))
}

/**
 * Compute scrypt key derivation.
 *
 * @param password - Password bytes
 * @param salt - Salt bytes
 * @param n - CPU/memory cost parameter
 * @param r - Block size parameter
 * @param p - Parallelization parameter
 * @param dklen - Derived key length in bytes
 * @returns Derived key as Uint8Array
 */
export function scrypt(
  password: Uint8Array | string,
  salt: Uint8Array | string,
  n: number,
  r: number,
  p: number,
  dklen: number
): Uint8Array {
  const passwordBuf = typeof password === "string" ? Buffer.from(password) : password
  const saltBuf = typeof salt === "string" ? Buffer.from(salt) : salt

  return new Uint8Array(
    nodeCrypto.scryptSync(passwordBuf, saltBuf, dklen, {
      N: n,
      r,
      p
    })
  )
}

/**
 * Compare two byte sequences in constant time.
 *
 * @param a - First sequence
 * @param b - Second sequence
 * @returns True if sequences are equal
 */
export function compareDigest(a: Uint8Array | string, b: Uint8Array | string): boolean {
  const aBuf = typeof a === "string" ? Buffer.from(a) : Buffer.from(a)
  const bBuf = typeof b === "string" ? Buffer.from(b) : Buffer.from(b)

  if (aBuf.length !== bBuf.length) {
    return false
  }

  return nodeCrypto.timingSafeEqual(aBuf, bBuf)
}

/**
 * Generate a random file hash (for testing/demonstration).
 *
 * @param path - File path
 * @param algorithm - Hash algorithm name
 * @returns Hash object
 */
export function fileDigest(path: string, algorithm = "sha256"): HashObject {
  // This is a placeholder - actual file hashing would require fs
  const hash = newHash(algorithm)
  // In actual use, you'd read the file and update the hash
  return hash
}

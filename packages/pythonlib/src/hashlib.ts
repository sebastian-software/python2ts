/**
 * Python hashlib module for TypeScript
 *
 * Provides secure hash and message digest algorithms.
 * Uses Node.js crypto module for server-side and Web Crypto API for browser.
 *
 * Note: Unlike Python's sync API, digest() and hexdigest() are async
 * to support the Web Crypto API which only provides async operations.
 *
 * @see {@link https://docs.python.org/3/library/hashlib.html | Python hashlib documentation}
 * @module
 */

/**
 * Hash object interface mimicking Python's hash object.
 * Note: digest() and hexdigest() are async to support Web Crypto API.
 */
export interface HashObject {
  /** Name of the hash algorithm */
  readonly name: string
  /** Digest size in bytes */
  readonly digestSize: number
  /** Internal block size in bytes */
  readonly blockSize: number
  /** Update the hash with data (sync - buffers data) */
  update(data: Uint8Array | string): void
  /** Return the digest as bytes (async) */
  digest(): Promise<Uint8Array>
  /** Return the digest as a hexadecimal string (async) */
  hexdigest(): Promise<string>
  /** Return a copy of the hash object */
  copy(): HashObject
}

// Algorithm metadata
const ALGORITHM_INFO: Record<
  string,
  { digestSize: number; blockSize: number; webCryptoName?: string }
> = {
  md5: { digestSize: 16, blockSize: 64 }, // Not in Web Crypto
  sha1: { digestSize: 20, blockSize: 64, webCryptoName: "SHA-1" },
  sha224: { digestSize: 28, blockSize: 64 }, // Not in Web Crypto
  sha256: { digestSize: 32, blockSize: 64, webCryptoName: "SHA-256" },
  sha384: { digestSize: 48, blockSize: 128, webCryptoName: "SHA-384" },
  sha512: { digestSize: 64, blockSize: 128, webCryptoName: "SHA-512" },
  "sha3-256": { digestSize: 32, blockSize: 136 }, // Not in Web Crypto
  "sha3-512": { digestSize: 64, blockSize: 72 }, // Not in Web Crypto
  blake2b512: { digestSize: 64, blockSize: 128 }, // Not in Web Crypto
  blake2s256: { digestSize: 32, blockSize: 64 } // Not in Web Crypto
}

// Detect environment - check for Node.js specific globals
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
const isNode = typeof process !== "undefined" && typeof process.versions?.node === "string"

// Node.js crypto module (loaded dynamically to avoid browser errors)
let nodeCrypto: typeof import("node:crypto") | undefined

async function getNodeCrypto(): Promise<typeof import("node:crypto")> {
  nodeCrypto ??= await import("node:crypto")
  return nodeCrypto
}

/**
 * Convert a string to Uint8Array using UTF-8 encoding
 */
function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

/**
 * Convert Uint8Array to hex string
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

/**
 * Create a hash object that works in both Node.js and browser environments.
 */
function createHashObject(algorithm: string, initialData?: Uint8Array): HashObject {
  const normalizedAlgorithm = algorithm.toLowerCase()
  const info = ALGORITHM_INFO[normalizedAlgorithm] ?? { digestSize: 32, blockSize: 64 }

  // Buffer to collect all data
  const dataChunks: Uint8Array[] = []
  if (initialData) {
    dataChunks.push(initialData)
  }

  const hashObject: HashObject = {
    name: normalizedAlgorithm,
    digestSize: info.digestSize,
    blockSize: info.blockSize,

    update(data: Uint8Array | string): void {
      const bytes = typeof data === "string" ? stringToBytes(data) : data
      dataChunks.push(bytes)
    },

    async digest(): Promise<Uint8Array> {
      // Concatenate all data chunks
      const totalLength = dataChunks.reduce((sum, chunk) => sum + chunk.length, 0)
      const allData = new Uint8Array(totalLength)
      let offset = 0
      for (const chunk of dataChunks) {
        allData.set(chunk, offset)
        offset += chunk.length
      }

      if (isNode) {
        // Use Node.js crypto
        const crypto = await getNodeCrypto()
        const hash = crypto.createHash(normalizedAlgorithm)
        hash.update(allData)
        return new Uint8Array(hash.digest())
      } else {
        // Use Web Crypto API
        const webCryptoName = info.webCryptoName
        if (!webCryptoName) {
          throw new Error(
            `Algorithm "${normalizedAlgorithm}" is not available in Web Crypto API. ` +
              `Available algorithms: SHA-1, SHA-256, SHA-384, SHA-512`
          )
        }
        const hashBuffer = await crypto.subtle.digest(webCryptoName, allData)
        return new Uint8Array(hashBuffer)
      }
    },

    async hexdigest(): Promise<string> {
      const digestBytes = await this.digest()
      return bytesToHex(digestBytes)
    },

    copy(): HashObject {
      // Create a copy with the same buffered data
      const totalLength = dataChunks.reduce((sum, chunk) => sum + chunk.length, 0)
      const allData = new Uint8Array(totalLength)
      let offset = 0
      for (const chunk of dataChunks) {
        allData.set(chunk, offset)
        offset += chunk.length
      }
      return createHashObject(algorithm, allData)
    }
  }

  return hashObject
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
 * console.log(await h.hexdigest())
 * ```
 */
export function newHash(name: string, data?: Uint8Array | string): HashObject {
  const hash = createHashObject(name)
  if (data !== undefined) {
    hash.update(data)
  }
  return hash
}

/**
 * Create a new MD5 hash object.
 * Note: MD5 is not available in Web Crypto API (browser).
 *
 * @param data - Optional initial data to hash
 * @returns An MD5 hash object
 *
 * @example
 * ```typescript
 * const h = md5("hello")
 * console.log(await h.hexdigest()) // "5d41402abc4b2a76b9719d911017c592"
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
 * Note: SHA-224 is not available in Web Crypto API (browser).
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
 * Note: SHA3 is not available in Web Crypto API (browser).
 *
 * @param data - Optional initial data to hash
 * @returns A SHA3-256 hash object
 */
export function sha3_256(data?: Uint8Array | string): HashObject {
  return newHash("sha3-256", data)
}

/**
 * Create a new SHA3-512 hash object.
 * Note: SHA3 is not available in Web Crypto API (browser).
 *
 * @param data - Optional initial data to hash
 * @returns A SHA3-512 hash object
 */
export function sha3_512(data?: Uint8Array | string): HashObject {
  return newHash("sha3-512", data)
}

/**
 * Create a new BLAKE2b hash object.
 * Note: BLAKE2 is not available in Web Crypto API (browser).
 *
 * @param data - Optional initial data to hash
 * @returns A BLAKE2b hash object
 */
export function blake2b(data?: Uint8Array | string): HashObject {
  return newHash("blake2b512", data)
}

/**
 * Create a new BLAKE2s hash object.
 * Note: BLAKE2 is not available in Web Crypto API (browser).
 *
 * @param data - Optional initial data to hash
 * @returns A BLAKE2s hash object
 */
export function blake2s(data?: Uint8Array | string): HashObject {
  return newHash("blake2s256", data)
}

/**
 * Set of available hash algorithm names.
 * Note: In browser, only SHA-1, SHA-256, SHA-384, SHA-512 are available.
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
 * Set of hash algorithm names guaranteed to be available in all environments.
 * These are the algorithms supported by Web Crypto API.
 */
export const algorithmsGuaranteed = new Set(["sha1", "sha256", "sha384", "sha512"])

/**
 * Compute PBKDF2 key derivation.
 * Note: This is async to support Web Crypto API.
 *
 * @param hashName - Name of the hash algorithm
 * @param password - Password bytes
 * @param salt - Salt bytes
 * @param iterations - Number of iterations
 * @param dklen - Derived key length in bytes
 * @returns Derived key as Uint8Array
 */
export async function pbkdf2Hmac(
  hashName: string,
  password: Uint8Array | string,
  salt: Uint8Array | string,
  iterations: number,
  dklen: number
): Promise<Uint8Array> {
  const passwordBytes = typeof password === "string" ? stringToBytes(password) : password
  const saltBytes = typeof salt === "string" ? stringToBytes(salt) : salt

  if (isNode) {
    const crypto = await getNodeCrypto()
    return new Uint8Array(crypto.pbkdf2Sync(passwordBytes, saltBytes, iterations, dklen, hashName))
  } else {
    // Web Crypto API
    const info = ALGORITHM_INFO[hashName.toLowerCase()]
    const webCryptoName = info?.webCryptoName
    if (!webCryptoName) {
      throw new Error(`Algorithm "${hashName}" is not available in Web Crypto API`)
    }

    const keyMaterial = await crypto.subtle.importKey("raw", passwordBytes, "PBKDF2", false, [
      "deriveBits"
    ])

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: saltBytes,
        iterations,
        hash: webCryptoName
      },
      keyMaterial,
      dklen * 8
    )

    return new Uint8Array(derivedBits)
  }
}

/**
 * Compute scrypt key derivation.
 * Note: scrypt is only available in Node.js, not in Web Crypto API.
 *
 * @param password - Password bytes
 * @param salt - Salt bytes
 * @param n - CPU/memory cost parameter
 * @param r - Block size parameter
 * @param p - Parallelization parameter
 * @param dklen - Derived key length in bytes
 * @returns Derived key as Uint8Array
 */
export async function scrypt(
  password: Uint8Array | string,
  salt: Uint8Array | string,
  n: number,
  r: number,
  p: number,
  dklen: number
): Promise<Uint8Array> {
  if (!isNode) {
    throw new Error("scrypt is only available in Node.js, not in browser environments")
  }

  const crypto = await getNodeCrypto()
  const passwordBytes = typeof password === "string" ? stringToBytes(password) : password
  const saltBytes = typeof salt === "string" ? stringToBytes(salt) : salt

  return new Uint8Array(
    crypto.scryptSync(passwordBytes, saltBytes, dklen, {
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
export async function compareDigest(
  a: Uint8Array | string,
  b: Uint8Array | string
): Promise<boolean> {
  const aBytes = typeof a === "string" ? stringToBytes(a) : a
  const bBytes = typeof b === "string" ? stringToBytes(b) : b

  if (aBytes.length !== bBytes.length) {
    return false
  }

  if (isNode) {
    const crypto = await getNodeCrypto()
    return crypto.timingSafeEqual(aBytes, bBytes)
  } else {
    // Constant-time comparison for browser
    // Note: This is a best-effort implementation; true constant-time
    // comparison in JS is difficult due to JIT optimizations
    let result = 0
    for (let i = 0; i < aBytes.length; i++) {
      const aByte = aBytes[i] ?? 0
      const bByte = bBytes[i] ?? 0
      result |= aByte ^ bByte
    }
    return result === 0
  }
}

/**
 * Generate a file hash.
 * Note: Only available in Node.js.
 *
 * @param path - File path
 * @param algorithm - Hash algorithm name
 * @returns Hash as hex string
 */
export async function fileDigest(path: string, algorithm = "sha256"): Promise<string> {
  if (!isNode) {
    throw new Error("fileDigest is only available in Node.js")
  }

  const crypto = await getNodeCrypto()
  const fs = await import("node:fs")

  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm)
    const stream = fs.createReadStream(path)

    stream.on("data", (data: Buffer | string) => {
      hash.update(data)
    })
    stream.on("end", () => {
      resolve(hash.digest("hex"))
    })
    stream.on("error", reject)
  })
}

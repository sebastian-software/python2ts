/**
 * Python uuid module for TypeScript
 *
 * Provides UUID objects as specified in RFC 4122.
 *
 * @see {@link https://docs.python.org/3/library/uuid.html | Python uuid documentation}
 * @module
 */

/**
 * UUID class representing a universally unique identifier.
 */
export class UUID {
  private readonly _bytes: Uint8Array

  /** Helper to safely get byte at index */
  private getByte(index: number): number {
    return this._bytes[index] ?? 0
  }

  /**
   * Create a UUID from various input formats.
   *
   * @param hex - Hexadecimal string (with or without hyphens)
   * @param bytes - 16 bytes as Uint8Array
   * @param int - Integer value
   */
  constructor(options: { hex: string } | { bytes: Uint8Array } | { int: bigint } | string) {
    if (typeof options === "string") {
      // Treat string as hex
      options = { hex: options }
    }

    if ("hex" in options) {
      const hex = options.hex.replace(/-/g, "").replace(/[{}]/g, "")
      if (hex.length !== 32) {
        throw new Error("badly formed hexadecimal UUID string")
      }
      this._bytes = new Uint8Array(16)
      for (let i = 0; i < 16; i++) {
        this._bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16)
      }
    } else if ("bytes" in options) {
      if (options.bytes.length !== 16) {
        throw new Error("bytes must be a 16-byte array")
      }
      this._bytes = new Uint8Array(options.bytes)
    } else if ("int" in options) {
      this._bytes = new Uint8Array(16)
      let value = options.int
      for (let i = 15; i >= 0; i--) {
        this._bytes[i] = Number(value & 0xffn)
        value = value >> 8n
      }
    } /* v8 ignore start -- TypeScript enforces one of hex/bytes/int @preserve */ else {
      throw new Error("one of hex, bytes, or int is required")
    } /* v8 ignore stop */
  }

  /**
   * The UUID as a 32-character lowercase hexadecimal string.
   */
  get hex(): string {
    let result = ""
    for (const byte of this._bytes) {
      result += byte.toString(16).padStart(2, "0")
    }
    return result
  }

  /**
   * The UUID as a 16-byte Uint8Array.
   */
  get bytes(): Uint8Array {
    return new Uint8Array(this._bytes)
  }

  /**
   * The UUID as a 128-bit integer.
   */
  get int(): bigint {
    let value = 0n
    for (const byte of this._bytes) {
      value = (value << 8n) | BigInt(byte)
    }
    return value
  }

  /**
   * The version number (1 through 5, as an integer).
   */
  get version(): number {
    return (this.getByte(6) >> 4) & 0x0f
  }

  /**
   * The variant (reserved bits).
   */
  get variant(): string {
    const byte = this.getByte(8)
    if ((byte & 0x80) === 0) {
      return "reserved for NCS compatibility"
    } else if ((byte & 0xc0) === 0x80) {
      return "specified in RFC 4122"
    } else if ((byte & 0xe0) === 0xc0) {
      return "reserved for Microsoft compatibility"
    } else {
      return "reserved for future definition"
    }
  }

  /**
   * The UUID as a hyphenated string (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).
   */
  toString(): string {
    const h = this.hex
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
  }

  /**
   * The UUID as a URN (urn:uuid:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).
   */
  get urn(): string {
    return `urn:uuid:${this.toString()}`
  }

  /**
   * Compare UUIDs for equality.
   */
  equals(other: UUID): boolean {
    if (!(other instanceof UUID)) return false
    for (let i = 0; i < 16; i++) {
      if (this._bytes[i] !== other._bytes[i]) return false
    }
    return true
  }

  /**
   * Get the time_low field (first 32 bits).
   */
  get timeLow(): number {
    return (
      ((this.getByte(0) << 24) |
        (this.getByte(1) << 16) |
        (this.getByte(2) << 8) |
        this.getByte(3)) >>>
      0
    )
  }

  /**
   * Get the time_mid field (next 16 bits).
   */
  get timeMid(): number {
    return (this.getByte(4) << 8) | this.getByte(5)
  }

  /**
   * Get the time_hi_version field (next 16 bits).
   */
  get timeHiVersion(): number {
    return (this.getByte(6) << 8) | this.getByte(7)
  }

  /**
   * Get the clock_seq_hi_variant field.
   */
  get clockSeqHiVariant(): number {
    return this.getByte(8)
  }

  /**
   * Get the clock_seq_low field.
   */
  get clockSeqLow(): number {
    return this.getByte(9)
  }

  /**
   * Get the node field (last 48 bits).
   */
  get node(): bigint {
    let value = 0n
    for (let i = 10; i < 16; i++) {
      value = (value << 8n) | BigInt(this.getByte(i))
    }
    return value
  }
}

/**
 * Generate a random UUID (version 4).
 *
 * Uses crypto.randomUUID() when available, otherwise falls back to
 * crypto.getRandomValues().
 *
 * @returns A new random UUID
 *
 * @example
 * ```typescript
 * const id = uuid4()
 * console.log(id.toString()) // "550e8400-e29b-41d4-a716-446655440000"
 * ```
 */
export function uuid4(): UUID {
  // Use crypto.randomUUID() if available (modern browsers and Node.js 19+)
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return new UUID({ hex: crypto.randomUUID() })
  }

  /* v8 ignore start -- fallback for environments without crypto.randomUUID @preserve */
  // Fallback to manual generation
  const bytes = new Uint8Array(16)
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes)
  } else {
    // Last resort: Math.random() (not cryptographically secure)
    for (let i = 0; i < 16; i++) {
      bytes[i] = Math.floor(Math.random() * 256)
    }
  }

  // Set version to 4
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40
  // Set variant to RFC 4122
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80

  return new UUID({ bytes })
  /* v8 ignore stop */
}

/**
 * Generate a UUID based on host ID and current time (version 1).
 *
 * Note: In browser environments, the node ID is randomly generated
 * since MAC addresses are not accessible.
 *
 * @param node - Optional 48-bit node ID (defaults to random)
 * @param clockSeq - Optional 14-bit clock sequence (defaults to random)
 * @returns A new time-based UUID
 */
export function uuid1(node?: bigint, clockSeq?: number): UUID {
  const bytes = new Uint8Array(16)

  // Get current timestamp (100-nanosecond intervals since October 15, 1582)
  const now = Date.now()
  // JavaScript epoch is January 1, 1970
  // UUID epoch is October 15, 1582
  // Difference is 122192928000000000 100-nanosecond intervals
  const UUID_EPOCH_OFFSET = 122192928000000000n
  const timestamp = BigInt(now) * 10000n + UUID_EPOCH_OFFSET

  // time_low (32 bits)
  const timeLow = Number(timestamp & 0xffffffffn)
  bytes[0] = (timeLow >> 24) & 0xff
  bytes[1] = (timeLow >> 16) & 0xff
  bytes[2] = (timeLow >> 8) & 0xff
  bytes[3] = timeLow & 0xff

  // time_mid (16 bits)
  const timeMid = Number((timestamp >> 32n) & 0xffffn)
  bytes[4] = (timeMid >> 8) & 0xff
  bytes[5] = timeMid & 0xff

  // time_hi_and_version (16 bits, version 1)
  const timeHi = Number((timestamp >> 48n) & 0x0fffn)
  bytes[6] = ((timeHi >> 8) & 0x0f) | 0x10 // Version 1
  bytes[7] = timeHi & 0xff

  // clock_seq_hi_and_reserved (8 bits)
  const seq = clockSeq ?? Math.floor(Math.random() * 0x4000)
  bytes[8] = ((seq >> 8) & 0x3f) | 0x80 // Variant
  bytes[9] = seq & 0xff

  // node (48 bits)
  let nodeId = node
  if (nodeId === undefined) {
    // Generate random node ID with multicast bit set
    const randomNode = new Uint8Array(6)
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      crypto.getRandomValues(randomNode)
    } else {
      /* v8 ignore start -- fallback for environments without crypto @preserve */
      for (let i = 0; i < 6; i++) {
        randomNode[i] = Math.floor(Math.random() * 256)
      }
      /* v8 ignore stop */
    }
    // Set multicast bit to indicate randomly generated
    randomNode[0] = (randomNode[0] ?? 0) | 0x01

    nodeId = 0n
    for (const byte of randomNode) {
      nodeId = (nodeId << 8n) | BigInt(byte)
    }
  }

  for (let i = 15; i >= 10; i--) {
    bytes[i] = Number(nodeId & 0xffn)
    nodeId = nodeId >> 8n
  }

  return new UUID({ bytes })
}

/**
 * Generate a UUID based on the MD5 hash of a namespace identifier and a name (version 3).
 *
 * @param namespace - The namespace UUID
 * @param name - The name string
 * @returns A new name-based UUID using MD5
 */

export function uuid3(_namespace: UUID, _name: string): UUID {
  // Note: This requires an MD5 implementation
  // For simplicity, throw an error for now - hashlib module will provide this
  throw new Error("uuid3 requires hashlib.md5 - import from 'pythonlib/hashlib'")
}

/**
 * Generate a UUID based on the SHA-1 hash of a namespace identifier and a name (version 5).
 *
 * @param namespace - The namespace UUID
 * @param name - The name string
 * @returns A new name-based UUID using SHA-1
 */

export function uuid5(_namespace: UUID, _name: string): UUID {
  // Note: This requires a SHA-1 implementation
  // For simplicity, throw an error for now - hashlib module will provide this
  throw new Error("uuid5 requires hashlib.sha1 - import from 'pythonlib/hashlib'")
}

/**
 * The namespace UUID for DNS domain names.
 */
export const NAMESPACE_DNS = new UUID({ hex: "6ba7b810-9dad-11d1-80b4-00c04fd430c8" })

/**
 * The namespace UUID for URLs.
 */
export const NAMESPACE_URL = new UUID({ hex: "6ba7b811-9dad-11d1-80b4-00c04fd430c8" })

/**
 * The namespace UUID for ISO OIDs.
 */
export const NAMESPACE_OID = new UUID({ hex: "6ba7b812-9dad-11d1-80b4-00c04fd430c8" })

/**
 * The namespace UUID for X.500 DNs.
 */
export const NAMESPACE_X500 = new UUID({ hex: "6ba7b814-9dad-11d1-80b4-00c04fd430c8" })

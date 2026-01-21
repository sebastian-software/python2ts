/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { describe, it, expect } from "vitest"
import * as uuid from "./uuid"

describe("uuid module", () => {
  describe("UUID class", () => {
    it("should create UUID from hex string", () => {
      const u = new uuid.UUID({ hex: "550e8400-e29b-41d4-a716-446655440000" })
      expect(u.toString()).toBe("550e8400-e29b-41d4-a716-446655440000")
    })

    it("should create UUID from hex string without hyphens", () => {
      const u = new uuid.UUID({ hex: "550e8400e29b41d4a716446655440000" })
      expect(u.toString()).toBe("550e8400-e29b-41d4-a716-446655440000")
    })

    it("should create UUID from string directly", () => {
      const u = new uuid.UUID("550e8400-e29b-41d4-a716-446655440000")
      expect(u.toString()).toBe("550e8400-e29b-41d4-a716-446655440000")
    })

    it("should create UUID from bytes", () => {
      const bytes = new Uint8Array([
        0x55, 0x0e, 0x84, 0x00, 0xe2, 0x9b, 0x41, 0xd4, 0xa7, 0x16, 0x44, 0x66, 0x55, 0x44, 0x00,
        0x00
      ])
      const u = new uuid.UUID({ bytes })
      expect(u.toString()).toBe("550e8400-e29b-41d4-a716-446655440000")
    })

    it("should create UUID from int", () => {
      const u = new uuid.UUID({ int: 113059749145936325402354257176981405696n })
      expect(u.hex).toBe("550e8400e29b41d4a716446655440000")
    })

    it("should return correct hex", () => {
      const u = new uuid.UUID({ hex: "550e8400e29b41d4a716446655440000" })
      expect(u.hex).toBe("550e8400e29b41d4a716446655440000")
    })

    it("should return correct bytes", () => {
      const u = new uuid.UUID({ hex: "550e8400e29b41d4a716446655440000" })
      expect(u.bytes).toEqual(
        new Uint8Array([
          0x55, 0x0e, 0x84, 0x00, 0xe2, 0x9b, 0x41, 0xd4, 0xa7, 0x16, 0x44, 0x66, 0x55, 0x44, 0x00,
          0x00
        ])
      )
    })

    it("should return correct int", () => {
      const u = new uuid.UUID({ hex: "550e8400e29b41d4a716446655440000" })
      expect(u.int).toBe(113059749145936325402354257176981405696n)
    })

    it("should return correct version", () => {
      const u4 = new uuid.UUID({ hex: "550e8400-e29b-41d4-a716-446655440000" })
      expect(u4.version).toBe(4)

      const u1 = uuid.uuid1()
      expect(u1.version).toBe(1)
    })

    it("should return correct urn", () => {
      const u = new uuid.UUID({ hex: "550e8400e29b41d4a716446655440000" })
      expect(u.urn).toBe("urn:uuid:550e8400-e29b-41d4-a716-446655440000")
    })

    it("should compare UUIDs for equality", () => {
      const u1 = new uuid.UUID({ hex: "550e8400e29b41d4a716446655440000" })
      const u2 = new uuid.UUID({ hex: "550e8400e29b41d4a716446655440000" })
      const u3 = new uuid.UUID({ hex: "660e8400e29b41d4a716446655440000" })
      expect(u1.equals(u2)).toBe(true)
      expect(u1.equals(u3)).toBe(false)
    })

    it("should throw for invalid hex length", () => {
      expect(() => new uuid.UUID({ hex: "550e8400" })).toThrow("badly formed")
    })

    it("should throw for invalid bytes length", () => {
      expect(() => new uuid.UUID({ bytes: new Uint8Array(8) })).toThrow("16-byte")
    })
  })

  describe("uuid4()", () => {
    it("should generate unique UUIDs", () => {
      const uuids = new Set<string>()
      for (let i = 0; i < 100; i++) {
        uuids.add(uuid.uuid4().toString())
      }
      expect(uuids.size).toBe(100)
    })

    it("should generate version 4 UUIDs", () => {
      const u = uuid.uuid4()
      expect(u.version).toBe(4)
    })

    it("should have correct variant", () => {
      const u = uuid.uuid4()
      expect(u.variant).toBe("specified in RFC 4122")
    })
  })

  describe("uuid1()", () => {
    it("should generate version 1 UUIDs", () => {
      const u = uuid.uuid1()
      expect(u.version).toBe(1)
    })

    it("should have correct variant", () => {
      const u = uuid.uuid1()
      expect(u.variant).toBe("specified in RFC 4122")
    })

    it("should generate unique UUIDs", () => {
      const uuids = new Set<string>()
      for (let i = 0; i < 100; i++) {
        uuids.add(uuid.uuid1().toString())
      }
      expect(uuids.size).toBe(100)
    })
  })

  describe("namespace constants", () => {
    it("should have NAMESPACE_DNS", () => {
      expect(uuid.NAMESPACE_DNS.toString()).toBe("6ba7b810-9dad-11d1-80b4-00c04fd430c8")
    })

    it("should have NAMESPACE_URL", () => {
      expect(uuid.NAMESPACE_URL.toString()).toBe("6ba7b811-9dad-11d1-80b4-00c04fd430c8")
    })

    it("should have NAMESPACE_OID", () => {
      expect(uuid.NAMESPACE_OID.toString()).toBe("6ba7b812-9dad-11d1-80b4-00c04fd430c8")
    })

    it("should have NAMESPACE_X500", () => {
      expect(uuid.NAMESPACE_X500.toString()).toBe("6ba7b814-9dad-11d1-80b4-00c04fd430c8")
    })
  })
})

import { describe, it, expect } from "vitest"
import * as base64 from "./base64.js"

describe("base64 module", () => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  describe("b64encode()", () => {
    it("should encode string to base64 bytes", () => {
      const result = base64.b64encode("hello")
      expect(decoder.decode(result)).toBe("aGVsbG8=")
    })

    it("should encode Uint8Array to base64 bytes", () => {
      const result = base64.b64encode(encoder.encode("hello"))
      expect(decoder.decode(result)).toBe("aGVsbG8=")
    })

    it("should handle empty input", () => {
      const result = base64.b64encode("")
      expect(decoder.decode(result)).toBe("")
    })
  })

  describe("b64decode()", () => {
    it("should decode base64 string to bytes", () => {
      const result = base64.b64decode("aGVsbG8=")
      expect(decoder.decode(result)).toBe("hello")
    })

    it("should decode base64 bytes to bytes", () => {
      const result = base64.b64decode(encoder.encode("aGVsbG8="))
      expect(decoder.decode(result)).toBe("hello")
    })

    it("should handle whitespace in input", () => {
      const result = base64.b64decode("aGVs\nbG8=")
      expect(decoder.decode(result)).toBe("hello")
    })
  })

  describe("urlsafeB64encode()", () => {
    it("should encode using URL-safe alphabet", () => {
      // Data that would produce + or / in standard base64
      const data = new Uint8Array([251, 239]) // Produces "+/" normally
      const result = decoder.decode(base64.urlsafeB64encode(data))
      expect(result).not.toContain("+")
      expect(result).not.toContain("/")
    })
  })

  describe("urlsafeB64decode()", () => {
    it("should decode URL-safe base64", () => {
      // URL-safe encoded data
      const encoded = decoder.decode(base64.urlsafeB64encode("hello"))
      const result = base64.urlsafeB64decode(encoded)
      expect(decoder.decode(result)).toBe("hello")
    })

    it("should handle missing padding", () => {
      // Base64 without padding
      const result = base64.urlsafeB64decode("aGVsbG8")
      expect(decoder.decode(result)).toBe("hello")
    })
  })

  describe("b16encode()", () => {
    it("should encode to hexadecimal", () => {
      const result = base64.b16encode("AB")
      expect(decoder.decode(result)).toBe("4142")
    })
  })

  describe("b16decode()", () => {
    it("should decode hexadecimal", () => {
      const result = base64.b16decode("4142")
      expect(decoder.decode(result)).toBe("AB")
    })

    it("should throw for invalid hex", () => {
      expect(() => base64.b16decode("GG")).toThrow()
    })

    it("should throw for odd length", () => {
      expect(() => base64.b16decode("414")).toThrow()
    })
  })

  describe("b32encode()", () => {
    it("should encode to base32", () => {
      const result = base64.b32encode("hello")
      expect(decoder.decode(result)).toBe("NBSWY3DP")
    })
  })

  describe("b32decode()", () => {
    it("should decode base32", () => {
      const result = base64.b32decode("NBSWY3DP")
      expect(decoder.decode(result)).toBe("hello")
    })

    it("should handle lowercase", () => {
      const result = base64.b32decode("nbswy3dp")
      expect(decoder.decode(result)).toBe("hello")
    })

    it("should throw for invalid character", () => {
      expect(() => base64.b32decode("!!!")).toThrow()
    })
  })

  describe("standardB64encode/decode()", () => {
    it("should be identical to b64encode/decode", () => {
      const data = "test data"
      expect(base64.standardB64encode(data)).toEqual(base64.b64encode(data))
      expect(base64.standardB64decode("dGVzdCBkYXRh")).toEqual(base64.b64decode("dGVzdCBkYXRh"))
    })
  })

  describe("encodeString()", () => {
    it("should return base64 as string", () => {
      const result = base64.encodeString("hello")
      expect(typeof result).toBe("string")
      expect(result).toBe("aGVsbG8=")
    })
  })

  describe("decodeString()", () => {
    it("should decode base64 string to bytes", () => {
      const result = base64.decodeString("aGVsbG8=")
      expect(decoder.decode(result)).toBe("hello")
    })
  })
})

import { describe, it, expect } from "vitest"
import * as hashlib from "./hashlib.js"

describe("hashlib module", () => {
  describe("md5()", () => {
    it("should compute MD5 hash", () => {
      const h = hashlib.md5("hello")
      expect(h.hexdigest()).toBe("5d41402abc4b2a76b9719d911017c592")
    })

    it("should have correct name", () => {
      const h = hashlib.md5()
      expect(h.name).toBe("md5")
    })

    it("should have correct digestSize", () => {
      const h = hashlib.md5()
      expect(h.digestSize).toBe(16)
    })
  })

  describe("sha1()", () => {
    it("should compute SHA-1 hash", () => {
      const h = hashlib.sha1("hello")
      expect(h.hexdigest()).toBe("aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d")
    })

    it("should have correct digestSize", () => {
      const h = hashlib.sha1()
      expect(h.digestSize).toBe(20)
    })
  })

  describe("sha256()", () => {
    it("should compute SHA-256 hash", () => {
      const h = hashlib.sha256("hello")
      expect(h.hexdigest()).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824")
    })

    it("should have correct digestSize", () => {
      const h = hashlib.sha256()
      expect(h.digestSize).toBe(32)
    })
  })

  describe("sha512()", () => {
    it("should compute SHA-512 hash", () => {
      const h = hashlib.sha512("hello")
      expect(h.hexdigest()).toBe(
        "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043"
      )
    })

    it("should have correct digestSize", () => {
      const h = hashlib.sha512()
      expect(h.digestSize).toBe(64)
    })
  })

  describe("update()", () => {
    it("should allow incremental hashing", () => {
      const h = hashlib.sha256()
      h.update("hel")
      h.update("lo")
      expect(h.hexdigest()).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824")
    })

    it("should accept Uint8Array", () => {
      const h = hashlib.sha256()
      h.update(new TextEncoder().encode("hello"))
      expect(h.hexdigest()).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824")
    })
  })

  describe("digest()", () => {
    it("should return Uint8Array", () => {
      const h = hashlib.md5("hello")
      const digest = h.digest()
      expect(digest).toBeInstanceOf(Uint8Array)
      expect(digest.length).toBe(16)
    })
  })

  describe("newHash()", () => {
    it("should create hash by name", () => {
      const h = hashlib.newHash("sha256", "hello")
      expect(h.hexdigest()).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824")
    })
  })

  describe("algorithmsAvailable", () => {
    it("should include common algorithms", () => {
      expect(hashlib.algorithmsAvailable.has("md5")).toBe(true)
      expect(hashlib.algorithmsAvailable.has("sha256")).toBe(true)
    })
  })

  describe("algorithmsGuaranteed", () => {
    it("should include standard algorithms", () => {
      expect(hashlib.algorithmsGuaranteed.has("md5")).toBe(true)
      expect(hashlib.algorithmsGuaranteed.has("sha256")).toBe(true)
    })
  })

  describe("pbkdf2Hmac()", () => {
    it("should derive key", () => {
      const key = hashlib.pbkdf2Hmac("sha256", "password", "salt", 1000, 32)
      expect(key).toBeInstanceOf(Uint8Array)
      expect(key.length).toBe(32)
    })
  })

  describe("compareDigest()", () => {
    it("should return true for equal strings", () => {
      expect(hashlib.compareDigest("abc", "abc")).toBe(true)
    })

    it("should return false for different strings", () => {
      expect(hashlib.compareDigest("abc", "abd")).toBe(false)
    })

    it("should return false for different lengths", () => {
      expect(hashlib.compareDigest("abc", "ab")).toBe(false)
    })
  })
})

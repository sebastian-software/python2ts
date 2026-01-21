import { describe, it, expect } from "vitest"
import * as hashlib from "./hashlib.js"

describe("hashlib module", () => {
  describe("md5()", () => {
    it("should compute MD5 hash", async () => {
      const h = hashlib.md5("hello")
      expect(await h.hexdigest()).toBe("5d41402abc4b2a76b9719d911017c592")
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
    it("should compute SHA-1 hash", async () => {
      const h = hashlib.sha1("hello")
      expect(await h.hexdigest()).toBe("aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d")
    })

    it("should have correct digestSize", () => {
      const h = hashlib.sha1()
      expect(h.digestSize).toBe(20)
    })
  })

  describe("sha256()", () => {
    it("should compute SHA-256 hash", async () => {
      const h = hashlib.sha256("hello")
      expect(await h.hexdigest()).toBe(
        "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
      )
    })

    it("should have correct digestSize", () => {
      const h = hashlib.sha256()
      expect(h.digestSize).toBe(32)
    })
  })

  describe("sha512()", () => {
    it("should compute SHA-512 hash", async () => {
      const h = hashlib.sha512("hello")
      expect(await h.hexdigest()).toBe(
        "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043"
      )
    })

    it("should have correct digestSize", () => {
      const h = hashlib.sha512()
      expect(h.digestSize).toBe(64)
    })
  })

  describe("sha224()", () => {
    it("should compute SHA-224 hash", async () => {
      const h = hashlib.sha224("hello")
      const digest = await h.hexdigest()
      expect(digest.length).toBe(56) // 28 bytes = 56 hex chars
    })

    it("should have correct digestSize", () => {
      expect(hashlib.sha224().digestSize).toBe(28)
    })
  })

  describe("sha384()", () => {
    it("should compute SHA-384 hash", async () => {
      const h = hashlib.sha384("hello")
      const digest = await h.hexdigest()
      expect(digest.length).toBe(96) // 48 bytes = 96 hex chars
    })

    it("should have correct digestSize", () => {
      expect(hashlib.sha384().digestSize).toBe(48)
    })
  })

  describe("sha3_256()", () => {
    it("should compute SHA3-256 hash", async () => {
      const h = hashlib.sha3_256("hello")
      const digest = await h.hexdigest()
      expect(digest.length).toBe(64) // 32 bytes = 64 hex chars
    })

    it("should have correct properties", () => {
      const h = hashlib.sha3_256()
      expect(h.name).toBe("sha3-256")
      expect(h.digestSize).toBe(32)
    })
  })

  describe("sha3_512()", () => {
    it("should compute SHA3-512 hash", async () => {
      const h = hashlib.sha3_512("hello")
      const digest = await h.hexdigest()
      expect(digest.length).toBe(128) // 64 bytes = 128 hex chars
    })

    it("should have correct properties", () => {
      const h = hashlib.sha3_512()
      expect(h.name).toBe("sha3-512")
      expect(h.digestSize).toBe(64)
    })
  })

  describe("blake2b()", () => {
    it("should compute BLAKE2b hash", async () => {
      const h = hashlib.blake2b("hello")
      const digest = await h.hexdigest()
      expect(digest.length).toBe(128) // 64 bytes = 128 hex chars
    })
  })

  describe("blake2s()", () => {
    it("should compute BLAKE2s hash", async () => {
      const h = hashlib.blake2s("hello")
      const digest = await h.hexdigest()
      expect(digest.length).toBe(64) // 32 bytes = 64 hex chars
    })
  })

  describe("update()", () => {
    it("should allow incremental hashing", async () => {
      const h = hashlib.sha256()
      h.update("hel")
      h.update("lo")
      expect(await h.hexdigest()).toBe(
        "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
      )
    })

    it("should accept Uint8Array", async () => {
      const h = hashlib.sha256()
      h.update(new TextEncoder().encode("hello"))
      expect(await h.hexdigest()).toBe(
        "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
      )
    })
  })

  describe("digest()", () => {
    it("should return Uint8Array", async () => {
      const h = hashlib.md5("hello")
      const digest = await h.digest()
      expect(digest).toBeInstanceOf(Uint8Array)
      expect(digest.length).toBe(16)
    })
  })

  describe("copy()", () => {
    it("should create independent copy", async () => {
      const h1 = hashlib.sha256()
      h1.update("hello")
      const h2 = h1.copy()
      h1.update("world")

      // h2 should only have "hello", not "helloworld"
      expect(await h2.hexdigest()).toBe(
        "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
      )
      expect(await h1.hexdigest()).toBe(
        "936a185caaa266bb9cbe981e9e05cb78cd732b0b3280eb944412bb6f8f8f07af"
      )
    })
  })

  describe("newHash()", () => {
    it("should create hash by name", async () => {
      const h = hashlib.newHash("sha256", "hello")
      expect(await h.hexdigest()).toBe(
        "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
      )
    })
  })

  describe("algorithmsAvailable", () => {
    it("should include common algorithms", () => {
      expect(hashlib.algorithmsAvailable.has("md5")).toBe(true)
      expect(hashlib.algorithmsAvailable.has("sha256")).toBe(true)
    })
  })

  describe("algorithmsGuaranteed", () => {
    it("should include Web Crypto algorithms", () => {
      // MD5 is not in Web Crypto, so not guaranteed
      expect(hashlib.algorithmsGuaranteed.has("md5")).toBe(false)
      expect(hashlib.algorithmsGuaranteed.has("sha1")).toBe(true)
      expect(hashlib.algorithmsGuaranteed.has("sha256")).toBe(true)
      expect(hashlib.algorithmsGuaranteed.has("sha384")).toBe(true)
      expect(hashlib.algorithmsGuaranteed.has("sha512")).toBe(true)
    })
  })

  describe("pbkdf2Hmac()", () => {
    it("should derive key", async () => {
      const key = await hashlib.pbkdf2Hmac("sha256", "password", "salt", 1000, 32)
      expect(key).toBeInstanceOf(Uint8Array)
      expect(key.length).toBe(32)
    })
  })

  describe("scrypt()", () => {
    it("should derive key", async () => {
      const key = await hashlib.scrypt("password", "salt", 16384, 8, 1, 32)
      expect(key).toBeInstanceOf(Uint8Array)
      expect(key.length).toBe(32)
    })
  })

  describe("compareDigest()", () => {
    it("should return true for equal strings", async () => {
      expect(await hashlib.compareDigest("abc", "abc")).toBe(true)
    })

    it("should return false for different strings", async () => {
      expect(await hashlib.compareDigest("abc", "abd")).toBe(false)
    })

    it("should return false for different lengths", async () => {
      expect(await hashlib.compareDigest("abc", "ab")).toBe(false)
    })

    it("should work with Uint8Array", async () => {
      const a = new Uint8Array([1, 2, 3])
      const b = new Uint8Array([1, 2, 3])
      const c = new Uint8Array([1, 2, 4])
      expect(await hashlib.compareDigest(a, b)).toBe(true)
      expect(await hashlib.compareDigest(a, c)).toBe(false)
    })
  })

  describe("fileDigest()", () => {
    it("should hash a file", async () => {
      // Create a temp file and hash it
      const fs = await import("node:fs")
      const path = await import("node:path")
      const os = await import("node:os")

      const tempDir = os.tmpdir()
      const tempFile = path.join(tempDir, `hashlib-test-${String(Date.now())}.txt`)
      fs.writeFileSync(tempFile, "hello")

      try {
        const hash = await hashlib.fileDigest(tempFile, "sha256")
        expect(hash).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824")
      } finally {
        fs.unlinkSync(tempFile)
      }
    })
  })
})

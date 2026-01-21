import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"
import { hashlib } from "pythonlib"

describe("E2E: hashlib module", () => {
  describe("Import Handling", () => {
    it("should convert import hashlib", () => {
      const result = transpile("import hashlib", { includeRuntime: false })
      expect(result).toContain('import * as hashlib from "hashlib"')
    })

    it("should convert from hashlib import", () => {
      const result = transpile("from hashlib import sha256, md5", { includeRuntime: false })
      expect(result).toContain('import { sha256, md5 } from "hashlib"')
    })
  })

  describe("Function Transformations", () => {
    it("should transform hashlib.sha256", () => {
      const result = transpile('x = hashlib.sha256(b"hello")')
      expect(result).toContain('from "pythonlib/hashlib"')
      expect(result).toContain("sha256(")
    })

    it("should transform hashlib.md5", () => {
      const result = transpile('x = hashlib.md5(b"hello")')
      expect(result).toContain('from "pythonlib/hashlib"')
      expect(result).toContain("md5(")
    })

    it("should add await to hexdigest()", () => {
      const result = transpile('x = hashlib.sha256(b"hello").hexdigest()')
      expect(result).toContain("await")
      expect(result).toContain(".hexdigest()")
    })

    it("should add await to digest()", () => {
      const result = transpile('x = hashlib.sha256(b"hello").digest()')
      expect(result).toContain("await")
      expect(result).toContain(".digest()")
    })

    it("should add await to pbkdf2_hmac", () => {
      const result = transpile('x = hashlib.pbkdf2_hmac("sha256", password, salt, 100000)')
      expect(result).toContain("await pbkdf2Hmac(")
    })

    it("should add await to scrypt", () => {
      const result = transpile("x = hashlib.scrypt(password, salt=salt, n=16384, r=8, p=1)")
      expect(result).toContain("await scrypt(")
    })

    it("should add await to compare_digest", () => {
      const result = transpile("x = hashlib.compare_digest(a, b)")
      expect(result).toContain("await compareDigest(")
    })

    it("should add await to file_digest", () => {
      const result = transpile('x = hashlib.file_digest("file.txt", "sha256")')
      expect(result).toContain("await fileDigest(")
    })
  })

  describe("Runtime Functions", () => {
    describe("hashlib.sha256", () => {
      it("should compute SHA-256 hash", async () => {
        const h = hashlib.sha256("hello")
        const result = await h.hexdigest()
        expect(result).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824")
      })
    })

    describe("hashlib.md5", () => {
      it("should compute MD5 hash", async () => {
        const h = hashlib.md5("hello")
        const result = await h.hexdigest()
        expect(result).toBe("5d41402abc4b2a76b9719d911017c592")
      })
    })

    describe("incremental hashing", () => {
      it("should support update()", async () => {
        const h = hashlib.sha256()
        h.update("hel")
        h.update("lo")
        const result = await h.hexdigest()
        expect(result).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824")
      })
    })

    describe("pbkdf2Hmac", () => {
      it("should derive key", async () => {
        const key = await hashlib.pbkdf2Hmac("sha256", "password", "salt", 1000, 32)
        expect(key).toBeInstanceOf(Uint8Array)
        expect(key.length).toBe(32)
      })
    })

    describe("compareDigest", () => {
      it("should compare equal strings", async () => {
        const result = await hashlib.compareDigest("abc", "abc")
        expect(result).toBe(true)
      })

      it("should compare different strings", async () => {
        const result = await hashlib.compareDigest("abc", "abd")
        expect(result).toBe(false)
      })
    })
  })
})

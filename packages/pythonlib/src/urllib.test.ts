import { describe, it, expect } from "vitest"
import * as urllib from "./urllib.js"

describe("urllib module", () => {
  describe("urlparse()", () => {
    it("should parse a complete URL", () => {
      const result = urllib.urlparse("https://user:pass@example.com:8080/path?query=1#frag")
      expect(result.scheme).toBe("https")
      expect(result.netloc).toBe("user:pass@example.com:8080")
      expect(result.path).toBe("/path")
      expect(result.query).toBe("query=1")
      expect(result.fragment).toBe("frag")
      expect(result.username).toBe("user")
      expect(result.password).toBe("pass")
      expect(result.hostname).toBe("example.com")
      expect(result.port).toBe(8080)
    })

    it("should handle URLs without credentials", () => {
      const result = urllib.urlparse("https://example.com/path")
      expect(result.scheme).toBe("https")
      expect(result.hostname).toBe("example.com")
      expect(result.username).toBeNull()
      expect(result.password).toBeNull()
    })

    it("should use default scheme", () => {
      const result = urllib.urlparse("example.com/path", "https")
      expect(result.scheme).toBe("https")
    })
  })

  describe("urlunparse()", () => {
    it("should combine components into URL string", () => {
      const url = urllib.urlunparse(["https", "example.com", "/path", "", "query=1", "frag"])
      expect(url).toBe("https://example.com/path?query=1#frag")
    })

    it("should accept ParseResult object", () => {
      const result = urllib.urlparse("https://example.com/path?query=1#frag")
      const url = urllib.urlunparse(result)
      expect(url).toContain("example.com")
      expect(url).toContain("query=1")
    })
  })

  describe("urljoin()", () => {
    it("should join base and relative URL", () => {
      const result = urllib.urljoin("https://example.com/a/b", "../c")
      expect(result).toBe("https://example.com/c")
    })

    it("should handle absolute URLs", () => {
      const result = urllib.urljoin("https://example.com/a", "https://other.com/b")
      expect(result).toBe("https://other.com/b")
    })
  })

  describe("urlencode()", () => {
    it("should encode object to query string", () => {
      const result = urllib.urlencode({ foo: "bar", baz: "qux" })
      expect(result).toContain("foo=bar")
      expect(result).toContain("baz=qux")
    })

    it("should encode array of tuples", () => {
      const result = urllib.urlencode([
        ["foo", "bar"],
        ["foo", "baz"]
      ])
      expect(result).toBe("foo=bar&foo=baz")
    })

    it("should handle array values with doseq", () => {
      const result = urllib.urlencode({ foo: ["a", "b"] }, true)
      expect(result).toBe("foo=a&foo=b")
    })
  })

  describe("parseQs()", () => {
    it("should parse query string to object", () => {
      const result = urllib.parseQs("foo=bar&baz=qux")
      expect(result.foo).toEqual(["bar"])
      expect(result.baz).toEqual(["qux"])
    })

    it("should handle multiple values for same key", () => {
      const result = urllib.parseQs("foo=a&foo=b")
      expect(result.foo).toEqual(["a", "b"])
    })
  })

  describe("parseQsl()", () => {
    it("should parse query string to array of tuples", () => {
      const result = urllib.parseQsl("foo=bar&baz=qux")
      expect(result).toEqual([
        ["foo", "bar"],
        ["baz", "qux"]
      ])
    })
  })

  describe("quote()", () => {
    it("should percent-encode string", () => {
      expect(urllib.quote("hello world")).toBe("hello%20world")
      expect(urllib.quote("foo/bar")).toBe("foo%2Fbar")
    })

    it("should allow safe characters", () => {
      expect(urllib.quote("foo/bar", "/")).toBe("foo/bar")
    })
  })

  describe("quotePlus()", () => {
    it("should encode spaces as plus", () => {
      expect(urllib.quotePlus("hello world")).toBe("hello+world")
    })
  })

  describe("unquote()", () => {
    it("should decode percent-encoded string", () => {
      expect(urllib.unquote("hello%20world")).toBe("hello world")
    })
  })

  describe("unquotePlus()", () => {
    it("should decode plus as space", () => {
      expect(urllib.unquotePlus("hello+world")).toBe("hello world")
    })
  })

  describe("splittype()", () => {
    it("should split URL into scheme and rest", () => {
      const [scheme, rest] = urllib.splittype("https://example.com")
      expect(scheme).toBe("https")
      expect(rest).toBe("//example.com")
    })
  })

  describe("splithost()", () => {
    it("should split after host", () => {
      const [host, rest] = urllib.splithost("//example.com/path")
      expect(host).toBe("example.com")
      expect(rest).toBe("/path")
    })
  })

  describe("splitport()", () => {
    it("should split host and port", () => {
      const [host, port] = urllib.splitport("example.com:8080")
      expect(host).toBe("example.com")
      expect(port).toBe("8080")
    })

    it("should handle IPv6 addresses", () => {
      const [host, port] = urllib.splitport("[::1]:8080")
      expect(host).toBe("::1")
      expect(port).toBe("8080")
    })
  })

  describe("parse namespace", () => {
    it("should export all parse functions", () => {
      expect(urllib.parse.urlparse).toBe(urllib.urlparse)
      expect(urllib.parse.urljoin).toBe(urllib.urljoin)
      expect(urllib.parse.quote).toBe(urllib.quote)
    })
  })
})

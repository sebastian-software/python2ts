/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { describe, it, expect } from "vitest"
import * as time from "./time"

describe("time module", () => {
  describe("time()", () => {
    it("should return seconds since epoch", () => {
      const t = time.time()
      expect(typeof t).toBe("number")
      expect(t).toBeGreaterThan(0)
      // Should be reasonably close to Date.now() / 1000
      expect(Math.abs(t - Date.now() / 1000)).toBeLessThan(1)
    })
  })

  describe("timeNs()", () => {
    it("should return nanoseconds since epoch as BigInt", () => {
      const ns = time.timeNs()
      expect(typeof ns).toBe("bigint")
      expect(ns).toBeGreaterThan(0n)
    })
  })

  describe("sleep()", () => {
    it("should sleep for specified seconds", () => {
      const start = Date.now()
      time.sleep(0.05) // 50ms
      const elapsed = Date.now() - start
      expect(elapsed).toBeGreaterThanOrEqual(40)
      expect(elapsed).toBeLessThan(200)
    })
  })

  describe("perfCounter()", () => {
    it("should return monotonically increasing values", () => {
      const t1 = time.perfCounter()
      const t2 = time.perfCounter()
      expect(t2).toBeGreaterThanOrEqual(t1)
    })
  })

  describe("perfCounterNs()", () => {
    it("should return BigInt", () => {
      const ns = time.perfCounterNs()
      expect(typeof ns).toBe("bigint")
    })
  })

  describe("monotonic()", () => {
    it("should return monotonically increasing values", () => {
      const t1 = time.monotonic()
      const t2 = time.monotonic()
      expect(t2).toBeGreaterThanOrEqual(t1)
    })
  })

  describe("localtime()", () => {
    it("should return a StructTime for current time", () => {
      const t = time.localtime()
      expect(t.tm_year).toBeGreaterThan(2000)
      expect(t.tm_mon).toBeGreaterThanOrEqual(1)
      expect(t.tm_mon).toBeLessThanOrEqual(12)
      expect(t.tm_mday).toBeGreaterThanOrEqual(1)
      expect(t.tm_mday).toBeLessThanOrEqual(31)
      expect(t.tm_hour).toBeGreaterThanOrEqual(0)
      expect(t.tm_hour).toBeLessThanOrEqual(23)
    })

    it("should accept seconds since epoch", () => {
      // Jan 1, 2020 00:00:00 UTC
      const t = time.localtime(1577836800)
      expect(t.tm_year).toBe(2020)
    })
  })

  describe("gmtime()", () => {
    it("should return UTC time", () => {
      // Jan 1, 2020 00:00:00 UTC
      const t = time.gmtime(1577836800)
      expect(t.tm_year).toBe(2020)
      expect(t.tm_mon).toBe(1)
      expect(t.tm_mday).toBe(1)
      expect(t.tm_hour).toBe(0)
      expect(t.tm_min).toBe(0)
      expect(t.tm_sec).toBe(0)
      expect(t.tm_isdst).toBe(0)
    })
  })

  describe("mktime()", () => {
    it("should convert StructTime to seconds since epoch", () => {
      const t: time.StructTime = {
        tm_year: 2020,
        tm_mon: 1,
        tm_mday: 1,
        tm_hour: 0,
        tm_min: 0,
        tm_sec: 0,
        tm_wday: 2,
        tm_yday: 1,
        tm_isdst: -1
      }
      const secs = time.mktime(t)
      expect(secs).toBeGreaterThan(0)
      // Convert back should give same values
      const back = time.localtime(secs)
      expect(back.tm_year).toBe(t.tm_year)
      expect(back.tm_mon).toBe(t.tm_mon)
      expect(back.tm_mday).toBe(t.tm_mday)
    })
  })

  describe("strftime()", () => {
    it("should format time with basic codes", () => {
      const t: time.StructTime = {
        tm_year: 2023,
        tm_mon: 7,
        tm_mday: 15,
        tm_hour: 14,
        tm_min: 30,
        tm_sec: 45,
        tm_wday: 5, // Saturday
        tm_yday: 196,
        tm_isdst: 1
      }
      expect(time.strftime("%Y-%m-%d", t)).toBe("2023-07-15")
      expect(time.strftime("%H:%M:%S", t)).toBe("14:30:45")
      expect(time.strftime("%Y", t)).toBe("2023")
      expect(time.strftime("%%", t)).toBe("%")
    })

    it("should format month and day names", () => {
      const t: time.StructTime = {
        tm_year: 2023,
        tm_mon: 7,
        tm_mday: 15,
        tm_hour: 14,
        tm_min: 30,
        tm_sec: 45,
        tm_wday: 5,
        tm_yday: 196,
        tm_isdst: 1
      }
      expect(time.strftime("%B", t)).toBe("July")
      expect(time.strftime("%b", t)).toBe("Jul")
      expect(time.strftime("%A", t)).toBe("Saturday")
      expect(time.strftime("%a", t)).toBe("Sat")
    })

    it("should handle 12-hour format", () => {
      const t: time.StructTime = {
        tm_year: 2023,
        tm_mon: 1,
        tm_mday: 1,
        tm_hour: 14,
        tm_min: 0,
        tm_sec: 0,
        tm_wday: 6,
        tm_yday: 1,
        tm_isdst: 0
      }
      expect(time.strftime("%I", t)).toBe("02")
      expect(time.strftime("%p", t)).toBe("PM")
    })
  })

  describe("strptime()", () => {
    it("should parse basic date format", () => {
      const t = time.strptime("2023-07-15", "%Y-%m-%d")
      expect(t.tm_year).toBe(2023)
      expect(t.tm_mon).toBe(7)
      expect(t.tm_mday).toBe(15)
    })

    it("should parse time format", () => {
      const t = time.strptime("14:30:45", "%H:%M:%S")
      expect(t.tm_hour).toBe(14)
      expect(t.tm_min).toBe(30)
      expect(t.tm_sec).toBe(45)
    })

    it("should throw for invalid format", () => {
      expect(() => time.strptime("invalid", "%Y-%m-%d")).toThrow()
    })
  })

  describe("asctime()", () => {
    it("should format time as string", () => {
      const t: time.StructTime = {
        tm_year: 2023,
        tm_mon: 7,
        tm_mday: 15,
        tm_hour: 14,
        tm_min: 30,
        tm_sec: 45,
        tm_wday: 5,
        tm_yday: 196,
        tm_isdst: 1
      }
      const result = time.asctime(t)
      expect(result).toContain("Sat")
      expect(result).toContain("Jul")
      expect(result).toContain("15")
      expect(result).toContain("2023")
    })
  })

  describe("ctime()", () => {
    it("should format seconds since epoch as string", () => {
      const result = time.ctime(1577836800) // Jan 1, 2020
      expect(result).toContain("2020")
    })
  })

  describe("timezone", () => {
    it("should be a number", () => {
      expect(typeof time.timezone).toBe("number")
    })
  })

  describe("tzname", () => {
    it("should be a tuple of strings", () => {
      expect(Array.isArray(time.tzname)).toBe(true)
      expect(time.tzname).toHaveLength(2)
      expect(typeof time.tzname[0]).toBe("string")
      expect(typeof time.tzname[1]).toBe("string")
    })
  })

  describe("processTime()", () => {
    it("should return a number", () => {
      const t = time.processTime()
      expect(typeof t).toBe("number")
      expect(t).toBeGreaterThanOrEqual(0)
    })
  })

  describe("threadTime()", () => {
    it("should return a number", () => {
      const t = time.threadTime()
      expect(typeof t).toBe("number")
      expect(t).toBeGreaterThanOrEqual(0)
    })
  })
})

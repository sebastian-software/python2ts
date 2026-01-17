import { describe, it, expect } from "vitest"
import { transpile } from "../../src/generator/index.js"
import { py } from "../../src/runtime/index.js"

describe("E2E: datetime module", () => {
  describe("Import Handling", () => {
    it("should strip import datetime", () => {
      const result = transpile("import datetime", { includeRuntime: false })
      expect(result.trim()).toBe("")
    })

    it("should strip from datetime import", () => {
      const result = transpile("from datetime import datetime, date, timedelta", {
        includeRuntime: false
      })
      expect(result.trim()).toBe("")
    })
  })

  describe("Function Transformations", () => {
    it("should transform datetime.datetime.now", () => {
      const result = transpile("x = datetime.datetime.now()", { includeRuntime: false })
      expect(result).toContain("py.datetime.datetime.now()")
    })

    it("should transform datetime.date.today", () => {
      const result = transpile("x = datetime.date.today()", { includeRuntime: false })
      expect(result).toContain("py.datetime.date.today()")
    })

    it("should transform datetime constructor", () => {
      const result = transpile("x = datetime(2024, 1, 1)", { includeRuntime: false })
      expect(result).toContain("new py.datetime.datetime(2024, 1, 1)")
    })
  })

  describe("Runtime: date class", () => {
    it("should create a date", () => {
      const d = new py.datetime.date(2024, 6, 15)
      expect(d.year).toBe(2024)
      expect(d.month).toBe(6)
      expect(d.day).toBe(15)
    })

    it("date.today should return current date", () => {
      const today = py.datetime.date.today()
      expect(today.year).toBeGreaterThanOrEqual(2024)
      expect(today.month).toBeGreaterThanOrEqual(1)
      expect(today.month).toBeLessThanOrEqual(12)
    })

    it("should format date as isoformat", () => {
      const d = new py.datetime.date(2024, 6, 15)
      expect(d.isoformat()).toBe("2024-06-15")
    })

    it("should parse isoformat", () => {
      const d = py.datetime.date.fromisoformat("2024-06-15")
      expect(d.year).toBe(2024)
      expect(d.month).toBe(6)
      expect(d.day).toBe(15)
    })

    it("should get weekday", () => {
      const d = new py.datetime.date(2024, 6, 15) // Saturday
      expect(d.weekday()).toBe(5) // Monday=0, Saturday=5
      expect(d.isoweekday()).toBe(6) // Monday=1, Saturday=6
    })

    it("should replace date parts", () => {
      const d = new py.datetime.date(2024, 6, 15)
      const d2 = d.replace({ month: 12 })
      expect(d2.month).toBe(12)
      expect(d2.year).toBe(2024)
      expect(d2.day).toBe(15)
    })
  })

  describe("Runtime: time class", () => {
    it("should create a time", () => {
      const t = new py.datetime.time(14, 30, 45)
      expect(t.hour).toBe(14)
      expect(t.minute).toBe(30)
      expect(t.second).toBe(45)
    })

    it("should format time as isoformat", () => {
      const t = new py.datetime.time(14, 30, 45)
      expect(t.isoformat()).toBe("14:30:45")
    })

    it("should handle microseconds", () => {
      const t = new py.datetime.time(14, 30, 45, 123456)
      expect(t.microsecond).toBe(123456)
      expect(t.isoformat()).toBe("14:30:45.123456")
    })

    it("should parse isoformat", () => {
      const t = py.datetime.time.fromisoformat("14:30:45")
      expect(t.hour).toBe(14)
      expect(t.minute).toBe(30)
      expect(t.second).toBe(45)
    })
  })

  describe("Runtime: datetime class", () => {
    it("should create a datetime", () => {
      const dt = new py.datetime.datetime(2024, 6, 15, 14, 30, 45)
      expect(dt.year).toBe(2024)
      expect(dt.month).toBe(6)
      expect(dt.day).toBe(15)
      expect(dt.hour).toBe(14)
      expect(dt.minute).toBe(30)
      expect(dt.second).toBe(45)
    })

    it("datetime.now should return current datetime", () => {
      const now = py.datetime.datetime.now()
      expect(now.year).toBeGreaterThanOrEqual(2024)
    })

    it("should format datetime as isoformat", () => {
      const dt = new py.datetime.datetime(2024, 6, 15, 14, 30, 45)
      expect(dt.isoformat()).toBe("2024-06-15T14:30:45")
    })

    it("should parse isoformat", () => {
      const dt = py.datetime.datetime.fromisoformat("2024-06-15T14:30:45")
      expect(dt.year).toBe(2024)
      expect(dt.hour).toBe(14)
    })

    it("should parse isoformat with space", () => {
      const dt = py.datetime.datetime.fromisoformat("2024-06-15 14:30:45")
      expect(dt.year).toBe(2024)
      expect(dt.hour).toBe(14)
    })

    it("should combine date and time", () => {
      const d = new py.datetime.date(2024, 6, 15)
      const t = new py.datetime.time(14, 30, 45)
      const dt = py.datetime.datetime.combine(d, t)
      expect(dt.year).toBe(2024)
      expect(dt.hour).toBe(14)
    })

    it("should extract date and time", () => {
      const dt = new py.datetime.datetime(2024, 6, 15, 14, 30, 45)
      const d = dt.date()
      const t = dt.time()
      expect(d.year).toBe(2024)
      expect(t.hour).toBe(14)
    })

    it("should get timestamp", () => {
      const dt = new py.datetime.datetime(2024, 6, 15, 14, 30, 45)
      const ts = dt.timestamp()
      expect(typeof ts).toBe("number")
    })

    it("should fromtimestamp", () => {
      const ts = Date.now() / 1000
      const dt = py.datetime.datetime.fromtimestamp(ts)
      expect(dt.year).toBeGreaterThanOrEqual(2024)
    })
  })

  describe("Runtime: timedelta class", () => {
    it("should create a timedelta from days", () => {
      const td = new py.datetime.timedelta({ days: 5 })
      expect(td.days).toBe(5)
    })

    it("should create a timedelta from hours", () => {
      const td = new py.datetime.timedelta({ hours: 25 })
      expect(td.days).toBe(1)
      expect(td.seconds).toBe(3600)
    })

    it("should calculate total_seconds", () => {
      const td = new py.datetime.timedelta({ days: 1, hours: 2 })
      expect(td.total_seconds()).toBe(24 * 3600 + 2 * 3600)
    })

    it("should add timedeltas", () => {
      const td1 = new py.datetime.timedelta({ days: 1 })
      const td2 = new py.datetime.timedelta({ days: 2 })
      const sum = td1.add(td2)
      expect(sum.days).toBe(3)
    })
  })

  describe("Runtime: strftime/strptime", () => {
    it("strftime should format datetime", () => {
      const dt = new py.datetime.datetime(2024, 6, 15, 14, 30, 45)
      expect(dt.strftime("%Y-%m-%d")).toBe("2024-06-15")
      expect(dt.strftime("%H:%M:%S")).toBe("14:30:45")
    })

    it("strptime should parse datetime", () => {
      const dt = py.datetime.datetime.strptime("2024-06-15", "%Y-%m-%d")
      expect(dt.year).toBe(2024)
      expect(dt.month).toBe(6)
      expect(dt.day).toBe(15)
    })
  })
})

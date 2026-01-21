/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { describe, it, expect } from "vitest"
import * as datetime from "./datetime"

describe("datetime module", () => {
  describe("date class", () => {
    it("should create a date", () => {
      const d = new datetime.date(2024, 1, 15)
      expect(d.year).toBe(2024)
      expect(d.month).toBe(1)
      expect(d.day).toBe(15)
    })

    it("should format with strftime", () => {
      const d = new datetime.date(2024, 1, 15)
      expect(d.strftime("%Y-%m-%d")).toBe("2024-01-15")
    })

    it("should get today", () => {
      const today = datetime.date.today()
      expect(today.year).toBeGreaterThan(2020)
    })

    it("should get weekday", () => {
      const d = new datetime.date(2024, 1, 1) // Monday
      expect(d.weekday()).toBe(0)
    })

    it("should get isoWeekday", () => {
      const d = new datetime.date(2024, 1, 1) // Monday
      expect(d.isoWeekday()).toBe(1)
    })

    it("should get isoFormat", () => {
      const d = new datetime.date(2024, 1, 15)
      expect(d.isoFormat()).toBe("2024-01-15")
    })

    it("should replace parts", () => {
      const d = new datetime.date(2024, 1, 15)
      const d2 = d.replace({ month: 6 })
      expect(d2.month).toBe(6)
    })
  })

  describe("time class", () => {
    it("should create a time", () => {
      const t = new datetime.time(14, 30, 45)
      expect(t.hour).toBe(14)
      expect(t.minute).toBe(30)
      expect(t.second).toBe(45)
    })

    it("should format with strftime", () => {
      const t = new datetime.time(14, 30, 45)
      expect(t.strftime("%H:%M:%S")).toBe("14:30:45")
    })

    it("should get isoFormat", () => {
      const t = new datetime.time(14, 30, 45)
      expect(t.isoFormat()).toBe("14:30:45")
    })

    it("should replace parts", () => {
      const t = new datetime.time(14, 30, 45)
      const t2 = t.replace({ hour: 10 })
      expect(t2.hour).toBe(10)
    })
  })

  describe("datetime class", () => {
    it("should create a datetime", () => {
      const dt = new datetime.datetime(2024, 1, 15, 14, 30, 45)
      expect(dt.year).toBe(2024)
      expect(dt.hour).toBe(14)
    })

    it("should get now", () => {
      const now = datetime.datetime.now()
      expect(now.year).toBeGreaterThan(2020)
    })

    it("should format with strftime", () => {
      const dt = new datetime.datetime(2024, 1, 15, 14, 30, 45)
      expect(dt.strftime("%Y-%m-%d %H:%M:%S")).toBe("2024-01-15 14:30:45")
    })

    it("should get isoFormat", () => {
      const dt = new datetime.datetime(2024, 1, 15, 14, 30, 45)
      expect(dt.isoFormat()).toContain("2024-01-15")
    })

    it("should extract date", () => {
      const dt = new datetime.datetime(2024, 1, 15, 14, 30, 45)
      const d = dt.date()
      expect(d.year).toBe(2024)
      expect(d.month).toBe(1)
    })

    it("should extract time", () => {
      const dt = new datetime.datetime(2024, 1, 15, 14, 30, 45)
      const t = dt.time()
      expect(t.hour).toBe(14)
    })

    it("should get timestamp", () => {
      const dt = new datetime.datetime(2024, 1, 15, 0, 0, 0)
      const ts = dt.timestamp()
      expect(ts).toBeGreaterThan(0)
    })

    it("should parse from isoFormat", () => {
      const dt = datetime.datetime.fromIsoFormat("2024-01-15T14:30:45")
      expect(dt.year).toBe(2024)
      expect(dt.hour).toBe(14)
    })

    it("should combine date and time", () => {
      const d = new datetime.date(2024, 1, 15)
      const t = new datetime.time(14, 30)
      const dt = datetime.datetime.combine(d, t)
      expect(dt.year).toBe(2024)
      expect(dt.hour).toBe(14)
    })
  })

  describe("timedelta class", () => {
    it("should create a timedelta", () => {
      const td = new datetime.timedelta({ days: 1, hours: 2 })
      expect(td.totalSeconds()).toBe(86400 + 7200)
    })

    it("should handle negative values", () => {
      const td = new datetime.timedelta({ days: -1 })
      expect(td.totalSeconds()).toBe(-86400)
    })

    it("should add timedeltas", () => {
      const td1 = new datetime.timedelta({ days: 1 })
      const td2 = new datetime.timedelta({ hours: 12 })
      const result = td1.add(td2)
      expect(result.totalSeconds()).toBe(86400 + 43200)
    })

    it("should subtract timedeltas", () => {
      const td1 = new datetime.timedelta({ days: 2 })
      const td2 = new datetime.timedelta({ days: 1 })
      const result = td1.subtract(td2)
      expect(result.totalSeconds()).toBe(86400)
    })

    it("should multiply timedelta", () => {
      const td = new datetime.timedelta({ days: 1 })
      const result = td.multiply(2)
      expect(result.totalSeconds()).toBe(86400 * 2)
    })

    it("should convert to string", () => {
      const td1 = new datetime.timedelta({ days: 1, hours: 2, minutes: 30 })
      expect(td1.toString()).toContain("1 day")
      const td2 = new datetime.timedelta({ days: 2 })
      expect(td2.toString()).toContain("2 days")
      const td3 = new datetime.timedelta({ microseconds: 500000 })
      expect(td3.toString()).toContain(".")
    })

    it("should handle weeks and milliseconds", () => {
      const td = new datetime.timedelta({ weeks: 1, milliseconds: 500 })
      expect(td.days).toBe(7)
      expect(td.microseconds).toBe(500000)
    })

    it("should have static min/max/resolution", () => {
      expect(datetime.timedelta.min.days).toBe(-999999999)
      expect(datetime.timedelta.max.days).toBe(999999999)
      expect(datetime.timedelta.resolution.microseconds).toBe(1)
    })
  })

  describe("date class - extended", () => {
    it("should create from timestamp", () => {
      const d = datetime.date.fromTimestamp(1705363200) // 2024-01-16
      expect(d.year).toBe(2024)
    })

    it("should create from isoFormat", () => {
      const d = datetime.date.fromIsoFormat("2024-06-15")
      expect(d.year).toBe(2024)
      expect(d.month).toBe(6)
      expect(d.day).toBe(15)
    })

    it("should throw on invalid isoFormat", () => {
      expect(() => datetime.date.fromIsoFormat("invalid")).toThrow()
    })

    it("should convert to/from ordinal", () => {
      const d = new datetime.date(2024, 1, 15)
      const ordinal = d.toOrdinal()
      expect(ordinal).toBeGreaterThan(0)
      const d2 = datetime.date.fromOrdinal(ordinal)
      expect(d2.year).toBe(d.year)
    })

    it("should get isoCalendar", () => {
      // Use a date that's clearly in the middle of the year
      const d = new datetime.date(2024, 6, 15)
      const [year, week, weekday] = d.isoCalendar()
      expect(year).toBe(2024)
      expect(week).toBeGreaterThan(0)
      expect(weekday).toBeGreaterThanOrEqual(1)
      expect(weekday).toBeLessThanOrEqual(7)
    })

    it("should handle isoCalendar edge cases", () => {
      // Early January that belongs to previous year's week
      const d1 = new datetime.date(2021, 1, 1) // Friday of week 53 of 2020
      const [year1] = d1.isoCalendar()
      expect(year1).toBeLessThanOrEqual(2021)

      // Late December that belongs to next year's week
      const d2 = new datetime.date(2020, 12, 31)
      const [year2, week2] = d2.isoCalendar()
      expect(week2).toBeGreaterThan(50)
      expect(year2).toBeGreaterThanOrEqual(2020)
    })

    it("should add timedelta", () => {
      const d = new datetime.date(2024, 1, 15)
      const td = new datetime.timedelta({ days: 10 })
      const result = d.__add__(td)
      expect(result.day).toBe(25)
    })

    it("should subtract timedelta", () => {
      const d = new datetime.date(2024, 1, 15)
      const td = new datetime.timedelta({ days: 5 })
      const result = d.__sub__(td)
      expect(result instanceof datetime.date).toBe(true)
      expect((result as datetime.date).day).toBe(10)
    })

    it("should subtract dates", () => {
      const d1 = new datetime.date(2024, 1, 15)
      const d2 = new datetime.date(2024, 1, 10)
      const result = d1.__sub__(d2)
      expect(result instanceof datetime.timedelta).toBe(true)
      expect((result as datetime.timedelta).days).toBe(5)
    })

    it("should compare dates", () => {
      const d1 = new datetime.date(2024, 1, 15)
      const d2 = new datetime.date(2024, 1, 10)
      const d3 = new datetime.date(2024, 1, 15)
      expect(d1.__gt__(d2)).toBe(true)
      expect(d1.__ge__(d2)).toBe(true)
      expect(d2.__lt__(d1)).toBe(true)
      expect(d2.__le__(d1)).toBe(true)
      expect(d1.__eq__(d3)).toBe(true)
    })

    it("should have static min/max/resolution", () => {
      expect(datetime.date.min.year).toBe(1)
      expect(datetime.date.max.year).toBe(9999)
      expect(datetime.date.resolution.days).toBe(1)
    })

    it("should validate month range", () => {
      expect(() => new datetime.date(2024, 0, 1)).toThrow("month must be in 1..12")
      expect(() => new datetime.date(2024, 13, 1)).toThrow("month must be in 1..12")
    })

    it("should validate day range", () => {
      expect(() => new datetime.date(2024, 2, 30)).toThrow("day is out of range")
    })
  })

  describe("time class - extended", () => {
    it("should create from isoFormat", () => {
      const t = datetime.time.fromIsoFormat("14:30:45")
      expect(t.hour).toBe(14)
      expect(t.minute).toBe(30)
      expect(t.second).toBe(45)
    })

    it("should parse microseconds in isoFormat", () => {
      const t = datetime.time.fromIsoFormat("14:30:45.123456")
      expect(t.microsecond).toBe(123456)
    })

    it("should throw on invalid isoFormat", () => {
      expect(() => datetime.time.fromIsoFormat("invalid")).toThrow()
    })

    it("should format with different timespec", () => {
      const t = new datetime.time(14, 30, 45, 123456)
      expect(t.isoFormat("hours")).toBe("14")
      expect(t.isoFormat("minutes")).toBe("14:30")
      expect(t.isoFormat("seconds")).toBe("14:30:45")
      expect(t.isoFormat("milliseconds")).toBe("14:30:45.123")
      expect(t.isoFormat("microseconds")).toBe("14:30:45.123456")
    })

    it("should convert to string", () => {
      const t = new datetime.time(14, 30, 45)
      expect(t.toString()).toBe("14:30:45")
    })

    it("should have static min/max/resolution", () => {
      expect(datetime.time.min.hour).toBe(0)
      expect(datetime.time.max.hour).toBe(23)
      expect(datetime.time.resolution.microseconds).toBe(1)
    })

    it("should validate ranges", () => {
      expect(() => new datetime.time(24, 0, 0)).toThrow("hour must be in 0..23")
      expect(() => new datetime.time(0, 60, 0)).toThrow("minute must be in 0..59")
      expect(() => new datetime.time(0, 0, 60)).toThrow("second must be in 0..59")
      expect(() => new datetime.time(0, 0, 0, 1000000)).toThrow("microsecond must be in 0..999999")
    })
  })

  describe("datetime class - extended", () => {
    it("should get today (datetime)", () => {
      const today = datetime.datetime.today()
      expect(today.year).toBeGreaterThan(2020)
    })

    it("should get utcNow", () => {
      const utcNow = datetime.datetime.utcNow()
      expect(utcNow.year).toBeGreaterThan(2020)
    })

    it("should create from timestamp", () => {
      const dt = datetime.datetime.fromTimestamp(1705363200)
      expect(dt.year).toBe(2024)
    })

    it("should create from UTC timestamp", () => {
      const dt = datetime.datetime.utcfromTimestamp(1705363200)
      expect(dt.year).toBe(2024)
    })

    it("should parse date-only isoFormat", () => {
      const dt = datetime.datetime.fromIsoFormat("2024-06-15")
      expect(dt.year).toBe(2024)
      expect(dt.hour).toBe(0)
    })

    it("should parse isoFormat with space separator", () => {
      const dt = datetime.datetime.fromIsoFormat("2024-06-15 14:30:45")
      expect(dt.year).toBe(2024)
      expect(dt.hour).toBe(14)
    })

    it("should parse isoFormat with microseconds", () => {
      const dt = datetime.datetime.fromIsoFormat("2024-06-15T14:30:45.123456")
      expect(dt.microsecond).toBe(123456)
    })

    it("should throw on invalid isoFormat", () => {
      expect(() => datetime.datetime.fromIsoFormat("invalid")).toThrow()
    })

    it("should replace parts", () => {
      const dt = new datetime.datetime(2024, 1, 15, 14, 30, 45)
      const dt2 = dt.replace({ year: 2025, hour: 10 })
      expect(dt2.year).toBe(2025)
      expect(dt2.hour).toBe(10)
    })

    it("should get ctime", () => {
      const dt = new datetime.datetime(2024, 1, 15, 14, 30, 45) // Monday
      const ctime = dt.ctime()
      expect(ctime).toContain("Mon")
      expect(ctime).toContain("Jan")
      expect(ctime).toContain("2024")
    })

    it("should format isoFormat with custom separator", () => {
      const dt = new datetime.datetime(2024, 1, 15, 14, 30, 45)
      expect(dt.isoFormat(" ")).toContain("2024-01-15 14:30:45")
    })

    it("should add timedelta", () => {
      const dt = new datetime.datetime(2024, 1, 15, 12, 0, 0)
      const td = new datetime.timedelta({ hours: 6 })
      const result = dt.__add__(td)
      expect(result.hour).toBe(18)
    })

    it("should subtract timedelta", () => {
      const dt = new datetime.datetime(2024, 1, 15, 12, 0, 0)
      const td = new datetime.timedelta({ hours: 6 })
      const result = dt.__sub__(td)
      expect(result instanceof datetime.datetime).toBe(true)
      expect((result as datetime.datetime).hour).toBe(6)
    })

    it("should subtract datetime", () => {
      const dt1 = new datetime.datetime(2024, 1, 15, 12, 0, 0)
      const dt2 = new datetime.datetime(2024, 1, 15, 6, 0, 0)
      const result = dt1.__sub__(dt2)
      expect(result instanceof datetime.timedelta).toBe(true)
      expect((result as datetime.timedelta).totalSeconds()).toBe(6 * 3600)
    })

    it("should subtract date from datetime", () => {
      const dt = new datetime.datetime(2024, 1, 15, 12, 0, 0)
      const d = new datetime.date(2024, 1, 10)
      const result = dt.__sub__(d)
      expect(result instanceof datetime.timedelta).toBe(true)
      expect((result as datetime.timedelta).days).toBe(5)
    })

    it("should have static min/max/resolution", () => {
      expect(datetime.datetime.min.year).toBe(1)
      expect(datetime.datetime.max.year).toBe(9999)
      expect(datetime.datetime.resolution.microseconds).toBe(1)
    })

    it("should validate ranges", () => {
      expect(() => new datetime.datetime(2024, 1, 1, 24, 0, 0)).toThrow("hour must be in 0..23")
      expect(() => new datetime.datetime(2024, 1, 1, 0, 60, 0)).toThrow("minute must be in 0..59")
    })

    it("should parse with strptime", () => {
      const dt = datetime.datetime.strptime("2024-01-15", "%Y-%m-%d")
      expect(dt.year).toBe(2024)
      expect(dt.month).toBe(1)
      expect(dt.day).toBe(15)
    })
  })

  describe("strftime extended", () => {
    it("should format weekday names", () => {
      const dt = new datetime.datetime(2024, 1, 15, 0, 0, 0) // Monday
      expect(dt.strftime("%a")).toBe("Mon")
      expect(dt.strftime("%A")).toBe("Monday")
    })

    it("should format month names", () => {
      const dt = new datetime.datetime(2024, 6, 15, 0, 0, 0)
      expect(dt.strftime("%b")).toBe("Jun")
      expect(dt.strftime("%B")).toBe("June")
    })

    it("should format %c (ctime)", () => {
      const dt = new datetime.datetime(2024, 1, 15, 14, 30, 45)
      expect(dt.strftime("%c")).toContain("Mon")
    })

    it("should format %I (12-hour)", () => {
      const dt1 = new datetime.datetime(2024, 1, 15, 14, 30, 0)
      expect(dt1.strftime("%I")).toBe("02")
      const dt2 = new datetime.datetime(2024, 1, 15, 0, 30, 0)
      expect(dt2.strftime("%I")).toBe("12")
    })

    it("should format %p (AM/PM)", () => {
      const dt1 = new datetime.datetime(2024, 1, 15, 10, 0, 0)
      expect(dt1.strftime("%p")).toBe("AM")
      const dt2 = new datetime.datetime(2024, 1, 15, 14, 0, 0)
      expect(dt2.strftime("%p")).toBe("PM")
    })

    it("should format %j (day of year)", () => {
      const dt = new datetime.datetime(2024, 2, 1, 0, 0, 0)
      expect(dt.strftime("%j")).toBe("032")
    })

    it("should format %w (weekday number)", () => {
      const dt = new datetime.datetime(2024, 1, 15, 0, 0, 0) // Monday
      expect(dt.strftime("%w")).toBe("1")
    })

    it("should format %U and %W (week number)", () => {
      const dt = new datetime.datetime(2024, 1, 15, 0, 0, 0)
      expect(dt.strftime("%U")).toMatch(/^\d{2}$/)
      expect(dt.strftime("%W")).toMatch(/^\d{2}$/)
    })

    it("should format %x and %X (locale date/time)", () => {
      const dt = new datetime.datetime(2024, 1, 15, 14, 30, 45)
      expect(dt.strftime("%x")).toBe("01/15/24")
      expect(dt.strftime("%X")).toBe("14:30:45")
    })

    it("should format %y (2-digit year)", () => {
      const dt = new datetime.datetime(2024, 1, 15, 0, 0, 0)
      expect(dt.strftime("%y")).toBe("24")
    })

    it("should format %z and %Z (timezone)", () => {
      const dt = new datetime.datetime(2024, 1, 15, 0, 0, 0)
      expect(dt.strftime("%z")).toBe("")
      expect(dt.strftime("%Z")).toBe("")
    })
  })

  describe("strptime extended", () => {
    it("should parse 2-digit year", () => {
      const dt1 = datetime.datetime.strptime("24-01-15", "%y-%m-%d")
      expect(dt1.year).toBe(2024)
      const dt2 = datetime.datetime.strptime("70-01-15", "%y-%m-%d")
      expect(dt2.year).toBe(1970)
    })

    it("should parse month names", () => {
      const dt1 = datetime.datetime.strptime("Jan 15, 2024", "%b %d, %Y")
      expect(dt1.month).toBe(1)
      const dt2 = datetime.datetime.strptime("January 15, 2024", "%B %d, %Y")
      expect(dt2.month).toBe(1)
    })

    it("should parse time components", () => {
      const dt = datetime.datetime.strptime("14:30:45", "%H:%M:%S")
      expect(dt.hour).toBe(14)
      expect(dt.minute).toBe(30)
      expect(dt.second).toBe(45)
    })

    it("should parse microseconds", () => {
      const dt = datetime.datetime.strptime("14:30:45.123456", "%H:%M:%S.%f")
      expect(dt.microsecond).toBe(123456)
    })

    it("should throw on invalid format", () => {
      expect(() => datetime.datetime.strptime("invalid", "%Y")).toThrow()
      expect(() => datetime.datetime.strptime("abc", "%m")).toThrow()
      expect(() => datetime.datetime.strptime("abc", "%d")).toThrow()
      expect(() => datetime.datetime.strptime("abc", "%H")).toThrow()
      expect(() => datetime.datetime.strptime("abc", "%M")).toThrow()
      expect(() => datetime.datetime.strptime("abc", "%S")).toThrow()
      expect(() => datetime.datetime.strptime("abc", "%f")).toThrow()
      expect(() => datetime.datetime.strptime("xyz", "%b")).toThrow()
    })

    it("should throw on mismatched literal", () => {
      expect(() => datetime.datetime.strptime("2024/01/15", "%Y-%m-%d")).toThrow()
    })
  })
})

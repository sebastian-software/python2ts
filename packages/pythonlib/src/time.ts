/**
 * Python time module for TypeScript
 *
 * Provides time-related functions including time access, conversions,
 * and formatting. Note that `sleep()` uses a synchronous busy-wait
 * which blocks the event loop.
 *
 * @see {@link https://docs.python.org/3/library/time.html | Python time documentation}
 * @module
 */

/**
 * Structure representing a time tuple, similar to Python's struct_time.
 */
export interface StructTime {
  /** Year (e.g., 2023) */
  tm_year: number
  /** Month (1-12) */
  tm_mon: number
  /** Day of month (1-31) */
  tm_mday: number
  /** Hour (0-23) */
  tm_hour: number
  /** Minute (0-59) */
  tm_min: number
  /** Second (0-61, allowing for leap seconds) */
  tm_sec: number
  /** Day of week (0-6, Monday is 0) */
  tm_wday: number
  /** Day of year (1-366) */
  tm_yday: number
  /** DST flag (-1, 0, or 1) */
  tm_isdst: number
}

// Store start time for monotonic/perf_counter
const startTime = typeof performance !== "undefined" ? performance.now() : Date.now()

/**
 * Return the time in seconds since the epoch as a floating point number.
 *
 * @returns Seconds since Unix epoch (January 1, 1970)
 *
 * @example
 * ```typescript
 * console.log(time()) // 1704067200.123
 * ```
 */
export function time(): number {
  return Date.now() / 1000
}

/**
 * Return the time in nanoseconds since the epoch as a BigInt.
 *
 * @returns Nanoseconds since Unix epoch
 *
 * @example
 * ```typescript
 * console.log(timeNs()) // 1704067200123456789n
 * ```
 */
export function timeNs(): bigint {
  // JavaScript can only get millisecond precision, multiply to nanoseconds
  return BigInt(Date.now()) * 1_000_000n
}

/**
 * Suspend execution for the given number of seconds.
 * WARNING: This uses a synchronous busy-wait that blocks the event loop.
 *
 * @param secs - Number of seconds to sleep (can be fractional)
 *
 * @example
 * ```typescript
 * sleep(0.5) // Sleep for 500 milliseconds
 * ```
 */
export function sleep(secs: number): void {
  const end = Date.now() + secs * 1000
  while (Date.now() < end) {
    // Busy wait - blocks the event loop
  }
}

/**
 * Return the value of a performance counter (monotonic clock).
 * Uses performance.now() for high precision.
 *
 * @returns Seconds as a float (relative to an undefined reference point)
 *
 * @example
 * ```typescript
 * const start = perfCounter()
 * // ... do work ...
 * const elapsed = perfCounter() - start
 * ```
 */
export function perfCounter(): number {
  if (typeof performance !== "undefined") {
    return performance.now() / 1000
  }
  return (Date.now() - startTime) / 1000
}

/**
 * Return the value of a performance counter in nanoseconds.
 *
 * @returns Nanoseconds as a BigInt (relative to an undefined reference point)
 */
export function perfCounterNs(): bigint {
  if (typeof performance !== "undefined") {
    return BigInt(Math.floor(performance.now() * 1_000_000))
  }
  return BigInt(Date.now() - startTime) * 1_000_000n
}

/**
 * Return the value of a monotonic clock.
 * This clock cannot go backwards and is not affected by system clock updates.
 *
 * @returns Seconds as a float (relative to an undefined reference point)
 */
export function monotonic(): number {
  return perfCounter()
}

/**
 * Return the value of a monotonic clock in nanoseconds.
 *
 * @returns Nanoseconds as a BigInt
 */
export function monotonicNs(): bigint {
  return perfCounterNs()
}

/**
 * Convert seconds since epoch to a StructTime in local time.
 *
 * @param secs - Seconds since epoch (defaults to current time)
 * @returns StructTime object representing local time
 *
 * @example
 * ```typescript
 * const t = localtime()
 * console.log(t.tm_year, t.tm_mon, t.tm_mday)
 * ```
 */
export function localtime(secs?: number): StructTime {
  const date = secs === undefined ? new Date() : new Date(secs * 1000)

  // Calculate day of year
  const startOfYear = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - startOfYear.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  const tm_yday = Math.floor(diff / oneDay)

  // JavaScript getDay() returns 0=Sunday, Python uses 0=Monday
  const jsDay = date.getDay()
  const tm_wday = jsDay === 0 ? 6 : jsDay - 1

  return {
    tm_year: date.getFullYear(),
    tm_mon: date.getMonth() + 1, // JavaScript months are 0-indexed
    tm_mday: date.getDate(),
    tm_hour: date.getHours(),
    tm_min: date.getMinutes(),
    tm_sec: date.getSeconds(),
    tm_wday,
    tm_yday,
    tm_isdst: -1 // Not determinable in JavaScript
  }
}

/**
 * Convert seconds since epoch to a StructTime in UTC.
 *
 * @param secs - Seconds since epoch (defaults to current time)
 * @returns StructTime object representing UTC time
 */
export function gmtime(secs?: number): StructTime {
  const date = secs === undefined ? new Date() : new Date(secs * 1000)

  // Calculate day of year for UTC
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 0))
  const diff = date.getTime() - startOfYear.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  const tm_yday = Math.floor(diff / oneDay)

  // JavaScript getUTCDay() returns 0=Sunday, Python uses 0=Monday
  const jsDay = date.getUTCDay()
  const tm_wday = jsDay === 0 ? 6 : jsDay - 1

  return {
    tm_year: date.getUTCFullYear(),
    tm_mon: date.getUTCMonth() + 1,
    tm_mday: date.getUTCDate(),
    tm_hour: date.getUTCHours(),
    tm_min: date.getUTCMinutes(),
    tm_sec: date.getUTCSeconds(),
    tm_wday,
    tm_yday,
    tm_isdst: 0 // UTC never has DST
  }
}

/**
 * Convert a StructTime to seconds since epoch (inverse of localtime).
 *
 * @param t - StructTime object
 * @returns Seconds since epoch as a float
 */
export function mktime(t: StructTime): number {
  const date = new Date(
    t.tm_year,
    t.tm_mon - 1, // Convert to 0-indexed month
    t.tm_mday,
    t.tm_hour,
    t.tm_min,
    t.tm_sec
  )
  return date.getTime() / 1000
}

/**
 * Format a StructTime as a string using strftime-style format codes.
 *
 * Supported format codes:
 * - %Y: Year with century (e.g., 2023)
 * - %y: Year without century (00-99)
 * - %m: Month (01-12)
 * - %d: Day of month (01-31)
 * - %H: Hour 24-hour (00-23)
 * - %I: Hour 12-hour (01-12)
 * - %M: Minute (00-59)
 * - %S: Second (00-61)
 * - %p: AM or PM
 * - %A: Full weekday name
 * - %a: Abbreviated weekday name
 * - %B: Full month name
 * - %b: Abbreviated month name
 * - %w: Weekday as decimal (0-6, Sunday is 0)
 * - %j: Day of year (001-366)
 * - %U: Week number of year (Sunday first day)
 * - %W: Week number of year (Monday first day)
 * - %c: Locale's date and time representation
 * - %x: Locale's date representation
 * - %X: Locale's time representation
 * - %%: Literal %
 *
 * @param format - Format string
 * @param t - StructTime object (defaults to current local time)
 * @returns Formatted time string
 */
export function strftime(format: string, t?: StructTime): string {
  const st = t ?? localtime()

  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const weekdaysShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]
  const monthsShort = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ]

  const pad = (n: number, width = 2): string => String(n).padStart(width, "0")

  // Convert Python weekday (0=Mon) to Sunday=0 for %w
  const sundayWday = (st.tm_wday + 1) % 7

  // Hour for 12-hour format
  const hour12 = st.tm_hour % 12 || 12

  // Week number calculations
  const date = new Date(st.tm_year, st.tm_mon - 1, st.tm_mday)
  const startOfYear = new Date(st.tm_year, 0, 1)
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)) + 1

  // Week number starting Sunday
  const sundayWeek = Math.floor((dayOfYear + startOfYear.getDay()) / 7)
  // Week number starting Monday
  const mondayWeek = Math.floor((dayOfYear + ((startOfYear.getDay() + 6) % 7)) / 7)

  const replacements: Record<string, string> = {
    "%Y": String(st.tm_year),
    "%y": pad(st.tm_year % 100),
    "%m": pad(st.tm_mon),
    "%d": pad(st.tm_mday),
    "%H": pad(st.tm_hour),
    "%I": pad(hour12),
    "%M": pad(st.tm_min),
    "%S": pad(st.tm_sec),
    "%p": st.tm_hour < 12 ? "AM" : "PM",
    "%A": weekdays[st.tm_wday] ?? "",
    "%a": weekdaysShort[st.tm_wday] ?? "",
    "%B": months[st.tm_mon - 1] ?? "",
    "%b": monthsShort[st.tm_mon - 1] ?? "",
    "%w": String(sundayWday),
    "%j": pad(st.tm_yday, 3),
    "%U": pad(sundayWeek),
    "%W": pad(mondayWeek),
    "%c": `${weekdaysShort[st.tm_wday] ?? ""} ${monthsShort[st.tm_mon - 1] ?? ""} ${pad(st.tm_mday)} ${pad(st.tm_hour)}:${pad(st.tm_min)}:${pad(st.tm_sec)} ${String(st.tm_year)}`,
    "%x": `${pad(st.tm_mon)}/${pad(st.tm_mday)}/${pad(st.tm_year % 100)}`,
    "%X": `${pad(st.tm_hour)}:${pad(st.tm_min)}:${pad(st.tm_sec)}`,
    "%%": "%"
  }

  let result = format
  for (const [code, value] of Object.entries(replacements)) {
    result = result.split(code).join(value)
  }
  return result
}

/**
 * Parse a string according to a format and return a StructTime.
 *
 * @param timeString - String to parse
 * @param format - Format string (same codes as strftime)
 * @returns StructTime object
 * @throws Error if string doesn't match format
 */
export function strptime(timeString: string, format: string): StructTime {
  const result: Partial<StructTime> = {
    tm_year: 1900,
    tm_mon: 1,
    tm_mday: 1,
    tm_hour: 0,
    tm_min: 0,
    tm_sec: 0,
    tm_wday: 0,
    tm_yday: 1,
    tm_isdst: -1
  }

  const monthsShort = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec"
  ]
  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december"
  ]

  // Build regex pattern from format string
  let pattern = format

  // Escape special regex characters except %
  pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

  // Map of format codes to regex patterns and handlers
  const formatMap: Array<{
    code: string
    regex: string
    handler: (match: string) => void
  }> = [
    { code: "%Y", regex: "(\\d{4})", handler: (m) => (result.tm_year = parseInt(m, 10)) },
    {
      code: "%y",
      regex: "(\\d{2})",
      handler: (m) => {
        const yr = parseInt(m, 10)
        result.tm_year = yr >= 69 ? 1900 + yr : 2000 + yr
      }
    },
    { code: "%m", regex: "(\\d{1,2})", handler: (m) => (result.tm_mon = parseInt(m, 10)) },
    { code: "%d", regex: "(\\d{1,2})", handler: (m) => (result.tm_mday = parseInt(m, 10)) },
    { code: "%H", regex: "(\\d{1,2})", handler: (m) => (result.tm_hour = parseInt(m, 10)) },
    { code: "%I", regex: "(\\d{1,2})", handler: (m) => (result.tm_hour = parseInt(m, 10)) },
    { code: "%M", regex: "(\\d{1,2})", handler: (m) => (result.tm_min = parseInt(m, 10)) },
    { code: "%S", regex: "(\\d{1,2})", handler: (m) => (result.tm_sec = parseInt(m, 10)) },
    {
      code: "%p",
      regex: "(AM|PM|am|pm)",
      handler: (m) => {
        if (m.toUpperCase() === "PM" && result.tm_hour !== undefined && result.tm_hour < 12) {
          result.tm_hour += 12
        } else if (m.toUpperCase() === "AM" && result.tm_hour === 12) {
          result.tm_hour = 0
        }
      }
    },
    {
      code: "%b",
      regex: "([A-Za-z]+)",
      handler: (m) => {
        const idx = monthsShort.indexOf(m.toLowerCase())
        if (idx !== -1) result.tm_mon = idx + 1
      }
    },
    {
      code: "%B",
      regex: "([A-Za-z]+)",
      handler: (m) => {
        const idx = months.indexOf(m.toLowerCase())
        if (idx !== -1) result.tm_mon = idx + 1
      }
    },
    { code: "%j", regex: "(\\d{1,3})", handler: (m) => (result.tm_yday = parseInt(m, 10)) },
    { code: "%w", regex: "(\\d)", handler: (m) => (result.tm_wday = (parseInt(m, 10) + 6) % 7) },
    { code: "%%", regex: "%", handler: () => {} }
  ]

  const handlers: Array<(match: string) => void> = []

  // Replace format codes with regex patterns
  for (const { code, regex, handler } of formatMap) {
    const idx = pattern.indexOf(code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    if (idx !== -1) {
      pattern = pattern.replace(code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), regex)
      handlers.push(handler)
    }
  }

  const match = new RegExp("^" + pattern + "$").exec(timeString)
  if (!match) {
    throw new Error(`time data '${timeString}' does not match format '${format}'`)
  }

  // Apply handlers in order
  for (let i = 0; i < handlers.length; i++) {
    if (match[i + 1] !== undefined) {
      handlers[i]?.(match[i + 1] ?? "")
    }
  }

  // Calculate tm_wday if not set
  if (result.tm_year !== undefined && result.tm_mon !== undefined && result.tm_mday !== undefined) {
    const date = new Date(result.tm_year, result.tm_mon - 1, result.tm_mday)
    const jsDay = date.getDay()
    result.tm_wday = jsDay === 0 ? 6 : jsDay - 1
  }

  // Calculate tm_yday if not set
  if (result.tm_year !== undefined && result.tm_mon !== undefined && result.tm_mday !== undefined) {
    const date = new Date(result.tm_year, result.tm_mon - 1, result.tm_mday)
    const startOfYear = new Date(result.tm_year, 0, 0)
    const diff = date.getTime() - startOfYear.getTime()
    const oneDay = 1000 * 60 * 60 * 24
    result.tm_yday = Math.floor(diff / oneDay)
  }

  return result as StructTime
}

/**
 * Convert a StructTime to a string in the format: "Dow Mon dd hh:mm:ss yyyy"
 *
 * @param t - StructTime object (defaults to current local time)
 * @returns Formatted time string
 */
export function asctime(t?: StructTime): string {
  return strftime("%a %b %d %H:%M:%S %Y", t)
}

/**
 * Convert seconds since epoch to a string (equivalent to asctime(localtime(secs)))
 *
 * @param secs - Seconds since epoch (defaults to current time)
 * @returns Formatted time string
 */
export function ctime(secs?: number): string {
  return asctime(localtime(secs))
}

/**
 * Return the offset of the local timezone from UTC in seconds.
 * Positive values mean west of UTC, negative mean east.
 */
export const timezone: number = new Date().getTimezoneOffset() * 60

/**
 * Return the offset of the local timezone from UTC in seconds during DST.
 * This is the same as timezone on systems that don't have DST.
 */
export const altzone: number = timezone

/**
 * Return a tuple of two strings: standard timezone name and DST timezone name.
 */
export const tzname: [string, string] = (() => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  return [tz, tz]
})()

/**
 * True if DST is defined for the local timezone.
 */
export const daylight: number = 0

/**
 * Return the process time as a float (CPU time used by the process).
 * In JavaScript, this approximates using Date.now().
 */
export function processTime(): number {
  // JavaScript doesn't provide actual CPU time, approximate with wall time
  if (typeof performance !== "undefined") {
    return performance.now() / 1000
  }
  return Date.now() / 1000
}

/**
 * Return the process time in nanoseconds.
 */
export function processTimeNs(): bigint {
  if (typeof performance !== "undefined") {
    return BigInt(Math.floor(performance.now() * 1_000_000))
  }
  return BigInt(Date.now()) * 1_000_000n
}

/**
 * Return the current thread's CPU time (same as processTime in JavaScript).
 */
export function threadTime(): number {
  return processTime()
}

/**
 * Return the current thread's CPU time in nanoseconds.
 */
export function threadTimeNs(): bigint {
  return processTimeNs()
}

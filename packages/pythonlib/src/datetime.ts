/**
 * Python datetime module for TypeScript
 *
 * Provides date and time handling matching Python's datetime module.
 */

// ============================================================================
// timedelta class
// ============================================================================

export class timedelta {
  readonly days: number
  readonly seconds: number
  readonly microseconds: number

  constructor(options?: {
    days?: number
    seconds?: number
    microseconds?: number
    milliseconds?: number
    minutes?: number
    hours?: number
    weeks?: number
  }) {
    let totalMicroseconds = 0

    if (options) {
      totalMicroseconds += (options.weeks ?? 0) * 7 * 24 * 60 * 60 * 1000000
      totalMicroseconds += (options.days ?? 0) * 24 * 60 * 60 * 1000000
      totalMicroseconds += (options.hours ?? 0) * 60 * 60 * 1000000
      totalMicroseconds += (options.minutes ?? 0) * 60 * 1000000
      totalMicroseconds += (options.seconds ?? 0) * 1000000
      totalMicroseconds += (options.milliseconds ?? 0) * 1000
      totalMicroseconds += options.microseconds ?? 0
    }

    // Normalize to days, seconds, microseconds
    const sign = totalMicroseconds < 0 ? -1 : 1
    totalMicroseconds = Math.abs(totalMicroseconds)

    this.microseconds = sign * (totalMicroseconds % 1000000)
    totalMicroseconds = Math.floor(totalMicroseconds / 1000000)

    this.seconds = sign * (totalMicroseconds % (24 * 60 * 60))
    this.days = sign * Math.floor(totalMicroseconds / (24 * 60 * 60))

    // Normalize negative values
    if (this.microseconds < 0) {
      ;(this as { microseconds: number }).microseconds += 1000000
      ;(this as { seconds: number }).seconds -= 1
    }
    if (this.seconds < 0) {
      ;(this as { seconds: number }).seconds += 24 * 60 * 60
      ;(this as { days: number }).days -= 1
    }
  }

  total_seconds(): number {
    return this.days * 24 * 60 * 60 + this.seconds + this.microseconds / 1000000
  }

  toString(): string {
    const parts: string[] = []
    if (this.days !== 0) {
      parts.push(`${String(this.days)} day${Math.abs(this.days) !== 1 ? "s" : ""}`)
    }
    const hours = Math.floor(this.seconds / 3600)
    const minutes = Math.floor((this.seconds % 3600) / 60)
    const secs = this.seconds % 60
    const timeStr = `${String(hours)}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    if (this.microseconds > 0) {
      parts.push(`${timeStr}.${String(this.microseconds).padStart(6, "0")}`)
    } else {
      parts.push(timeStr)
    }
    return parts.join(", ")
  }

  add(other: timedelta): timedelta {
    return new timedelta({
      days: this.days + other.days,
      seconds: this.seconds + other.seconds,
      microseconds: this.microseconds + other.microseconds
    })
  }

  subtract(other: timedelta): timedelta {
    return new timedelta({
      days: this.days - other.days,
      seconds: this.seconds - other.seconds,
      microseconds: this.microseconds - other.microseconds
    })
  }

  multiply(n: number): timedelta {
    return new timedelta({
      microseconds: Math.round(this.total_seconds() * 1000000 * n)
    })
  }

  static min = new timedelta({ days: -999999999 })
  static max = new timedelta({
    days: 999999999,
    hours: 23,
    minutes: 59,
    seconds: 59,
    microseconds: 999999
  })
  static resolution = new timedelta({ microseconds: 1 })
}

// ============================================================================
// date class
// ============================================================================

export class date {
  readonly year: number
  readonly month: number
  readonly day: number

  constructor(year: number, month: number, day: number) {
    if (month < 1 || month > 12) {
      throw new Error("month must be in 1..12")
    }
    const maxDay = new Date(year, month, 0).getDate()
    if (day < 1 || day > maxDay) {
      throw new Error(`day is out of range for month`)
    }
    this.year = year
    this.month = month
    this.day = day
  }

  static today(): date {
    const now = new Date()
    return new date(now.getFullYear(), now.getMonth() + 1, now.getDate())
  }

  static fromtimestamp(timestamp: number): date {
    const d = new Date(timestamp * 1000)
    return new date(d.getFullYear(), d.getMonth() + 1, d.getDate())
  }

  static fromisoformat(dateString: string): date {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString)
    if (!match || !match[1] || !match[2] || !match[3]) {
      throw new Error(`Invalid isoformat string: '${dateString}'`)
    }
    return new date(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]))
  }

  static fromordinal(ordinal: number): date {
    // Days since year 1
    const d = new Date(Date.UTC(1, 0, ordinal))
    return new date(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate())
  }

  replace(options?: { year?: number; month?: number; day?: number }): date {
    return new date(
      options?.year ?? this.year,
      options?.month ?? this.month,
      options?.day ?? this.day
    )
  }

  toordinal(): number {
    const d = new Date(Date.UTC(this.year, this.month - 1, this.day))
    const epoch = new Date(Date.UTC(1, 0, 1))
    return Math.floor((d.getTime() - epoch.getTime()) / (24 * 60 * 60 * 1000)) + 1
  }

  weekday(): number {
    // Monday is 0, Sunday is 6
    const d = new Date(this.year, this.month - 1, this.day)
    return (d.getDay() + 6) % 7
  }

  isoweekday(): number {
    // Monday is 1, Sunday is 7
    return this.weekday() + 1
  }

  isocalendar(): [number, number, number] {
    const d = new Date(this.year, this.month - 1, this.day)
    const dayOfYear = Math.floor(
      (d.getTime() - new Date(this.year, 0, 0).getTime()) / (24 * 60 * 60 * 1000)
    )
    const jan1 = new Date(this.year, 0, 1)
    const jan1Weekday = (jan1.getDay() + 6) % 7 // Monday = 0

    let week = Math.floor((dayOfYear + jan1Weekday - 1) / 7)
    let year = this.year

    if (week < 1) {
      year -= 1
      week = 52
    } else if (week > 52) {
      const dec31 = new Date(this.year, 11, 31)
      const dec31Weekday = (dec31.getDay() + 6) % 7
      if (dec31Weekday < 3) {
        week = 1
        year += 1
      }
    }

    return [year, week, this.isoweekday()]
  }

  isoformat(): string {
    return `${String(this.year)}-${String(this.month).padStart(2, "0")}-${String(this.day).padStart(2, "0")}`
  }

  strftime(format: string): string {
    return strftime(format, new datetime(this.year, this.month, this.day, 0, 0, 0, 0))
  }

  toString(): string {
    return this.isoformat()
  }

  __add__(delta: timedelta): date {
    const d = new Date(this.year, this.month - 1, this.day + delta.days)
    return new date(d.getFullYear(), d.getMonth() + 1, d.getDate())
  }

  __sub__(other: date | timedelta): date | timedelta {
    if (other instanceof timedelta) {
      const d = new Date(this.year, this.month - 1, this.day - other.days)
      return new date(d.getFullYear(), d.getMonth() + 1, d.getDate())
    }
    // other is a date
    const d1 = new Date(this.year, this.month - 1, this.day)
    const d2 = new Date(other.year, other.month - 1, other.day)
    const diffMs = d1.getTime() - d2.getTime()
    return new timedelta({ days: Math.floor(diffMs / (24 * 60 * 60 * 1000)) })
  }

  __lt__(other: date): boolean {
    return this.toordinal() < other.toordinal()
  }

  __le__(other: date): boolean {
    return this.toordinal() <= other.toordinal()
  }

  __gt__(other: date): boolean {
    return this.toordinal() > other.toordinal()
  }

  __ge__(other: date): boolean {
    return this.toordinal() >= other.toordinal()
  }

  __eq__(other: date): boolean {
    return this.toordinal() === other.toordinal()
  }

  static min = new date(1, 1, 1)
  static max = new date(9999, 12, 31)
  static resolution = new timedelta({ days: 1 })
}

// ============================================================================
// time class
// ============================================================================

export class time {
  readonly hour: number
  readonly minute: number
  readonly second: number
  readonly microsecond: number
  readonly tzinfo: null

  constructor(hour: number = 0, minute: number = 0, second: number = 0, microsecond: number = 0) {
    if (hour < 0 || hour > 23) throw new Error("hour must be in 0..23")
    if (minute < 0 || minute > 59) throw new Error("minute must be in 0..59")
    if (second < 0 || second > 59) throw new Error("second must be in 0..59")
    if (microsecond < 0 || microsecond > 999999) throw new Error("microsecond must be in 0..999999")

    this.hour = hour
    this.minute = minute
    this.second = second
    this.microsecond = microsecond
    this.tzinfo = null
  }

  static fromisoformat(timeString: string): time {
    const match = /^(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/.exec(timeString)
    if (!match || !match[1] || !match[2] || !match[3]) {
      throw new Error(`Invalid isoformat string: '${timeString}'`)
    }
    const microsecond = match[4] ? parseInt(match[4].padEnd(6, "0").slice(0, 6)) : 0
    return new time(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), microsecond)
  }

  replace(options?: {
    hour?: number
    minute?: number
    second?: number
    microsecond?: number
  }): time {
    return new time(
      options?.hour ?? this.hour,
      options?.minute ?? this.minute,
      options?.second ?? this.second,
      options?.microsecond ?? this.microsecond
    )
  }

  isoformat(
    timespec: "auto" | "hours" | "minutes" | "seconds" | "milliseconds" | "microseconds" = "auto"
  ): string {
    const hh = String(this.hour).padStart(2, "0")
    const mm = String(this.minute).padStart(2, "0")
    const ss = String(this.second).padStart(2, "0")

    switch (timespec) {
      case "hours":
        return hh
      case "minutes":
        return `${hh}:${mm}`
      case "seconds":
        return `${hh}:${mm}:${ss}`
      case "milliseconds":
        return `${hh}:${mm}:${ss}.${String(Math.floor(this.microsecond / 1000)).padStart(3, "0")}`
      case "microseconds":
        return `${hh}:${mm}:${ss}.${String(this.microsecond).padStart(6, "0")}`
      case "auto":
      default:
        if (this.microsecond > 0) {
          return `${hh}:${mm}:${ss}.${String(this.microsecond).padStart(6, "0")}`
        }
        return `${hh}:${mm}:${ss}`
    }
  }

  strftime(format: string): string {
    return strftime(
      format,
      new datetime(1900, 1, 1, this.hour, this.minute, this.second, this.microsecond)
    )
  }

  toString(): string {
    return this.isoformat()
  }

  static min = new time(0, 0, 0, 0)
  static max = new time(23, 59, 59, 999999)
  static resolution = new timedelta({ microseconds: 1 })
}

// ============================================================================
// datetime class
// ============================================================================

export class datetime extends date {
  readonly hour: number
  readonly minute: number
  readonly second: number
  readonly microsecond: number
  readonly tzinfo: null

  constructor(
    year: number,
    month: number,
    day: number,
    hour: number = 0,
    minute: number = 0,
    second: number = 0,
    microsecond: number = 0
  ) {
    super(year, month, day)
    if (hour < 0 || hour > 23) throw new Error("hour must be in 0..23")
    if (minute < 0 || minute > 59) throw new Error("minute must be in 0..59")
    if (second < 0 || second > 59) throw new Error("second must be in 0..59")
    if (microsecond < 0 || microsecond > 999999) throw new Error("microsecond must be in 0..999999")

    this.hour = hour
    this.minute = minute
    this.second = second
    this.microsecond = microsecond
    this.tzinfo = null
  }

  static override today(): datetime {
    return datetime.now()
  }

  static now(): datetime {
    const d = new Date()
    return new datetime(
      d.getFullYear(),
      d.getMonth() + 1,
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
      d.getMilliseconds() * 1000
    )
  }

  static utcnow(): datetime {
    const d = new Date()
    return new datetime(
      d.getUTCFullYear(),
      d.getUTCMonth() + 1,
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds(),
      d.getUTCMilliseconds() * 1000
    )
  }

  static override fromtimestamp(timestamp: number): datetime {
    const d = new Date(timestamp * 1000)
    return new datetime(
      d.getFullYear(),
      d.getMonth() + 1,
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
      d.getMilliseconds() * 1000
    )
  }

  static utcfromtimestamp(timestamp: number): datetime {
    const d = new Date(timestamp * 1000)
    return new datetime(
      d.getUTCFullYear(),
      d.getUTCMonth() + 1,
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds(),
      d.getUTCMilliseconds() * 1000
    )
  }

  static override fromisoformat(s: string): datetime {
    // Parse ISO format: YYYY-MM-DD[T]HH:MM:SS[.ffffff]
    const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/.exec(s)
    if (!match || !match[1] || !match[2] || !match[3] || !match[4] || !match[5] || !match[6]) {
      // Try date-only format
      const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
      if (dateMatch && dateMatch[1] && dateMatch[2] && dateMatch[3]) {
        return new datetime(parseInt(dateMatch[1]), parseInt(dateMatch[2]), parseInt(dateMatch[3]))
      }
      throw new Error(`Invalid isoformat string: '${s}'`)
    }
    const microsecond = match[7] ? parseInt(match[7].padEnd(6, "0").slice(0, 6)) : 0
    return new datetime(
      parseInt(match[1]),
      parseInt(match[2]),
      parseInt(match[3]),
      parseInt(match[4]),
      parseInt(match[5]),
      parseInt(match[6]),
      microsecond
    )
  }

  static combine(d: date, t: time): datetime {
    return new datetime(d.year, d.month, d.day, t.hour, t.minute, t.second, t.microsecond)
  }

  static strptime(dateString: string, format: string): datetime {
    return strptime(dateString, format)
  }

  override replace(options?: {
    year?: number
    month?: number
    day?: number
    hour?: number
    minute?: number
    second?: number
    microsecond?: number
  }): datetime {
    return new datetime(
      options?.year ?? this.year,
      options?.month ?? this.month,
      options?.day ?? this.day,
      options?.hour ?? this.hour,
      options?.minute ?? this.minute,
      options?.second ?? this.second,
      options?.microsecond ?? this.microsecond
    )
  }

  date(): date {
    return new date(this.year, this.month, this.day)
  }

  time(): time {
    return new time(this.hour, this.minute, this.second, this.microsecond)
  }

  timestamp(): number {
    const d = new Date(
      this.year,
      this.month - 1,
      this.day,
      this.hour,
      this.minute,
      this.second,
      this.microsecond / 1000
    )
    return d.getTime() / 1000
  }

  override isoformat(
    sep: string = "T",
    timespec: "auto" | "hours" | "minutes" | "seconds" | "milliseconds" | "microseconds" = "auto"
  ): string {
    const dateStr = super.isoformat()
    const t = new time(this.hour, this.minute, this.second, this.microsecond)
    return `${dateStr}${sep}${t.isoformat(timespec)}`
  }

  ctime(): string {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const months = [
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
    const dayName = days[this.weekday()] ?? "???"
    const monthName = months[this.month - 1] ?? "???"
    return `${dayName} ${monthName} ${String(this.day).padStart(2, " ")} ${String(this.hour).padStart(2, "0")}:${String(this.minute).padStart(2, "0")}:${String(this.second).padStart(2, "0")} ${String(this.year)}`
  }

  override strftime(format: string): string {
    return strftime(format, this)
  }

  override toString(): string {
    return this.isoformat(" ")
  }

  override __add__(delta: timedelta): datetime {
    const totalMicroseconds =
      this.timestamp() * 1000000 + this.microsecond + delta.total_seconds() * 1000000
    return datetime.fromtimestamp(totalMicroseconds / 1000000)
  }

  override __sub__(other: datetime | date | timedelta): datetime | timedelta {
    if (other instanceof timedelta) {
      const totalMicroseconds =
        this.timestamp() * 1000000 + this.microsecond - other.total_seconds() * 1000000
      return datetime.fromtimestamp(totalMicroseconds / 1000000)
    }
    if (other instanceof datetime) {
      const diff = this.timestamp() - other.timestamp()
      const microDiff = this.microsecond - other.microsecond
      return new timedelta({ seconds: diff, microseconds: microDiff })
    }
    // other is a date
    const d1 = new Date(this.year, this.month - 1, this.day)
    const d2 = new Date(other.year, other.month - 1, other.day)
    const diffMs = d1.getTime() - d2.getTime()
    return new timedelta({ days: Math.floor(diffMs / (24 * 60 * 60 * 1000)) })
  }

  static override min = new datetime(1, 1, 1, 0, 0, 0, 0)
  static override max = new datetime(9999, 12, 31, 23, 59, 59, 999999)
  static override resolution = new timedelta({ microseconds: 1 })
}

// ============================================================================
// strftime and strptime
// ============================================================================

const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const WEEKDAY_ABBR = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MONTH_NAMES = [
  "",
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
const MONTH_ABBR = [
  "",
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

export function strftime(format: string, dt: datetime): string {
  const pad = (n: number, width: number = 2) => String(n).padStart(width, "0")

  return format.replace(/%([aAbBcdHIjmMpSUwWxXyYzZ%])/g, (_, code: string) => {
    switch (code) {
      case "a":
        return WEEKDAY_ABBR[dt.weekday()] ?? ""
      case "A":
        return WEEKDAY_NAMES[dt.weekday()] ?? ""
      case "b":
        return MONTH_ABBR[dt.month] ?? ""
      case "B":
        return MONTH_NAMES[dt.month] ?? ""
      case "c":
        return dt.ctime()
      case "d":
        return pad(dt.day)
      case "H":
        return pad(dt.hour)
      case "I":
        return pad(dt.hour % 12 || 12)
      case "j": {
        const start = new Date(dt.year, 0, 0)
        const diff = new Date(dt.year, dt.month - 1, dt.day).getTime() - start.getTime()
        const dayOfYear = Math.floor(diff / (24 * 60 * 60 * 1000))
        return pad(dayOfYear, 3)
      }
      case "m":
        return pad(dt.month)
      case "M":
        return pad(dt.minute)
      case "p":
        return dt.hour < 12 ? "AM" : "PM"
      case "S":
        return pad(dt.second)
      case "U": {
        // Week number (Sunday as first day)
        const start = new Date(dt.year, 0, 1)
        const diff = new Date(dt.year, dt.month - 1, dt.day).getTime() - start.getTime()
        const dayOfYear = Math.floor(diff / (24 * 60 * 60 * 1000))
        const firstSunday = (7 - start.getDay()) % 7
        return pad(Math.floor((dayOfYear - firstSunday + 7) / 7))
      }
      case "w":
        return String((dt.weekday() + 1) % 7)
      case "W": {
        // Week number (Monday as first day)
        const start = new Date(dt.year, 0, 1)
        const diff = new Date(dt.year, dt.month - 1, dt.day).getTime() - start.getTime()
        const dayOfYear = Math.floor(diff / (24 * 60 * 60 * 1000))
        const firstMonday = (8 - start.getDay()) % 7
        return pad(Math.floor((dayOfYear - firstMonday + 7) / 7))
      }
      case "x":
        return `${pad(dt.month)}/${pad(dt.day)}/${pad(dt.year % 100)}`
      case "X":
        return `${pad(dt.hour)}:${pad(dt.minute)}:${pad(dt.second)}`
      case "y":
        return pad(dt.year % 100)
      case "Y":
        return String(dt.year)
      case "z":
        return "" // No timezone info
      case "Z":
        return "" // No timezone name
      case "%":
        return "%"
      default:
        return `%${code}`
    }
  })
}

export function strptime(dateString: string, format: string): datetime {
  let year = 1900,
    month = 1,
    day = 1,
    hour = 0,
    minute = 0,
    second = 0,
    microsecond = 0

  // Build regex from format
  let pos = 0
  let formatPos = 0

  while (formatPos < format.length) {
    if (format[formatPos] === "%") {
      formatPos++
      const code = format[formatPos]
      formatPos++

      switch (code) {
        case "Y": {
          const match = /^\d{4}/.exec(dateString.slice(pos))
          if (!match) throw new Error("Invalid year")
          year = parseInt(match[0])
          pos += 4
          break
        }
        case "y": {
          const match = /^\d{2}/.exec(dateString.slice(pos))
          if (!match) throw new Error("Invalid year")
          const y = parseInt(match[0])
          year = y >= 69 ? 1900 + y : 2000 + y
          pos += 2
          break
        }
        case "m": {
          const match = /^\d{1,2}/.exec(dateString.slice(pos))
          if (!match) throw new Error("Invalid month")
          month = parseInt(match[0])
          pos += match[0].length
          break
        }
        case "d": {
          const match = /^\d{1,2}/.exec(dateString.slice(pos))
          if (!match) throw new Error("Invalid day")
          day = parseInt(match[0])
          pos += match[0].length
          break
        }
        case "H": {
          const match = /^\d{1,2}/.exec(dateString.slice(pos))
          if (!match) throw new Error("Invalid hour")
          hour = parseInt(match[0])
          pos += match[0].length
          break
        }
        case "M": {
          const match = /^\d{1,2}/.exec(dateString.slice(pos))
          if (!match) throw new Error("Invalid minute")
          minute = parseInt(match[0])
          pos += match[0].length
          break
        }
        case "S": {
          const match = /^\d{1,2}/.exec(dateString.slice(pos))
          if (!match) throw new Error("Invalid second")
          second = parseInt(match[0])
          pos += match[0].length
          break
        }
        case "f": {
          const match = /^\d{1,6}/.exec(dateString.slice(pos))
          if (!match) throw new Error("Invalid microsecond")
          microsecond = parseInt(match[0].padEnd(6, "0"))
          pos += match[0].length
          break
        }
        case "b":
        case "B": {
          const names = code === "b" ? MONTH_ABBR : MONTH_NAMES
          let found = false
          for (let i = 1; i <= 12; i++) {
            const name = names[i]
            if (name && dateString.slice(pos).toLowerCase().startsWith(name.toLowerCase())) {
              month = i
              pos += name.length
              found = true
              break
            }
          }
          if (!found) throw new Error("Invalid month name")
          break
        }
        case "%":
          if (dateString[pos] !== "%") throw new Error("Expected %")
          pos++
          break
        default:
          // Skip unknown codes
          break
      }
    } else {
      // Literal character
      const expectedChar = format[formatPos] ?? ""
      if (dateString[pos] !== expectedChar) {
        throw new Error(`Expected '${expectedChar}' at position ${String(pos)}`)
      }
      pos++
      formatPos++
    }
  }

  return new datetime(year, month, day, hour, minute, second, microsecond)
}

// ============================================================================
// Module-level constants
// ============================================================================

export const MINYEAR = 1
export const MAXYEAR = 9999

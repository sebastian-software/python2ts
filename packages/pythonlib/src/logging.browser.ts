/**
 * Python logging module for TypeScript - Browser version
 *
 * Provides a flexible event logging system.
 * FileHandler falls back to console output in browser environment.
 *
 * @see {@link https://docs.python.org/3/library/logging.html | Python logging documentation}
 * @module
 */

/* v8 ignore start -- browser version tested via browser tests @preserve */

/**
 * Logging levels.
 */
export const CRITICAL = 50
export const FATAL = CRITICAL
export const ERROR = 40
export const WARNING = 30
export const WARN = WARNING
export const INFO = 20
export const DEBUG = 10
export const NOTSET = 0

/**
 * Map of level names to values.
 */
export const levelNames: Record<number, string> = {
  [CRITICAL]: "CRITICAL",
  [ERROR]: "ERROR",
  [WARNING]: "WARNING",
  [INFO]: "INFO",
  [DEBUG]: "DEBUG",
  [NOTSET]: "NOTSET"
}

/**
 * Get the level value from a level name.
 */
export function getLevelName(level: number | string): string | number {
  if (typeof level === "number") {
    return levelNames[level] ?? `Level ${String(level)}`
  }
  const upper = level.toUpperCase()
  for (const [num, name] of Object.entries(levelNames)) {
    if (name === upper) {
      return parseInt(num, 10)
    }
  }
  return level
}

/**
 * Log record containing information about a logging event.
 */
export interface LogRecord {
  name: string
  levelno: number
  levelname: string
  msg: string
  args: unknown[]
  created: number
  filename?: string
  lineno?: number
  funcName?: string
  exc_info?: Error
}

/**
 * Handler base class for processing log records.
 */
export abstract class Handler {
  level: number = NOTSET
  formatter: Formatter | null = null

  setLevel(level: number): void {
    this.level = level
  }

  setFormatter(formatter: Formatter): void {
    this.formatter = formatter
  }

  format(record: LogRecord): string {
    if (this.formatter) {
      return this.formatter.format(record)
    }
    return record.msg
  }

  abstract emit(record: LogRecord): void

  handle(record: LogRecord): void {
    if (record.levelno >= this.level) {
      this.emit(record)
    }
  }
}

/**
 * Handler that writes to console.
 */
export class StreamHandler extends Handler {
  emit(record: LogRecord): void {
    const msg = this.format(record)
    if (record.levelno >= ERROR) {
      console.error(msg)
    } else if (record.levelno >= WARNING) {
      console.warn(msg)
    } else if (record.levelno >= INFO) {
      console.info(msg)
    } else {
      console.debug(msg)
    }
  }
}

/**
 * Handler that writes to a file.
 * Browser version: falls back to console output with filename prefix.
 */
export class FileHandler extends Handler {
  private readonly filename: string
  readonly mode: string

  constructor(filename: string, mode = "a") {
    super()
    this.filename = filename
    this.mode = mode
  }

  emit(record: LogRecord): void {
    const msg = this.format(record)
    // In browser, fall back to console with filename label
    console.log(`[${this.filename}]`, msg)
  }
}

/**
 * Formatter for log records.
 */
export class Formatter {
  private readonly fmt: string
  private readonly datefmt: string

  constructor(fmt?: string, datefmt?: string) {
    this.fmt = fmt ?? "%(levelname)s:%(name)s:%(message)s"
    this.datefmt = datefmt ?? "%Y-%m-%d %H:%M:%S"
  }

  formatTime(record: LogRecord): string {
    const date = new Date(record.created * 1000)
    return this.datefmt
      .replace("%Y", String(date.getFullYear()))
      .replace("%m", String(date.getMonth() + 1).padStart(2, "0"))
      .replace("%d", String(date.getDate()).padStart(2, "0"))
      .replace("%H", String(date.getHours()).padStart(2, "0"))
      .replace("%M", String(date.getMinutes()).padStart(2, "0"))
      .replace("%S", String(date.getSeconds()).padStart(2, "0"))
  }

  format(record: LogRecord): string {
    let msg = this.fmt
      .replace("%(name)s", record.name)
      .replace("%(levelno)d", String(record.levelno))
      .replace("%(levelname)s", record.levelname)
      .replace("%(message)s", record.msg)
      .replace("%(asctime)s", this.formatTime(record))

    if (record.filename) {
      msg = msg.replace("%(filename)s", record.filename)
    }
    if (record.lineno !== undefined) {
      msg = msg.replace("%(lineno)d", String(record.lineno))
    }
    if (record.funcName) {
      msg = msg.replace("%(funcName)s", record.funcName)
    }

    return msg
  }
}

/**
 * Logger class for logging events.
 */
export class Logger {
  readonly name: string
  level: number = NOTSET
  handlers: Handler[] = []
  parent: Logger | null = null
  propagate = true

  constructor(name: string) {
    this.name = name
  }

  setLevel(level: number): void {
    this.level = level
  }

  addHandler(handler: Handler): void {
    if (!this.handlers.includes(handler)) {
      this.handlers.push(handler)
    }
  }

  removeHandler(handler: Handler): void {
    const index = this.handlers.indexOf(handler)
    if (index !== -1) {
      this.handlers.splice(index, 1)
    }
  }

  getEffectiveLevel(): number {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let logger: Logger | null = this
    while (logger) {
      if (logger.level !== NOTSET) {
        return logger.level
      }
      logger = logger.parent
    }
    return NOTSET
  }

  isEnabledFor(level: number): boolean {
    return level >= this.getEffectiveLevel()
  }

  private makeRecord(level: number, msg: string, args: unknown[]): LogRecord {
    let formattedMsg = msg
    if (args.length > 0) {
      formattedMsg = msg.replace(/%[sdfo]/g, () => {
        const arg = args.shift()
        return String(arg)
      })
    }

    return {
      name: this.name,
      levelno: level,
      levelname: levelNames[level] ?? `Level ${String(level)}`,
      msg: formattedMsg,
      args,
      created: Date.now() / 1000
    }
  }

  private handle(record: LogRecord): void {
    for (const handler of this.handlers) {
      handler.handle(record)
    }

    if (this.propagate && this.parent) {
      this.parent.handle(record)
    }
  }

  log(level: number, msg: string, ...args: unknown[]): void {
    if (this.isEnabledFor(level)) {
      const record = this.makeRecord(level, msg, args)
      this.handle(record)
    }
  }

  debug(msg: string, ...args: unknown[]): void {
    this.log(DEBUG, msg, ...args)
  }

  info(msg: string, ...args: unknown[]): void {
    this.log(INFO, msg, ...args)
  }

  warning(msg: string, ...args: unknown[]): void {
    this.log(WARNING, msg, ...args)
  }

  warn(msg: string, ...args: unknown[]): void {
    this.warning(msg, ...args)
  }

  error(msg: string, ...args: unknown[]): void {
    this.log(ERROR, msg, ...args)
  }

  critical(msg: string, ...args: unknown[]): void {
    this.log(CRITICAL, msg, ...args)
  }

  fatal(msg: string, ...args: unknown[]): void {
    this.critical(msg, ...args)
  }

  exception(msg: string, ...args: unknown[]): void {
    this.error(msg, ...args)
  }
}

// Logger registry
const loggers = new Map<string, Logger>()
const rootLogger = new Logger("root")
rootLogger.setLevel(WARNING)

/**
 * Get a logger with the specified name.
 */
export function getLogger(name?: string): Logger {
  if (!name) {
    return rootLogger
  }

  let logger = loggers.get(name)
  if (!logger) {
    logger = new Logger(name)

    const parts = name.split(".")
    if (parts.length > 1) {
      const parentName = parts.slice(0, -1).join(".")
      logger.parent = getLogger(parentName)
    } else {
      logger.parent = rootLogger
    }

    loggers.set(name, logger)
  }

  return logger
}

/**
 * Configure the root logger.
 */
export function basicConfig(options?: {
  level?: number
  format?: string
  datefmt?: string
  filename?: string
  filemode?: string
  handlers?: Handler[]
}): void {
  if (rootLogger.handlers.length > 0 && !options?.handlers) {
    return
  }

  rootLogger.handlers = []

  if (options?.level !== undefined) {
    rootLogger.setLevel(options.level)
  }

  const formatter = new Formatter(options?.format, options?.datefmt)

  if (options?.handlers) {
    for (const handler of options.handlers) {
      handler.setFormatter(formatter)
      rootLogger.addHandler(handler)
    }
  } else if (options?.filename) {
    const handler = new FileHandler(options.filename, options.filemode)
    handler.setFormatter(formatter)
    rootLogger.addHandler(handler)
  } else {
    const handler = new StreamHandler()
    handler.setFormatter(formatter)
    rootLogger.addHandler(handler)
  }
}

// Module-level convenience functions
export function debug(msg: string, ...args: unknown[]): void {
  rootLogger.debug(msg, ...args)
}

export function info(msg: string, ...args: unknown[]): void {
  rootLogger.info(msg, ...args)
}

export function warning(msg: string, ...args: unknown[]): void {
  rootLogger.warning(msg, ...args)
}

export function warn(msg: string, ...args: unknown[]): void {
  rootLogger.warn(msg, ...args)
}

export function error(msg: string, ...args: unknown[]): void {
  rootLogger.error(msg, ...args)
}

export function critical(msg: string, ...args: unknown[]): void {
  rootLogger.critical(msg, ...args)
}

export function fatal(msg: string, ...args: unknown[]): void {
  rootLogger.fatal(msg, ...args)
}

export function exception(msg: string, ...args: unknown[]): void {
  rootLogger.exception(msg, ...args)
}

export function log(level: number, msg: string, ...args: unknown[]): void {
  rootLogger.log(level, msg, ...args)
}

/**
 * Set the root logger level.
 */
export function setLevel(level: number): void {
  rootLogger.setLevel(level)
}

/**
 * Disable all logging calls of level below the specified level.
 */
export function disable(level: number = CRITICAL): void {
  rootLogger.setLevel(level + 1)
}

/**
 * Shut down the logging system.
 */
export function shutdown(): void {
  rootLogger.handlers = []
  for (const logger of loggers.values()) {
    logger.handlers = []
  }
  loggers.clear()
}

/* v8 ignore stop */

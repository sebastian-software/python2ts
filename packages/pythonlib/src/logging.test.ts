import { describe, it, expect, beforeEach } from "vitest"
import * as logging from "./logging.node.js"

describe("logging module", () => {
  beforeEach(() => {
    logging.shutdown()
  })

  describe("level constants", () => {
    it("should export level constants", () => {
      expect(logging.DEBUG).toBe(10)
      expect(logging.INFO).toBe(20)
      expect(logging.WARNING).toBe(30)
      expect(logging.WARN).toBe(30)
      expect(logging.ERROR).toBe(40)
      expect(logging.CRITICAL).toBe(50)
      expect(logging.FATAL).toBe(50)
      expect(logging.NOTSET).toBe(0)
    })
  })

  describe("getLevelName()", () => {
    it("should return name for level number", () => {
      expect(logging.getLevelName(10)).toBe("DEBUG")
      expect(logging.getLevelName(20)).toBe("INFO")
      expect(logging.getLevelName(30)).toBe("WARNING")
      expect(logging.getLevelName(40)).toBe("ERROR")
      expect(logging.getLevelName(50)).toBe("CRITICAL")
    })

    it("should return Level N for unknown level number", () => {
      expect(logging.getLevelName(99)).toBe("Level 99")
    })

    it("should return number for level name", () => {
      expect(logging.getLevelName("DEBUG")).toBe(10)
      expect(logging.getLevelName("INFO")).toBe(20)
      expect(logging.getLevelName("WARNING")).toBe(30)
    })

    it("should return original string for unknown level name", () => {
      expect(logging.getLevelName("UNKNOWN")).toBe("UNKNOWN")
    })
  })

  describe("getLogger()", () => {
    it("should return root logger when no name given", () => {
      const logger = logging.getLogger()
      expect(logger.name).toBe("root")
    })

    it("should return named logger", () => {
      const logger = logging.getLogger("myapp")
      expect(logger.name).toBe("myapp")
    })

    it("should return same logger for same name", () => {
      const logger1 = logging.getLogger("myapp")
      const logger2 = logging.getLogger("myapp")
      expect(logger1).toBe(logger2)
    })

    it("should set up hierarchy", () => {
      const parent = logging.getLogger("app")
      const child = logging.getLogger("app.module")
      expect(child.parent).toBe(parent)
    })
  })

  describe("Logger", () => {
    it("should have logging methods", () => {
      const logger = logging.getLogger("test")
      expect(typeof logger.debug).toBe("function")
      expect(typeof logger.info).toBe("function")
      expect(typeof logger.warning).toBe("function")
      expect(typeof logger.error).toBe("function")
      expect(typeof logger.critical).toBe("function")
    })

    it("should respect log level", () => {
      const logger = logging.getLogger("test")
      logger.setLevel(logging.WARNING)
      expect(logger.isEnabledFor(logging.DEBUG)).toBe(false)
      expect(logger.isEnabledFor(logging.INFO)).toBe(false)
      expect(logger.isEnabledFor(logging.WARNING)).toBe(true)
      expect(logger.isEnabledFor(logging.ERROR)).toBe(true)
    })

    it("should inherit level from parent", () => {
      const parent = logging.getLogger("parent")
      const child = logging.getLogger("parent.child")
      parent.setLevel(logging.ERROR)
      expect(child.getEffectiveLevel()).toBe(logging.ERROR)
    })

    it("should add and remove handlers", () => {
      const logger = logging.getLogger("test")
      const handler = new logging.StreamHandler()
      logger.addHandler(handler)
      expect(logger.handlers.length).toBe(1)
      // Adding same handler twice should not duplicate
      logger.addHandler(handler)
      expect(logger.handlers.length).toBe(1)
      logger.removeHandler(handler)
      expect(logger.handlers.length).toBe(0)
      // Removing non-existent handler should not error
      logger.removeHandler(handler)
      expect(logger.handlers.length).toBe(0)
    })

    it("should support warn, fatal, exception aliases", () => {
      const logger = logging.getLogger("test")
      logger.setLevel(logging.DEBUG)
      const handler = new logging.StreamHandler()
      logger.addHandler(handler)
      // These should not throw
      logger.warn("warn message")
      logger.fatal("fatal message")
      logger.exception("exception message")
    })

    it("should format messages with arguments", () => {
      const logger = logging.getLogger("test")
      logger.setLevel(logging.DEBUG)
      let captured = ""
      const handler = new logging.StreamHandler()
      handler.emit = (record) => {
        captured = record.msg
      }
      logger.addHandler(handler)
      logger.info("Hello %s, you have %d messages", "user", 5)
      expect(captured).toBe("Hello user, you have 5 messages")
    })

    it("should propagate to parent", () => {
      const parent = logging.getLogger("parent2")
      const child = logging.getLogger("parent2.child")
      parent.setLevel(logging.DEBUG)
      child.setLevel(logging.DEBUG)
      let parentCalled = false
      const parentHandler = new logging.StreamHandler()
      parentHandler.emit = () => {
        parentCalled = true
      }
      parent.addHandler(parentHandler)
      child.info("test")
      expect(parentCalled).toBe(true)
    })

    it("should return NOTSET when no level set in hierarchy", () => {
      const logger = logging.getLogger("nolevel")
      // Clear the parent's level
      if (logger.parent) {
        logger.parent.level = logging.NOTSET
      }
      logger.level = logging.NOTSET
      expect(logger.getEffectiveLevel()).toBe(logging.NOTSET)
    })
  })

  describe("Handler", () => {
    it("should have StreamHandler", () => {
      const handler = new logging.StreamHandler()
      expect(handler.level).toBe(logging.NOTSET)
    })

    it("should support setLevel", () => {
      const handler = new logging.StreamHandler()
      handler.setLevel(logging.ERROR)
      expect(handler.level).toBe(logging.ERROR)
    })

    it("should support setFormatter", () => {
      const handler = new logging.StreamHandler()
      const formatter = new logging.Formatter("%(message)s")
      handler.setFormatter(formatter)
      expect(handler.formatter).toBe(formatter)
    })

    it("should format without formatter", () => {
      const handler = new logging.StreamHandler()
      const record: logging.LogRecord = {
        name: "test",
        levelno: logging.INFO,
        levelname: "INFO",
        msg: "hello",
        args: [],
        created: Date.now() / 1000
      }
      const result = handler.format(record)
      expect(result).toBe("hello")
    })

    it("should filter by handler level", () => {
      const handler = new logging.StreamHandler()
      handler.setLevel(logging.ERROR)
      let emitted = false
      handler.emit = () => {
        emitted = true
      }
      const lowRecord: logging.LogRecord = {
        name: "test",
        levelno: logging.INFO,
        levelname: "INFO",
        msg: "hello",
        args: [],
        created: Date.now() / 1000
      }
      handler.handle(lowRecord)
      expect(emitted).toBe(false)

      const highRecord: logging.LogRecord = {
        name: "test",
        levelno: logging.ERROR,
        levelname: "ERROR",
        msg: "error",
        args: [],
        created: Date.now() / 1000
      }
      handler.handle(highRecord)
      expect(emitted).toBe(true)
    })

    it("StreamHandler should route to appropriate console method", () => {
      const handler = new logging.StreamHandler()
      const makeRecord = (level: number, levelname: string): logging.LogRecord => ({
        name: "test",
        levelno: level,
        levelname,
        msg: "test",
        args: [],
        created: Date.now() / 1000
      })
      // These should not throw
      handler.emit(makeRecord(logging.DEBUG, "DEBUG"))
      handler.emit(makeRecord(logging.INFO, "INFO"))
      handler.emit(makeRecord(logging.WARNING, "WARNING"))
      handler.emit(makeRecord(logging.ERROR, "ERROR"))
    })

    it("FileHandler should store filename and mode", () => {
      const handler = new logging.FileHandler("/tmp/test.log", "w")
      expect(handler.mode).toBe("w")
    })
  })

  describe("Formatter", () => {
    it("should format log record", () => {
      const formatter = new logging.Formatter("%(levelname)s - %(name)s - %(message)s")
      const record: logging.LogRecord = {
        name: "test",
        levelno: logging.INFO,
        levelname: "INFO",
        msg: "hello",
        args: [],
        created: Date.now() / 1000
      }
      const result = formatter.format(record)
      expect(result).toBe("INFO - test - hello")
    })

    it("should format time", () => {
      const formatter = new logging.Formatter("%(asctime)s - %(message)s", "%Y-%m-%d")
      const record: logging.LogRecord = {
        name: "test",
        levelno: logging.INFO,
        levelname: "INFO",
        msg: "hello",
        args: [],
        created: Date.now() / 1000
      }
      const result = formatter.format(record)
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} - hello$/)
    })

    it("should format with full time spec", () => {
      const formatter = new logging.Formatter("%(asctime)s", "%Y-%m-%d %H:%M:%S")
      const record: logging.LogRecord = {
        name: "test",
        levelno: logging.INFO,
        levelname: "INFO",
        msg: "hello",
        args: [],
        created: Date.now() / 1000
      }
      const result = formatter.format(record)
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
    })

    it("should format filename, lineno, funcName", () => {
      const formatter = new logging.Formatter(
        "%(filename)s:%(lineno)d in %(funcName)s - %(message)s"
      )
      const record: logging.LogRecord = {
        name: "test",
        levelno: logging.INFO,
        levelname: "INFO",
        msg: "hello",
        args: [],
        created: Date.now() / 1000,
        filename: "test.ts",
        lineno: 42,
        funcName: "myFunction"
      }
      const result = formatter.format(record)
      expect(result).toBe("test.ts:42 in myFunction - hello")
    })

    it("should format levelno", () => {
      const formatter = new logging.Formatter("%(levelno)d: %(message)s")
      const record: logging.LogRecord = {
        name: "test",
        levelno: logging.INFO,
        levelname: "INFO",
        msg: "hello",
        args: [],
        created: Date.now() / 1000
      }
      const result = formatter.format(record)
      expect(result).toBe("20: hello")
    })

    it("should use default format", () => {
      const formatter = new logging.Formatter()
      const record: logging.LogRecord = {
        name: "test",
        levelno: logging.INFO,
        levelname: "INFO",
        msg: "hello",
        args: [],
        created: Date.now() / 1000
      }
      const result = formatter.format(record)
      expect(result).toBe("INFO:test:hello")
    })
  })

  describe("basicConfig()", () => {
    it("should configure root logger", () => {
      logging.basicConfig({ level: logging.DEBUG })
      const logger = logging.getLogger()
      expect(logger.level).toBe(logging.DEBUG)
    })

    it("should add handler", () => {
      logging.basicConfig()
      const logger = logging.getLogger()
      expect(logger.handlers.length).toBe(1)
    })

    it("should only configure once", () => {
      logging.basicConfig()
      logging.basicConfig()
      const logger = logging.getLogger()
      expect(logger.handlers.length).toBe(1)
    })

    it("should configure with custom handlers", () => {
      const handler = new logging.StreamHandler()
      logging.basicConfig({ handlers: [handler] })
      const logger = logging.getLogger()
      expect(logger.handlers).toContain(handler)
    })

    it("should configure with filename", () => {
      logging.basicConfig({ filename: "/tmp/test.log", filemode: "w" })
      const logger = logging.getLogger()
      expect(logger.handlers.length).toBe(1)
      expect(logger.handlers[0]).toBeInstanceOf(logging.FileHandler)
    })

    it("should configure with format and datefmt", () => {
      logging.basicConfig({
        format: "%(message)s",
        datefmt: "%Y"
      })
      const logger = logging.getLogger()
      expect(logger.handlers[0]?.formatter).toBeInstanceOf(logging.Formatter)
    })

    it("should reconfigure if handlers option provided", () => {
      logging.basicConfig()
      const handler = new logging.StreamHandler()
      logging.basicConfig({ handlers: [handler] })
      const logger = logging.getLogger()
      expect(logger.handlers).toContain(handler)
    })
  })

  describe("module-level functions", () => {
    it("should have convenience functions", () => {
      expect(typeof logging.debug).toBe("function")
      expect(typeof logging.info).toBe("function")
      expect(typeof logging.warning).toBe("function")
      expect(typeof logging.warn).toBe("function")
      expect(typeof logging.error).toBe("function")
      expect(typeof logging.critical).toBe("function")
      expect(typeof logging.fatal).toBe("function")
      expect(typeof logging.log).toBe("function")
      expect(typeof logging.exception).toBe("function")
    })

    it("should call root logger methods", () => {
      logging.basicConfig({ level: logging.DEBUG })
      // These should not throw
      logging.debug("debug")
      logging.info("info")
      logging.warning("warning")
      logging.warn("warn")
      logging.error("error")
      logging.critical("critical")
      logging.fatal("fatal")
      logging.exception("exception")
      logging.log(logging.INFO, "log")
    })
  })

  describe("disable()", () => {
    it("should disable logging below level", () => {
      logging.disable(logging.WARNING)
      const logger = logging.getLogger()
      expect(logger.isEnabledFor(logging.INFO)).toBe(false)
    })
  })
})

import { describe, it, expect, beforeEach } from "vitest"
import * as logging from "./logging.js"

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

    it("should return number for level name", () => {
      expect(logging.getLevelName("DEBUG")).toBe(10)
      expect(logging.getLevelName("INFO")).toBe(20)
      expect(logging.getLevelName("WARNING")).toBe(30)
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

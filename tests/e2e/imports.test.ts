import { describe, it, expect } from "vitest"
import { transpile } from "../../src/generator/index.js"

describe("E2E: Imports", () => {
  describe("Simple Imports", () => {
    it("should convert simple import", () => {
      const python = `import os`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"import * as os from "os""`
      )
    })

    it("should convert import with alias", () => {
      const python = `import numpy as np`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"import * as np from "numpy""`
      )
    })

    it("should convert import with longer module name", () => {
      const python = `import datetime`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"import * as datetime from "datetime""`
      )
    })
  })

  describe("From Imports", () => {
    it("should convert from import single", () => {
      const python = `from os import path`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"import { path } from "os""`
      )
    })

    it("should convert from import multiple", () => {
      const python = `from os import path, getcwd, chdir`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"import { path, getcwd, chdir } from "os""`
      )
    })

    it("should convert from import with alias", () => {
      // Note: collections imports are now stripped as they're provided by the runtime
      const python = `from os import path as p`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"import { path as p } from "os""`
      )
    })

    it("should convert from import with multiple aliases", () => {
      const python = `from typing import List as L, Dict as D`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`""`)
    })

    it("should convert from import star", () => {
      const python = `from datetime import *`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"import * as datetime from "datetime""`
      )
    })
  })

  describe("Relative Imports", () => {
    it("should convert relative import from current directory", () => {
      const python = `from . import utils`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"import * as utils from "./utils""`
      )
    })

    it("should convert relative import from parent directory", () => {
      const python = `from .. import config`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"import * as config from "../config""`
      )
    })

    it("should convert relative import with module path", () => {
      const python = `from ..utils import helper`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"import { helper } from "../utils""`
      )
    })

    it("should convert deep relative import", () => {
      const python = `from ...core import base`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"import { base } from "../../core""`
      )
    })
  })

  describe("Import with Code", () => {
    it("should convert import followed by code", () => {
      const python = `import os
x = os.path.join("a", "b")`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "import * as os from "os"
        let x = os.path.join("a", "b");"
      `)
    })

    it("should convert from import followed by code", () => {
      const python = `from pathlib import Path
result = Path("/home")`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "import { Path } from "pathlib"
        let result = Path("/home");"
      `)
    })

    it("should convert multiple imports", () => {
      const python = `import os
from sys import argv
from pathlib import Path`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "import * as os from "os"
        import { argv } from "sys"
        import { Path } from "pathlib""
      `)
    })
  })

  describe("Real-world Examples", () => {
    it("should convert typical Python script header", () => {
      const python = `import os
import sys
from typing import List, Optional
from dataclasses import dataclass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "import * as os from "os"
        import * as sys from "sys"
        import { dataclass } from "dataclasses""
      `)
    })

    it("should convert function using imported module", () => {
      const python = `from pathlib import Path, PurePath

def get_path(data):
    return Path(data)`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "import { Path, PurePath } from "pathlib"
        function get_path(data) {
          return Path(data);
        }"
      `)
    })
  })
})

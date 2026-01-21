import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"

describe("E2E: Imports", () => {
  describe("Simple Imports", () => {
    it("should convert simple import", () => {
      const python = `import sys`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"import * as sys from "sys""`
      )
    })

    it("should convert import with alias", () => {
      const python = `import numpy as np`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"import * as np from "numpy""`
      )
    })

    it("should convert import with longer module name", () => {
      const python = `import pathlib`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"import * as pathlib from "pathlib""`
      )
    })
  })

  describe("From Imports", () => {
    it("should convert from import single", () => {
      const python = `from pathlib import Path`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"import { Path } from "pathlib""`
      )
    })

    it("should convert from import multiple", () => {
      const python = `from pathlib import Path, PurePath, PosixPath`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"import { Path, PurePath, PosixPath } from "pathlib""`
      )
    })

    it("should convert from import with alias", () => {
      const python = `from pathlib import Path as P`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"import { Path as P } from "pathlib""`
      )
    })

    it("should convert from import with multiple aliases", () => {
      const python = `from typing import List as L, Dict as D`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`""`)
    })

    it("should convert from import star", () => {
      const python = `from pathlib import *`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"import * as pathlib from "pathlib""`
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
      const python = `import sys
x = sys.path[0]`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "import * as sys from "sys"
        let x = sys.path[0];"
      `)
    })

    it("should convert from import followed by code", () => {
      const python = `from pathlib import Path
result = Path("/home")`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "import { Path } from "pathlib"
        let result = new Path("/home");"
      `)
    })

    it("should convert multiple imports", () => {
      const python = `import sys
from argparse import ArgumentParser
from pathlib import Path`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "import * as sys from "sys"
        import { ArgumentParser } from "argparse"
        import { Path } from "pathlib""
      `)
    })
  })

  describe("Real-world Examples", () => {
    it("should convert typical Python script header", () => {
      const python = `import sys
import argparse
from typing import List, Optional
from dataclasses import dataclass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "import * as sys from "sys"
        import * as argparse from "argparse"
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
          return new Path(data);
        }"
      `)
    })
  })
})

import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"

describe("E2E: async module transformations", () => {
  describe("shutil module", () => {
    it("should add await to shutil.copy", () => {
      const result = transpile("shutil.copy('src', 'dst')")
      expect(result).toContain("await copy(")
    })

    it("should add await to shutil.copytree", () => {
      const result = transpile("shutil.copytree('src', 'dst')")
      expect(result).toContain("await copytree(")
    })

    it("should add await to shutil.move", () => {
      const result = transpile("shutil.move('src', 'dst')")
      expect(result).toContain("await move(")
    })

    it("should add await to shutil.rmtree", () => {
      const result = transpile("shutil.rmtree('/tmp/test')")
      expect(result).toContain("await rmtree(")
    })

    it("should add await to shutil.which", () => {
      const result = transpile("x = shutil.which('python')")
      expect(result).toContain("await which(")
    })

    it("should not add await to sync shutil.get_terminal_size", () => {
      const result = transpile("x = shutil.get_terminal_size()")
      expect(result).not.toContain("await")
    })
  })

  describe("glob module", () => {
    it("should add await to glob.glob", () => {
      const result = transpile("x = glob.glob('*.txt')")
      expect(result).toContain("await glob(")
    })

    it("should add await to glob.iglob", () => {
      const result = transpile("x = glob.iglob('*.py')")
      expect(result).toContain("await iglob(")
    })

    it("should add await to glob.rglob (via direct import)", () => {
      const result = transpile("from glob import rglob\nx = rglob('*.md')")
      expect(result).toContain("await rglob(")
    })

    it("should not add await to sync glob.escape", () => {
      const result = transpile("x = glob.escape('[test]')")
      expect(result).not.toContain("await")
    })
  })

  describe("tempfile module", () => {
    it("should add await to tempfile.mkstemp", () => {
      const result = transpile("fd, path = tempfile.mkstemp()")
      expect(result).toContain("await mkstemp(")
    })

    it("should add await to tempfile.mkdtemp", () => {
      const result = transpile("path = tempfile.mkdtemp()")
      expect(result).toContain("await mkdtemp(")
    })

    it("should transform NamedTemporaryFile to static create", () => {
      const result = transpile("tmp = tempfile.NamedTemporaryFile()")
      expect(result).toContain("await NamedTemporaryFile.create(")
    })

    it("should transform TemporaryDirectory to static create", () => {
      const result = transpile("tmp = tempfile.TemporaryDirectory()")
      expect(result).toContain("await TemporaryDirectory.create(")
    })

    it("should not add await to sync tempfile.gettempdir", () => {
      const result = transpile("x = tempfile.gettempdir()")
      expect(result).not.toContain("await")
    })
  })

  describe("pathlib module", () => {
    it("should transform Path constructor", () => {
      const result = transpile("p = pathlib.Path('/tmp')")
      expect(result).toContain("new Path(")
    })

    it("should add await to Path.read_text method", () => {
      const result = transpile("content = p.read_text()")
      expect(result).toContain("await p.readText(")
    })

    it("should add await to Path.write_text method", () => {
      const result = transpile("p.write_text('hello')")
      expect(result).toContain("await p.writeText(")
    })

    it("should add await to Path.is_file method", () => {
      const result = transpile("x = p.is_file()")
      expect(result).toContain("await p.isFile(")
    })

    it("should add await to Path.is_dir method", () => {
      const result = transpile("x = p.is_dir()")
      expect(result).toContain("await p.isDir(")
    })

    it("should add await to Path.iterdir method", () => {
      const result = transpile("entries = p.iterdir()")
      expect(result).toContain("await p.iterdir(")
    })
  })
})

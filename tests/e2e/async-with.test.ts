import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"

describe("E2E: Async/Await", () => {
  describe("Async Functions", () => {
    it("should convert async function definition", () => {
      const python = `async def fetch_data():
    return 42`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "async function fetch_data() {
          return 42;
        }"
      `)
    })

    it("should convert async function with parameters", () => {
      const python = `async def fetch_user(user_id):
    return user_id`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "async function fetch_user(user_id) {
          return user_id;
        }"
      `)
    })

    it("should convert async function with await", () => {
      const python = `async def fetch_data():
    result = await get_data()
    return result`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "async function fetch_data() {
          let result = await get_data();
          return result;
        }"
      `)
    })

    it("should convert multiple awaits", () => {
      const python = `async def process():
    a = await fetch_a()
    b = await fetch_b()
    return a + b`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "async function process() {
          let a = await fetch_a();
          let b = await fetch_b();
          return (a + b);
        }"
      `)
    })
  })

  describe("Await Expressions", () => {
    it("should convert simple await", () => {
      const python = `result = await fetch_data()`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"let result = await fetch_data();"`
      )
    })

    it("should convert await with method call", () => {
      const python = `data = await response.json()`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"let data = await response.json();"`
      )
    })

    it("should convert nested await", () => {
      const python = `result = await process(await fetch_data())`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"let result = await process(await fetch_data());"`
      )
    })
  })
})

describe("E2E: With Statement", () => {
  describe("Simple With", () => {
    it("should convert with statement", () => {
      const python = `with open('file.txt') as f:
    content = f.read()`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "const f = open('file.txt');
        try {
          let content = f.read();
        } finally {
          f[Symbol.dispose]?.() ?? f.close?.();
        }"
      `)
    })

    it("should convert with statement without as", () => {
      const python = `with lock():
    do_work()`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "const _resource = lock();
        try {
          do_work();
        } finally {
          _resource[Symbol.dispose]?.() ?? _resource.close?.();
        }"
      `)
    })

    it("should convert with multiple statements in body", () => {
      const python = `with open('file.txt') as f:
    content = f.read()
    data = process(content)
    print(data)`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "const f = open('file.txt');
        try {
          let content = f.read();
          let data = process(content);
          console.log(data);
        } finally {
          f[Symbol.dispose]?.() ?? f.close?.();
        }"
      `)
    })
  })

  describe("Multiple Context Managers", () => {
    it("should convert with multiple context managers", () => {
      const python = `with open('a.txt') as a, open('b.txt') as b:
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "const a = open('a.txt');
        try {
          const b = open('b.txt');
          try {

          } finally {
            b[Symbol.dispose]?.() ?? b.close?.();
          }
        } finally {
          a[Symbol.dispose]?.() ?? a.close?.();
        }"
      `)
    })
  })

  describe("Async With", () => {
    it("should convert async with statement", () => {
      const python = `async with session.get(url) as response:
    data = await response.json()`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "const response = py.dict.get(session, url);
        try {
          let data = await response.json();
        } finally {
          await (response[Symbol.asyncDispose]?.() ?? response[Symbol.dispose]?.() ?? response.close?.());
        }"
      `)
    })
  })

  describe("Real-world Examples", () => {
    it("should convert file reading pattern", () => {
      const python = `async def read_file(path):
    with open(path) as f:
        return f.read()`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "async function read_file(path) {
            const f = open(path);
          try {
            return f.read();
          } finally {
            f[Symbol.dispose]?.() ?? f.close?.();
          }
        }"
      `)
    })

    it("should convert HTTP request pattern", () => {
      const python = `async def fetch_json(url):
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.json()`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "async function fetch_json(url) {
            const session = aiohttp.ClientSession();
          try {
                const response = py.dict.get(session, url);
            try {
              return await response.json();
            } finally {
              await (response[Symbol.asyncDispose]?.() ?? response[Symbol.dispose]?.() ?? response.close?.());
            }
          } finally {
            await (session[Symbol.asyncDispose]?.() ?? session[Symbol.dispose]?.() ?? session.close?.());
          }
        }"
      `)
    })
  })
})

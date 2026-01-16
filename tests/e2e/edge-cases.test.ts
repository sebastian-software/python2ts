import { describe, it, expect } from 'vitest';
import { transpile } from '../../src/generator/index.js';
import { py } from '../../src/runtime/index.js';

describe('E2E: Edge Cases', () => {
  describe('Empty and minimal code', () => {
    it('should handle empty string', () => {
      const ts = transpile('', { includeRuntime: false });
      expect(ts).toBe('');
    });

    it('should handle single variable', () => {
      const ts = transpile('x', { includeRuntime: false });
      expect(ts).toBe('x;');
    });
  });

  describe('Complex assignments', () => {
    it('should handle multiple assignments', () => {
      const python = `x = 1
y = 2
z = 3`;
      const ts = transpile(python, { includeRuntime: false });
      expect(ts).toContain('let x = 1');
      expect(ts).toContain('let y = 2');
      expect(ts).toContain('let z = 3');
    });
  });

  describe('Nested functions and control flow', () => {
    it('should handle function with if inside loop', () => {
      const python = `def process(items):
    for item in items:
        if item > 0:
            print(item)`;
      const ts = transpile(python, { includeRuntime: false });
      expect(ts).toContain('function process(items)');
      expect(ts).toContain('for (const item of items)');
      expect(ts).toContain('if ((item > 0))');
    });

    it('should handle nested loops', () => {
      const python = `for i in rows:
    for j in cols:
        for k in depths:
            print(i, j, k)`;
      const ts = transpile(python, { includeRuntime: false });
      expect(ts).toContain('for (const i of rows)');
      expect(ts).toContain('for (const j of cols)');
      expect(ts).toContain('for (const k of depths)');
    });
  });

  describe('Complex expressions', () => {
    it('should handle deeply nested parentheses', () => {
      const python = 'x = ((((1 + 2))))';
      const ts = transpile(python, { includeRuntime: false });
      expect(ts).toContain('1 + 2');
    });

    it('should handle mixed operators', () => {
      const python = 'x = a + b - c * d / e';
      const ts = transpile(python, { includeRuntime: false });
      expect(ts).toContain('+');
      expect(ts).toContain('-');
      expect(ts).toContain('*');
      expect(ts).toContain('/');
    });
  });

  describe('Dict edge cases', () => {
    it('should handle dict with multiple entries', () => {
      const python = '{"a": 1, "b": 2, "c": 3}';
      const ts = transpile(python, { includeRuntime: false });
      expect(ts).toContain('"a": 1');
      expect(ts).toContain('"b": 2');
      expect(ts).toContain('"c": 3');
    });

    it('should handle dict with number keys', () => {
      const python = '{1: "a", 2: "b"}';
      const ts = transpile(python, { includeRuntime: false });
      expect(ts).toContain('1: "a"');
      expect(ts).toContain('2: "b"');
    });
  });

  describe('List edge cases', () => {
    it('should handle deeply nested lists', () => {
      const python = '[[[1, 2], [3, 4]], [[5, 6], [7, 8]]]';
      const ts = transpile(python, { includeRuntime: false });
      expect(ts).toContain('[[[1, 2], [3, 4]], [[5, 6], [7, 8]]]');
    });

    it('should handle list with mixed types', () => {
      const python = '[1, "two", True, None]';
      const ts = transpile(python, { includeRuntime: false });
      expect(ts).toContain('1');
      expect(ts).toContain('"two"');
      expect(ts).toContain('true');
      expect(ts).toContain('null');
    });
  });

  describe('Comment handling', () => {
    it('should convert inline comments', () => {
      const python = `x = 1  # set x to 1
y = 2  # set y to 2`;
      const ts = transpile(python, { includeRuntime: false });
      expect(ts).toContain('//');
    });

    it('should handle comment-only lines', () => {
      const python = `# this is a comment
x = 1`;
      const ts = transpile(python, { includeRuntime: false });
      expect(ts).toContain('// this is a comment');
    });
  });

  describe('Slice edge cases', () => {
    it('should handle slice with all parameters', () => {
      const python = 'x = arr[1:10:2]';
      const ts = transpile(python);
      expect(ts).toContain('py.slice');
      expect(ts).toContain('1');
      expect(ts).toContain('10');
      expect(ts).toContain('2');
    });

    it('should handle slice with only start', () => {
      const python = 'x = arr[5:]';
      const ts = transpile(python);
      expect(ts).toContain('py.slice');
      expect(ts).toContain('5');
    });

    it('should handle slice with only stop', () => {
      const python = 'x = arr[:5]';
      const ts = transpile(python);
      expect(ts).toContain('py.slice');
      expect(ts).toContain('5');
    });

    it('should handle reverse slice', () => {
      const python = 'x = arr[::-1]';
      const ts = transpile(python);
      expect(ts).toContain('py.slice');
      expect(ts).toContain('-1');
    });
  });

  describe('Runtime: sorted with string keys', () => {
    it('should sort strings alphabetically', () => {
      const result = py.sorted(['banana', 'apple', 'cherry']);
      expect(result).toEqual(['apple', 'banana', 'cherry']);
    });

    it('should sort with key and reverse', () => {
      const items = [{ name: 'z' }, { name: 'a' }, { name: 'm' }];
      const sorted = py.sorted(items, { key: (x) => x.name, reverse: true });
      expect(sorted.map((x) => x.name)).toEqual(['z', 'm', 'a']);
    });
  });

  describe('Runtime: enumerate with generators', () => {
    it('should enumerate a generator', () => {
      const gen = function* () {
        yield 'a';
        yield 'b';
        yield 'c';
      };
      const result = [...py.enumerate(gen())];
      expect(result).toEqual([
        [0, 'a'],
        [1, 'b'],
        [2, 'c'],
      ]);
    });
  });

  describe('Runtime: in operator edge cases', () => {
    it('should check membership in iterable', () => {
      const gen = function* () {
        yield 1;
        yield 2;
        yield 3;
      };
      expect(py.in(2, gen())).toBe(true);
    });
  });

  describe('Runtime: bool edge cases', () => {
    it('should handle Maps correctly', () => {
      expect(py.bool(new Map())).toBe(false);
      expect(py.bool(new Map([['a', 1]]))).toBe(true);
    });

    it('should handle Sets correctly', () => {
      expect(py.bool(new Set())).toBe(false);
      expect(py.bool(new Set([1]))).toBe(true);
    });

    it('should handle objects', () => {
      expect(py.bool({})).toBe(true);
      expect(py.bool({ a: 1 })).toBe(true);
    });
  });

  describe('Conditional expressions', () => {
    it('should handle simple conditional', () => {
      const python = 'y = 1 if x else 0';
      const ts = transpile(python, { includeRuntime: false });
      expect(ts).toContain('?');
      expect(ts).toContain(':');
    });
  });

  describe('String variations', () => {
    it('should handle single-quoted triple string', () => {
      const python = "'''multi\nline'''";
      const ts = transpile(python, { includeRuntime: false });
      expect(ts).toContain('`');
    });

    it('should handle double-quoted triple string', () => {
      const python = '"""another\nmulti\nline"""';
      const ts = transpile(python, { includeRuntime: false });
      expect(ts).toContain('`');
    });
  });
});

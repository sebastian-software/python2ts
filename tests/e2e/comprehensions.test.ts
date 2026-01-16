import { describe, it, expect } from 'vitest';
import { transpile } from '../../src/generator/index.js';

describe('E2E: Comprehensions', () => {
  describe('List Comprehensions', () => {
    it('should transform simple list comprehension', () => {
      const python = '[x * 2 for x in items]';
      const ts = transpile(python, { includeRuntime: false });
      expect(ts).toBe('items.map((x) => (x * 2));');
    });

    it('should transform list comprehension with variable expression', () => {
      const python = '[x for x in items]';
      const ts = transpile(python, { includeRuntime: false });
      expect(ts).toBe('items.map((x) => x);');
    });

    it('should transform list comprehension with condition', () => {
      const python = '[x for x in items if x > 0]';
      const ts = transpile(python, { includeRuntime: false });
      expect(ts).toContain('.filter((x) => (x > 0))');
      expect(ts).toContain('.map((x) => x)');
    });

    it('should transform list comprehension with multiple conditions', () => {
      const python = '[x for x in items if x > 0 if x < 10]';
      const ts = transpile(python, { includeRuntime: false });
      expect(ts).toContain('.filter');
      expect(ts).toContain('.map');
    });

    it('should transform nested list comprehension (two for clauses)', () => {
      const python = '[x + y for x in a for y in b]';
      const ts = transpile(python, { includeRuntime: false });
      expect(ts).toContain('.flatMap');
      expect(ts).toContain('.map');
    });

    it('should transform list comprehension with function call', () => {
      const python = '[len(x) for x in items]';
      const ts = transpile(python);
      expect(ts).toContain('py.len(x)');
      expect(ts).toContain('.map');
    });

    it('should transform list comprehension with range', () => {
      const python = '[x ** 2 for x in range(10)]';
      const ts = transpile(python);
      expect(ts).toContain('py.range(10)');
      expect(ts).toContain('.map');
      expect(ts).toContain('py.pow(x, 2)');
    });

    it('should transform list comprehension assigned to variable', () => {
      const python = 'squares = [x * x for x in numbers]';
      const ts = transpile(python, { includeRuntime: false });
      expect(ts).toContain('let squares = numbers.map((x) => (x * x))');
    });

    it('should transform list comprehension with complex expression', () => {
      const python = '[x + 1 for x in items if x % 2 == 0]';
      const ts = transpile(python);
      expect(ts).toContain('.filter');
      expect(ts).toContain('.map');
    });
  });

  describe('Dict Comprehensions', () => {
    it('should transform simple dict comprehension', () => {
      const python = '{x: x * 2 for x in items}';
      const ts = transpile(python);
      expect(ts).toContain('py.dict(');
      expect(ts).toContain('.map((x) => [x, (x * 2)])');
    });

    it('should transform dict comprehension with condition', () => {
      const python = '{x: x ** 2 for x in items if x > 0}';
      const ts = transpile(python);
      expect(ts).toContain('py.dict(');
      expect(ts).toContain('.filter((x) => (x > 0))');
      expect(ts).toContain('.map');
    });

    it('should transform dict comprehension with range', () => {
      const python = '{i: i * i for i in range(5)}';
      const ts = transpile(python);
      expect(ts).toContain('py.dict(');
      expect(ts).toContain('py.range(5)');
    });
  });

  describe('Set Comprehensions', () => {
    it('should transform simple set comprehension', () => {
      const python = '{x * 2 for x in items}';
      const ts = transpile(python);
      expect(ts).toContain('py.set(');
      expect(ts).toContain('.map((x) => (x * 2))');
    });

    it('should transform set comprehension with condition', () => {
      const python = '{x for x in items if x > 0}';
      const ts = transpile(python);
      expect(ts).toContain('py.set(');
      expect(ts).toContain('.filter((x) => (x > 0))');
    });

    it('should transform set comprehension with function', () => {
      const python = '{len(s) for s in strings}';
      const ts = transpile(python);
      expect(ts).toContain('py.set(');
      expect(ts).toContain('py.len(s)');
    });
  });

  describe('Set Expressions', () => {
    it('should transform set literal', () => {
      const python = '{1, 2, 3}';
      const ts = transpile(python);
      expect(ts).toContain('py.set([1, 2, 3])');
    });

    it('should transform empty set constructor', () => {
      const python = 's = set()';
      const ts = transpile(python);
      expect(ts).toContain('py.set()');
    });
  });

  describe('Comprehension Edge Cases', () => {
    it('should handle comprehension with method call on item', () => {
      const python = '[s.strip() for s in strings]';
      const ts = transpile(python, { includeRuntime: false });
      expect(ts).toContain('.map');
      expect(ts).toContain('s.strip()');
    });

    it('should handle comprehension with nested function calls', () => {
      const python = '[str(int(x)) for x in items]';
      const ts = transpile(python);
      expect(ts).toContain('py.str(py.int(x))');
    });

    it('should handle comprehension with arithmetic in condition', () => {
      const python = '[x for x in items if x + 1 > 5]';
      const ts = transpile(python, { includeRuntime: false });
      expect(ts).toContain('.filter');
      expect(ts).toContain('(x + 1) > 5');
    });
  });

  describe('Real-world Examples', () => {
    it('should transform filtering even numbers', () => {
      const python = 'evens = [x for x in numbers if x % 2 == 0]';
      const ts = transpile(python);
      expect(ts).toContain('.filter');
      expect(ts).toContain('py.mod(x, 2)');
    });

    it('should transform mapping with transformation', () => {
      const python = 'upper_words = [word.upper() for word in words]';
      const ts = transpile(python, { includeRuntime: false });
      expect(ts).toContain('.map');
      expect(ts).toContain('word.upper()');
    });

    it('should transform flattening nested lists', () => {
      const python = 'flat = [item for sublist in nested for item in sublist]';
      const ts = transpile(python, { includeRuntime: false });
      expect(ts).toContain('.flatMap');
    });

    it('should transform creating pairs', () => {
      const python = 'pairs = [(x, y) for x in a for y in b]';
      const ts = transpile(python);
      expect(ts).toContain('.flatMap');
      expect(ts).toContain('py.tuple');
    });
  });
});

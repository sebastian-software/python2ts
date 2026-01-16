import { describe, it, expect } from 'vitest';
import { transpile } from '../../src/generator/index.js';
import { py } from '../../src/runtime/index.js';

describe('E2E: Operators', () => {
  describe('Arithmetic Operators', () => {
    it('should convert addition', () => {
      const ts = transpile('x = 1 + 2', { includeRuntime: false });
      expect(ts).toBe('let x = (1 + 2);');
    });

    it('should convert subtraction', () => {
      const ts = transpile('x = 5 - 3', { includeRuntime: false });
      expect(ts).toBe('let x = (5 - 3);');
    });

    it('should convert multiplication', () => {
      const ts = transpile('x = 4 * 2', { includeRuntime: false });
      expect(ts).toBe('let x = (4 * 2);');
    });

    it('should convert division', () => {
      const ts = transpile('x = 10 / 2', { includeRuntime: false });
      expect(ts).toBe('let x = (10 / 2);');
    });

    it('should convert floor division with py.floordiv', () => {
      const ts = transpile('x = 10 // 3');
      expect(ts).toContain('py.floordiv(10, 3)');
    });

    it('should convert power with py.pow', () => {
      const ts = transpile('x = 2 ** 8');
      expect(ts).toContain('py.pow(2, 8)');
    });

    it('should convert modulo with py.mod', () => {
      const ts = transpile('x = 7 % 3');
      expect(ts).toContain('py.mod(7, 3)');
    });

    it('should handle nested arithmetic', () => {
      const ts = transpile('x = (1 + 2) * 3', { includeRuntime: false });
      expect(ts).toContain('(1 + 2)');
      expect(ts).toContain('* 3');
    });
  });

  describe('Comparison Operators', () => {
    it('should convert equality', () => {
      const ts = transpile('x == y', { includeRuntime: false });
      expect(ts).toBe('(x == y);');
    });

    it('should convert inequality', () => {
      const ts = transpile('x != y', { includeRuntime: false });
      expect(ts).toBe('(x != y);');
    });

    it('should convert less than', () => {
      const ts = transpile('x < y', { includeRuntime: false });
      expect(ts).toBe('(x < y);');
    });

    it('should convert greater than', () => {
      const ts = transpile('x > y', { includeRuntime: false });
      expect(ts).toBe('(x > y);');
    });

    it('should convert less than or equal', () => {
      const ts = transpile('x <= y', { includeRuntime: false });
      expect(ts).toBe('(x <= y);');
    });

    it('should convert greater than or equal', () => {
      const ts = transpile('x >= y', { includeRuntime: false });
      expect(ts).toBe('(x >= y);');
    });
  });

  describe('Logical Operators', () => {
    it('should convert and to &&', () => {
      const ts = transpile('x and y', { includeRuntime: false });
      expect(ts).toBe('(x && y);');
    });

    it('should convert or to ||', () => {
      const ts = transpile('x or y', { includeRuntime: false });
      expect(ts).toBe('(x || y);');
    });

    it('should convert not to !', () => {
      const ts = transpile('not x', { includeRuntime: false });
      expect(ts).toBe('(!x);');
    });

    it('should handle compound logical expressions', () => {
      const ts = transpile('x and y or z', { includeRuntime: false });
      expect(ts).toContain('&&');
      expect(ts).toContain('||');
    });
  });

  describe('Unary Operators', () => {
    it('should convert negative', () => {
      const ts = transpile('-x', { includeRuntime: false });
      expect(ts).toBe('(-x);');
    });

    it('should convert positive', () => {
      const ts = transpile('+x', { includeRuntime: false });
      expect(ts).toBe('(+x);');
    });

    it('should convert not', () => {
      const ts = transpile('not True', { includeRuntime: false });
      expect(ts).toBe('(!true);');
    });
  });

  describe('Membership Operators', () => {
    it('should convert in with py.in', () => {
      const ts = transpile('x in items');
      expect(ts).toContain('py.in(x, items)');
    });
  });

  describe('Runtime Verification', () => {
    describe('Floor Division (Python semantics)', () => {
      it('positive // positive', () => {
        expect(py.floordiv(10, 3)).toBe(3);
        expect(py.floordiv(9, 3)).toBe(3);
      });

      it('negative // positive', () => {
        expect(py.floordiv(-10, 3)).toBe(-4);
        expect(py.floordiv(-9, 3)).toBe(-3);
      });

      it('positive // negative', () => {
        expect(py.floordiv(10, -3)).toBe(-4);
      });

      it('negative // negative', () => {
        expect(py.floordiv(-10, -3)).toBe(3);
      });
    });

    describe('Modulo (Python semantics)', () => {
      it('positive % positive', () => {
        expect(py.mod(7, 3)).toBe(1);
        expect(py.mod(9, 3)).toBe(0);
      });

      it('negative % positive (result has sign of divisor)', () => {
        expect(py.mod(-7, 3)).toBe(2);
        expect(py.mod(-1, 3)).toBe(2);
      });

      it('positive % negative', () => {
        expect(py.mod(7, -3)).toBe(-2);
      });

      it('negative % negative', () => {
        expect(py.mod(-7, -3)).toBe(-1);
      });
    });

    describe('Power', () => {
      it('integer powers', () => {
        expect(py.pow(2, 0)).toBe(1);
        expect(py.pow(2, 1)).toBe(2);
        expect(py.pow(2, 8)).toBe(256);
        expect(py.pow(3, 3)).toBe(27);
      });

      it('negative exponents', () => {
        expect(py.pow(2, -1)).toBe(0.5);
        expect(py.pow(4, -1)).toBe(0.25);
      });
    });

    describe('Membership (in)', () => {
      it('array membership', () => {
        expect(py.in(2, [1, 2, 3])).toBe(true);
        expect(py.in(5, [1, 2, 3])).toBe(false);
      });

      it('string membership', () => {
        expect(py.in('el', 'hello')).toBe(true);
        expect(py.in('xyz', 'hello')).toBe(false);
      });

      it('set membership', () => {
        const s = new Set([1, 2, 3]);
        expect(py.in(2, s)).toBe(true);
        expect(py.in(5, s)).toBe(false);
      });

      it('map key membership', () => {
        const m = new Map([['a', 1], ['b', 2]]);
        expect(py.in('a', m)).toBe(true);
        expect(py.in('c', m)).toBe(false);
      });
    });
  });
});

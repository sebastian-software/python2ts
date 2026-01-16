import { describe, it, expect } from 'vitest';
import { parse, getNodeText, getChildren, getChildByType, getChildrenByType, walkTree, debugTree } from '../src/parser/index.js';

describe('Parser', () => {
  describe('parse()', () => {
    it('should parse simple assignment', () => {
      const result = parse('x = 42');
      expect(result.tree).toBeDefined();
      expect(result.source).toBe('x = 42');
    });

    it('should parse multiple statements', () => {
      const result = parse('x = 1\ny = 2');
      const children = getChildren(result.tree.topNode);
      expect(children.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getNodeText()', () => {
    it('should extract text from node', () => {
      const result = parse('x = 42');
      const topNode = result.tree.topNode;
      expect(getNodeText(topNode, result.source)).toBe('x = 42');
    });
  });

  describe('getChildren()', () => {
    it('should return children of a node', () => {
      const result = parse('x = 1 + 2');
      const children = getChildren(result.tree.topNode);
      expect(children.length).toBeGreaterThan(0);
    });
  });

  describe('getChildByType()', () => {
    it('should find child by type', () => {
      const result = parse('x = 1 + 2');
      const assignStmt = getChildByType(result.tree.topNode, 'AssignStatement');
      expect(assignStmt).not.toBeNull();
      expect(assignStmt?.name).toBe('AssignStatement');
    });

    it('should return null if type not found', () => {
      const result = parse('x = 1');
      const forStmt = getChildByType(result.tree.topNode, 'ForStatement');
      expect(forStmt).toBeNull();
    });
  });

  describe('getChildrenByType()', () => {
    it('should find all children by type', () => {
      const result = parse('x = 1\ny = 2\nz = 3');
      const assignStmts = getChildrenByType(result.tree.topNode, 'AssignStatement');
      expect(assignStmts.length).toBe(3);
    });

    it('should return empty array if type not found', () => {
      const result = parse('x = 1');
      const forStmts = getChildrenByType(result.tree.topNode, 'ForStatement');
      expect(forStmts).toEqual([]);
    });
  });

  describe('walkTree()', () => {
    it('should visit all nodes', () => {
      const result = parse('x = 1');
      const nodeNames: string[] = [];
      walkTree(result.tree, (node) => {
        nodeNames.push(node.name);
      });
      expect(nodeNames).toContain('Script');
      expect(nodeNames).toContain('AssignStatement');
      expect(nodeNames).toContain('Number');
    });
  });

  describe('debugTree()', () => {
    it('should produce readable debug output', () => {
      const result = parse('x = 42');
      const debug = debugTree(result.tree, result.source);
      expect(debug).toContain('Script');
      expect(debug).toContain('42');
    });
  });

  describe('Python syntax parsing', () => {
    it('should parse numbers', () => {
      const result = parse('42');
      const debug = debugTree(result.tree, result.source);
      expect(debug).toContain('Number');
    });

    it('should parse strings', () => {
      const result = parse('"hello"');
      const debug = debugTree(result.tree, result.source);
      expect(debug).toContain('String');
    });

    it('should parse boolean True', () => {
      const result = parse('True');
      const debug = debugTree(result.tree, result.source);
      expect(debug).toContain('True');
    });

    it('should parse boolean False', () => {
      const result = parse('False');
      const debug = debugTree(result.tree, result.source);
      expect(debug).toContain('False');
    });

    it('should parse None', () => {
      const result = parse('None');
      const debug = debugTree(result.tree, result.source);
      expect(debug).toContain('None');
    });

    it('should parse binary expressions', () => {
      const result = parse('1 + 2');
      const debug = debugTree(result.tree, result.source);
      expect(debug).toContain('BinaryExpression');
    });

    it('should parse function calls', () => {
      const result = parse('print("hello")');
      const debug = debugTree(result.tree, result.source);
      expect(debug).toContain('CallExpression');
    });

    it('should parse if statements', () => {
      const result = parse('if x:\n    y = 1');
      const debug = debugTree(result.tree, result.source);
      expect(debug).toContain('IfStatement');
    });

    it('should parse for loops', () => {
      const result = parse('for i in range(10):\n    print(i)');
      const debug = debugTree(result.tree, result.source);
      expect(debug).toContain('ForStatement');
    });

    it('should parse function definitions', () => {
      const result = parse('def foo(x):\n    return x');
      const debug = debugTree(result.tree, result.source);
      expect(debug).toContain('FunctionDefinition');
    });

    it('should parse lists', () => {
      const result = parse('[1, 2, 3]');
      const debug = debugTree(result.tree, result.source);
      expect(debug).toContain('ArrayExpression');
    });

    it('should parse dictionaries', () => {
      const result = parse('{"a": 1, "b": 2}');
      const debug = debugTree(result.tree, result.source);
      expect(debug).toContain('DictionaryExpression');
    });

    it('should parse comments', () => {
      const result = parse('# this is a comment\nx = 1');
      const debug = debugTree(result.tree, result.source);
      expect(debug).toContain('Comment');
    });
  });
});

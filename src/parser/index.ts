import { parser } from '@lezer/python';
import type { SyntaxNode, Tree } from '@lezer/common';
import type { ParseResult } from './types.js';

export function parse(source: string): ParseResult {
  const tree = parser.parse(source);
  return { tree, source };
}

export function getNodeText(node: SyntaxNode, source: string): string {
  return source.slice(node.from, node.to);
}

export function getChildren(node: SyntaxNode): SyntaxNode[] {
  const children: SyntaxNode[] = [];
  let child = node.firstChild;
  while (child) {
    children.push(child);
    child = child.nextSibling;
  }
  return children;
}

export function getChildByType(node: SyntaxNode, type: string): SyntaxNode | null {
  let child = node.firstChild;
  while (child) {
    if (child.name === type) {
      return child;
    }
    child = child.nextSibling;
  }
  return null;
}

export function getChildrenByType(node: SyntaxNode, type: string): SyntaxNode[] {
  const children: SyntaxNode[] = [];
  let child = node.firstChild;
  while (child) {
    if (child.name === type) {
      children.push(child);
    }
    child = child.nextSibling;
  }
  return children;
}

export function walkTree(tree: Tree, callback: (node: SyntaxNode) => void): void {
  const cursor = tree.cursor();
  do {
    callback(cursor.node);
  } while (cursor.next());
}

export function debugTree(tree: Tree, source: string): string {
  const lines: string[] = [];
  const cursor = tree.cursor();
  let depth = 0;

  do {
    const indent = '  '.repeat(depth);
    const text = source.slice(cursor.from, cursor.to).replace(/\n/g, '\\n');
    const preview = text.length > 30 ? text.slice(0, 30) + '...' : text;
    lines.push(`${indent}${cursor.name} [${cursor.from}-${cursor.to}] "${preview}"`);

    if (cursor.firstChild()) {
      depth++;
    } else {
      while (!cursor.nextSibling()) {
        if (!cursor.parent()) break;
        depth--;
      }
    }
  } while (depth > 0 || cursor.nextSibling());

  return lines.join('\n');
}

export * from './types.js';

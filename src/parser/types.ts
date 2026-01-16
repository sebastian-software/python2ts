import type { SyntaxNode, Tree } from '@lezer/common';

export interface ParseResult {
  tree: Tree;
  source: string;
}

export interface NodeVisitor<T> {
  visitNode(node: SyntaxNode, source: string): T;
}

export const NodeTypes = {
  // Top level
  Script: 'Script',

  // Statements
  ExpressionStatement: 'ExpressionStatement',
  AssignStatement: 'AssignStatement',
  AugmentedAssignStatement: 'AugmentedAssignStatement',
  PrintStatement: 'PrintStatement',
  PassStatement: 'PassStatement',
  BreakStatement: 'BreakStatement',
  ContinueStatement: 'ContinueStatement',
  ReturnStatement: 'ReturnStatement',
  IfStatement: 'IfStatement',
  WhileStatement: 'WhileStatement',
  ForStatement: 'ForStatement',
  FunctionDefinition: 'FunctionDefinition',
  ClassDefinition: 'ClassDefinition',
  TryStatement: 'TryStatement',
  RaiseStatement: 'RaiseStatement',
  ImportStatement: 'ImportStatement',
  FromImportStatement: 'FromImportStatement',

  // Expressions
  BinaryExpression: 'BinaryExpression',
  UnaryExpression: 'UnaryExpression',
  CompareOp: 'CompareOp',
  ParenthesizedExpression: 'ParenthesizedExpression',
  ConditionalExpression: 'ConditionalExpression',
  CallExpression: 'CallExpression',
  MemberExpression: 'MemberExpression',
  SubscriptExpression: 'SubscriptExpression',
  Slice: 'Slice',

  // Literals
  Number: 'Number',
  String: 'String',
  FormatString: 'FormatString',
  True: 'True',
  False: 'False',
  None: 'None',
  VariableName: 'VariableName',

  // Collections
  ArrayExpression: 'ArrayExpression',
  DictionaryExpression: 'DictionaryExpression',
  SetExpression: 'SetExpression',
  TupleExpression: 'TupleExpression',

  // Comprehensions
  ListComprehension: 'ListComprehension',
  DictionaryComprehension: 'DictionaryComprehension',
  SetComprehension: 'SetComprehension',
  GeneratorExpression: 'GeneratorExpression',

  // Operators
  ArithOp: 'ArithOp',
  CompareOp_: 'CompareOp',
  AssignOp: 'AssignOp',

  // Function related
  ArgList: 'ArgList',
  ParamList: 'ParamList',
  LambdaExpression: 'LambdaExpression',

  // Misc
  Comment: 'Comment',
  Keyword: 'Keyword',
  Body: 'Body',
} as const;

export type NodeType = (typeof NodeTypes)[keyof typeof NodeTypes];

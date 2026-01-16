import type { SyntaxNode } from '@lezer/common';
import { getNodeText, getChildren, parse, type ParseResult } from '../parser/index.js';

export interface TransformContext {
  source: string;
  indentLevel: number;
  usesRuntime: Set<string>;
}

export interface TransformResult {
  code: string;
  usesRuntime: Set<string>;
}

function createContext(source: string): TransformContext {
  return {
    source,
    indentLevel: 0,
    usesRuntime: new Set(),
  };
}

export function transform(input: string | ParseResult): TransformResult {
  const parseResult = typeof input === 'string' ? parse(input) : input;
  const ctx = createContext(parseResult.source);
  const code = transformNode(parseResult.tree.topNode, ctx);

  return {
    code,
    usesRuntime: ctx.usesRuntime,
  };
}

function transformNode(node: SyntaxNode, ctx: TransformContext): string {
  switch (node.name) {
    case 'Script':
      return transformScript(node, ctx);
    case 'ExpressionStatement':
      return transformExpressionStatement(node, ctx);
    case 'AssignStatement':
      return transformAssignStatement(node, ctx);
    case 'BinaryExpression':
      return transformBinaryExpression(node, ctx);
    case 'UnaryExpression':
      return transformUnaryExpression(node, ctx);
    case 'CompareOp':
      return transformCompareOp(node, ctx);
    case 'ParenthesizedExpression':
      return transformParenthesizedExpression(node, ctx);
    case 'ConditionalExpression':
      return transformConditionalExpression(node, ctx);
    case 'Number':
      return transformNumber(node, ctx);
    case 'String':
      return transformString(node, ctx);
    case 'Boolean':
      return transformBoolean(node, ctx);
    case 'True':
      return 'true';
    case 'False':
      return 'false';
    case 'None':
      return 'null';
    case 'VariableName':
      return getNodeText(node, ctx.source);
    case 'CallExpression':
      return transformCallExpression(node, ctx);
    case 'MemberExpression':
      return transformMemberExpression(node, ctx);
    case 'ArrayExpression':
      return transformArrayExpression(node, ctx);
    case 'DictionaryExpression':
      return transformDictionaryExpression(node, ctx);
    case 'TupleExpression':
      return transformTupleExpression(node, ctx);
    case 'SubscriptExpression':
      return transformSubscriptExpression(node, ctx);
    case 'IfStatement':
      return transformIfStatement(node, ctx);
    case 'WhileStatement':
      return transformWhileStatement(node, ctx);
    case 'ForStatement':
      return transformForStatement(node, ctx);
    case 'PassStatement':
      return '/* pass */';
    case 'BreakStatement':
      return 'break';
    case 'ContinueStatement':
      return 'continue';
    case 'ReturnStatement':
      return transformReturnStatement(node, ctx);
    case 'FunctionDefinition':
      return transformFunctionDefinition(node, ctx);
    case 'Comment':
      return transformComment(node, ctx);
    default:
      return getNodeText(node, ctx.source);
  }
}

function transformScript(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node);
  const statements = children
    .filter((child) => child.name !== 'Comment' || getNodeText(child, ctx.source).trim() !== '')
    .map((child) => {
      const transformed = transformNode(child, ctx);
      if (
        child.name === 'ExpressionStatement' ||
        child.name === 'AssignStatement' ||
        child.name === 'PassStatement' ||
        child.name === 'BreakStatement' ||
        child.name === 'ContinueStatement' ||
        child.name === 'ReturnStatement'
      ) {
        return transformed + ';';
      }
      return transformed;
    })
    .filter((s) => s.trim() !== '');

  return statements.join('\n');
}

function transformExpressionStatement(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node);
  if (children.length === 0) return '';
  const firstChild = children[0];
  if (!firstChild) return '';
  return transformNode(firstChild, ctx);
}

function transformAssignStatement(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node);
  if (children.length < 3) return getNodeText(node, ctx.source);

  const target = children[0];
  const value = children[children.length - 1];

  if (!target || !value) return getNodeText(node, ctx.source);

  const targetCode = transformNode(target, ctx);
  const valueCode = transformNode(value, ctx);

  return `let ${targetCode} = ${valueCode}`;
}

function transformBinaryExpression(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node);
  if (children.length < 3) return getNodeText(node, ctx.source);

  const left = children[0];
  const op = children[1];
  const right = children[2];

  if (!left || !op || !right) return getNodeText(node, ctx.source);

  const leftCode = transformNode(left, ctx);
  const rightCode = transformNode(right, ctx);
  const opText = getNodeText(op, ctx.source);

  switch (opText) {
    case '//':
      ctx.usesRuntime.add('floordiv');
      return `py.floordiv(${leftCode}, ${rightCode})`;
    case '**':
      ctx.usesRuntime.add('pow');
      return `py.pow(${leftCode}, ${rightCode})`;
    case '%':
      ctx.usesRuntime.add('mod');
      return `py.mod(${leftCode}, ${rightCode})`;
    case 'and':
      return `(${leftCode} && ${rightCode})`;
    case 'or':
      return `(${leftCode} || ${rightCode})`;
    case 'in':
      ctx.usesRuntime.add('in');
      return `py.in(${leftCode}, ${rightCode})`;
    case 'not in':
      ctx.usesRuntime.add('in');
      return `!py.in(${leftCode}, ${rightCode})`;
    case 'is':
      return `(${leftCode} === ${rightCode})`;
    case 'is not':
      return `(${leftCode} !== ${rightCode})`;
    default:
      return `(${leftCode} ${opText} ${rightCode})`;
  }
}

function transformUnaryExpression(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node);
  if (children.length < 2) return getNodeText(node, ctx.source);

  const op = children[0];
  const operand = children[1];

  if (!op || !operand) return getNodeText(node, ctx.source);

  const opText = getNodeText(op, ctx.source);
  const operandCode = transformNode(operand, ctx);

  switch (opText) {
    case 'not':
      return `(!${operandCode})`;
    default:
      return `(${opText}${operandCode})`;
  }
}

function transformCompareOp(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node);
  if (children.length < 3) return getNodeText(node, ctx.source);

  const parts: string[] = [];
  let prevOperand = children[0];
  if (!prevOperand) return getNodeText(node, ctx.source);

  for (let i = 1; i < children.length; i += 2) {
    const op = children[i];
    const operand = children[i + 1];

    if (!op || !operand) break;

    const prevCode = transformNode(prevOperand, ctx);
    const operandCode = transformNode(operand, ctx);
    const opText = getNodeText(op, ctx.source);

    let comparison: string;
    switch (opText) {
      case 'in':
        ctx.usesRuntime.add('in');
        comparison = `py.in(${prevCode}, ${operandCode})`;
        break;
      case 'not in':
        ctx.usesRuntime.add('in');
        comparison = `!py.in(${prevCode}, ${operandCode})`;
        break;
      case 'is':
        comparison = `(${prevCode} === ${operandCode})`;
        break;
      case 'is not':
        comparison = `(${prevCode} !== ${operandCode})`;
        break;
      default:
        comparison = `(${prevCode} ${opText} ${operandCode})`;
    }

    parts.push(comparison);
    prevOperand = operand;
  }

  if (parts.length === 1) {
    return parts[0] ?? '';
  }

  return `(${parts.join(' && ')})`;
}

function transformParenthesizedExpression(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node);
  const inner = children.find((c) => c.name !== '(' && c.name !== ')');
  if (!inner) return '()';
  return `(${transformNode(inner, ctx)})`;
}

function transformConditionalExpression(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node);
  // Python: value_if_true if condition else value_if_false
  // Format: TrueExpr 'if' Condition 'else' FalseExpr
  const exprs = children.filter(
    (c) => c.name !== 'if' && c.name !== 'else' && c.name !== 'Keyword'
  );

  if (exprs.length >= 3) {
    const trueExpr = exprs[0];
    const condition = exprs[1];
    const falseExpr = exprs[2];

    if (trueExpr && condition && falseExpr) {
      const condCode = transformNode(condition, ctx);
      const trueCode = transformNode(trueExpr, ctx);
      const falseCode = transformNode(falseExpr, ctx);

      return `(${condCode} ? ${trueCode} : ${falseCode})`;
    }
  }

  return getNodeText(node, ctx.source);
}

function transformNumber(node: SyntaxNode, ctx: TransformContext): string {
  const text = getNodeText(node, ctx.source);
  // Handle Python numeric literals
  // Remove underscores (Python allows 1_000_000)
  return text.replace(/_/g, '');
}

function transformString(node: SyntaxNode, ctx: TransformContext): string {
  const text = getNodeText(node, ctx.source);

  // Handle raw strings
  if (text.startsWith('r"') || text.startsWith("r'")) {
    return text.slice(1);
  }
  if (text.startsWith('R"') || text.startsWith("R'")) {
    return text.slice(1);
  }

  // Handle triple-quoted strings
  if (text.startsWith('"""') || text.startsWith("'''")) {
    const content = text.slice(3, -3);
    return '`' + content.replace(/`/g, '\\`') + '`';
  }

  // Regular strings - convert to JS format
  // Python uses same string syntax as JS for basic cases
  return text;
}

function transformBoolean(node: SyntaxNode, ctx: TransformContext): string {
  const text = getNodeText(node, ctx.source);
  return text === 'True' ? 'true' : 'false';
}

function transformCallExpression(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node);
  const callee = children[0];
  const argList = children.find((c) => c.name === 'ArgList');

  if (!callee) return getNodeText(node, ctx.source);

  const calleeName = getNodeText(callee, ctx.source);
  const args = argList ? transformArgList(argList, ctx) : '';

  // Map Python built-ins to JS/runtime equivalents
  switch (calleeName) {
    case 'print':
      return `console.log(${args})`;
    case 'len':
      ctx.usesRuntime.add('len');
      return `py.len(${args})`;
    case 'range':
      ctx.usesRuntime.add('range');
      return `py.range(${args})`;
    case 'int':
      ctx.usesRuntime.add('int');
      return `py.int(${args})`;
    case 'float':
      ctx.usesRuntime.add('float');
      return `py.float(${args})`;
    case 'str':
      ctx.usesRuntime.add('str');
      return `py.str(${args})`;
    case 'bool':
      ctx.usesRuntime.add('bool');
      return `py.bool(${args})`;
    case 'abs':
      ctx.usesRuntime.add('abs');
      return `py.abs(${args})`;
    case 'min':
      ctx.usesRuntime.add('min');
      return `py.min(${args})`;
    case 'max':
      ctx.usesRuntime.add('max');
      return `py.max(${args})`;
    case 'sum':
      ctx.usesRuntime.add('sum');
      return `py.sum(${args})`;
    case 'list':
      ctx.usesRuntime.add('list');
      return `py.list(${args})`;
    case 'dict':
      ctx.usesRuntime.add('dict');
      return `py.dict(${args})`;
    case 'set':
      ctx.usesRuntime.add('set');
      return `py.set(${args})`;
    case 'tuple':
      ctx.usesRuntime.add('tuple');
      return `py.tuple(${args})`;
    case 'enumerate':
      ctx.usesRuntime.add('enumerate');
      return `py.enumerate(${args})`;
    case 'zip':
      ctx.usesRuntime.add('zip');
      return `py.zip(${args})`;
    case 'sorted':
      ctx.usesRuntime.add('sorted');
      return `py.sorted(${args})`;
    case 'reversed':
      ctx.usesRuntime.add('reversed');
      return `py.reversed(${args})`;
    case 'isinstance':
      ctx.usesRuntime.add('isinstance');
      return `py.isinstance(${args})`;
    case 'type':
      ctx.usesRuntime.add('type');
      return `py.type(${args})`;
    case 'input':
      ctx.usesRuntime.add('input');
      return `py.input(${args})`;
    case 'ord':
      ctx.usesRuntime.add('ord');
      return `py.ord(${args})`;
    case 'chr':
      ctx.usesRuntime.add('chr');
      return `py.chr(${args})`;
    default:
      // Regular function call
      return `${transformNode(callee, ctx)}(${args})`;
  }
}

function transformArgList(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node);
  const args = children.filter(
    (c) => c.name !== '(' && c.name !== ')' && c.name !== ',' && c.name !== 'ArgList'
  );

  return args.map((arg) => transformNode(arg, ctx)).join(', ');
}

function transformMemberExpression(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node);
  if (children.length < 2) return getNodeText(node, ctx.source);

  const obj = children[0];
  if (!obj) return getNodeText(node, ctx.source);

  // Check if this is subscript syntax (arr[index]) or dot syntax (obj.attr)
  const hasOpenBracket = children.some((c) => c.name === '[');

  if (hasOpenBracket) {
    // Subscript access: arr[index]
    const objCode = transformNode(obj, ctx);

    // Check for slice syntax
    const text = getNodeText(node, ctx.source);
    if (text.includes(':')) {
      return transformSliceFromMember(obj, children, ctx);
    }

    // Simple index access
    const indexElements = children.filter(
      (c) => c.name !== '[' && c.name !== ']' && c !== obj
    );
    const index = indexElements[0];

    if (!index) return `${objCode}[]`;

    const indexCode = transformNode(index, ctx);
    return `${objCode}[${indexCode}]`;
  } else {
    // Dot access: obj.attr
    const prop = children[children.length - 1];
    if (!prop) return getNodeText(node, ctx.source);

    const objCode = transformNode(obj, ctx);
    const propName = getNodeText(prop, ctx.source);

    return `${objCode}.${propName}`;
  }
}

function transformSliceFromMember(obj: SyntaxNode, children: SyntaxNode[], ctx: TransformContext): string {
  ctx.usesRuntime.add('slice');
  const objCode = transformNode(obj, ctx);

  // Extract slice content between brackets
  const bracketStart = children.findIndex((c) => c.name === '[');
  const bracketEnd = children.findIndex((c) => c.name === ']');

  if (bracketStart === -1 || bracketEnd === -1) {
    return `py.slice(${objCode})`;
  }

  // Get all elements between brackets
  const sliceElements = children.slice(bracketStart + 1, bracketEnd);

  // Parse slice notation (start:stop:step)
  const colonIndices: number[] = [];
  sliceElements.forEach((el, i) => {
    if (el.name === ':') colonIndices.push(i);
  });

  // Build slice parts
  const parts: string[] = [];
  let lastIdx = 0;
  for (const colonIdx of colonIndices) {
    const beforeColon = sliceElements.slice(lastIdx, colonIdx);
    if (beforeColon.length > 0 && beforeColon[0]) {
      parts.push(transformNode(beforeColon[0], ctx));
    } else {
      parts.push('undefined');
    }
    lastIdx = colonIdx + 1;
  }
  // Handle remaining after last colon
  const afterLastColon = sliceElements.slice(lastIdx);
  if (afterLastColon.length > 0 && afterLastColon[0] && afterLastColon[0].name !== ':') {
    parts.push(transformNode(afterLastColon[0], ctx));
  } else if (colonIndices.length > 0) {
    parts.push('undefined');
  }

  // If no colons, it's not a slice
  if (colonIndices.length === 0) {
    return `py.slice(${objCode})`;
  }

  return `py.slice(${objCode}, ${parts.join(', ')})`;
}

function transformArrayExpression(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node);
  const elements = children.filter(
    (c) => c.name !== '[' && c.name !== ']' && c.name !== ','
  );

  const elementCodes = elements.map((el) => transformNode(el, ctx));
  return `[${elementCodes.join(', ')}]`;
}

function transformDictionaryExpression(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node);
  const pairs: string[] = [];

  // Filter out braces and commas
  const items = children.filter(
    (c) => c.name !== '{' && c.name !== '}' && c.name !== ',' && c.name !== ':'
  );

  // Process key-value pairs (items come in pairs: key, value)
  for (let i = 0; i < items.length; i += 2) {
    const key = items[i];
    const value = items[i + 1];

    if (key && value) {
      const keyCode = transformNode(key, ctx);
      const valueCode = transformNode(value, ctx);

      // Check if key needs to be computed
      if (key.name === 'VariableName') {
        pairs.push(`[${keyCode}]: ${valueCode}`);
      } else {
        pairs.push(`${keyCode}: ${valueCode}`);
      }
    }
  }

  return `{ ${pairs.join(', ')} }`;
}

function transformTupleExpression(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node);
  const elements = children.filter(
    (c) => c.name !== '(' && c.name !== ')' && c.name !== ','
  );

  ctx.usesRuntime.add('tuple');
  const elementCodes = elements.map((el) => transformNode(el, ctx));
  return `py.tuple(${elementCodes.join(', ')})`;
}

function transformSubscriptExpression(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node);
  if (children.length < 2) return getNodeText(node, ctx.source);

  const obj = children[0];
  const subscriptNode = children.find((c) => c.name === 'subscript' || c.name === 'Slice');

  if (!obj) return getNodeText(node, ctx.source);

  const objCode = transformNode(obj, ctx);

  // Check if it's a slice operation
  if (subscriptNode?.name === 'Slice' || hasSliceSyntax(node, ctx)) {
    return transformSlice(obj, node, ctx);
  }

  // Simple index access
  const indexChildren = children.filter(
    (c) => c.name !== '[' && c.name !== ']' && c !== obj
  );
  const index = indexChildren[0];

  if (!index) return `${objCode}[]`;

  const indexCode = transformNode(index, ctx);
  return `${objCode}[${indexCode}]`;
}

function hasSliceSyntax(node: SyntaxNode, ctx: TransformContext): boolean {
  const text = getNodeText(node, ctx.source);
  // Check if there's a colon in the subscript
  const match = text.match(/\[([^\]]*)\]/);
  return match ? match[1]?.includes(':') ?? false : false;
}

function transformSlice(obj: SyntaxNode, subscriptNode: SyntaxNode, ctx: TransformContext): string {
  ctx.usesRuntime.add('slice');
  const objCode = transformNode(obj, ctx);

  // Extract slice parameters from the subscript
  const text = getNodeText(subscriptNode, ctx.source);
  const match = text.match(/\[([^\]]*)\]/);
  if (!match || !match[1]) {
    return `py.slice(${objCode})`;
  }

  const sliceText = match[1];
  const parts = sliceText.split(':');

  const start = parts[0]?.trim() || 'undefined';
  const stop = parts[1]?.trim() || 'undefined';
  const step = parts[2]?.trim() || 'undefined';

  // Transform any expressions in the slice parameters
  const startCode = start === 'undefined' ? 'undefined' : start;
  const stopCode = stop === 'undefined' ? 'undefined' : stop;
  const stepCode = step === 'undefined' ? 'undefined' : step;

  return `py.slice(${objCode}, ${startCode}, ${stopCode}, ${stepCode})`;
}

function transformIfStatement(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node);
  const parts: string[] = [];

  let i = 0;
  while (i < children.length) {
    const child = children[i];
    if (!child) {
      i++;
      continue;
    }

    if (child.name === 'if' || (child.name === 'Keyword' && getNodeText(child, ctx.source) === 'if')) {
      // Main if
      const condition = children[i + 1];
      const body = children.find((c, idx) => idx > i && c.name === 'Body');

      if (condition && body) {
        const condCode = transformNode(condition, ctx);
        const bodyCode = transformBody(body, ctx);
        parts.push(`if (${condCode}) {\n${bodyCode}\n}`);
      }
    } else if (child.name === 'elif' || (child.name === 'Keyword' && getNodeText(child, ctx.source) === 'elif')) {
      const condition = children[i + 1];
      const body = children.find((c, idx) => idx > i + 1 && c.name === 'Body');

      if (condition && body) {
        const condCode = transformNode(condition, ctx);
        const bodyCode = transformBody(body, ctx);
        parts.push(` else if (${condCode}) {\n${bodyCode}\n}`);
      }
    } else if (child.name === 'else' || (child.name === 'Keyword' && getNodeText(child, ctx.source) === 'else')) {
      const body = children.find((c, idx) => idx > i && c.name === 'Body');

      if (body) {
        const bodyCode = transformBody(body, ctx);
        parts.push(` else {\n${bodyCode}\n}`);
      }
    }
    i++;
  }

  return parts.join('');
}

function transformWhileStatement(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node);
  const condition = children.find((c) => c.name !== 'while' && c.name !== 'Body' && c.name !== 'Keyword' && c.name !== ':');
  const body = children.find((c) => c.name === 'Body');

  if (!condition || !body) return getNodeText(node, ctx.source);

  const condCode = transformNode(condition, ctx);
  const bodyCode = transformBody(body, ctx);

  return `while (${condCode}) {\n${bodyCode}\n}`;
}

function transformForStatement(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node);

  // Find the variable (after 'for'), iterable (after 'in'), and body
  let varNode: SyntaxNode | null = null;
  let iterableNode: SyntaxNode | null = null;
  let bodyNode: SyntaxNode | null = null;

  let foundFor = false;
  let foundIn = false;

  for (const child of children) {
    if (child.name === 'for' || (child.name === 'Keyword' && getNodeText(child, ctx.source) === 'for')) {
      foundFor = true;
    } else if (child.name === 'in' || (child.name === 'Keyword' && getNodeText(child, ctx.source) === 'in')) {
      foundIn = true;
    } else if (child.name === 'Body') {
      bodyNode = child;
    } else if (child.name !== ':' && child.name !== 'Keyword') {
      if (foundFor && !foundIn) {
        varNode = child;
      } else if (foundIn && !bodyNode) {
        iterableNode = child;
      }
    }
  }

  if (!varNode || !iterableNode || !bodyNode) {
    return getNodeText(node, ctx.source);
  }

  const varCode = transformNode(varNode, ctx);
  const iterableCode = transformNode(iterableNode, ctx);
  const bodyCode = transformBody(bodyNode, ctx);

  return `for (const ${varCode} of ${iterableCode}) {\n${bodyCode}\n}`;
}

function transformBody(node: SyntaxNode, ctx: TransformContext): string {
  ctx.indentLevel++;
  const children = getChildren(node);
  const indent = '  '.repeat(ctx.indentLevel);

  const statements = children
    .filter((child) => child.name !== ':')
    .map((child) => {
      const transformed = transformNode(child, ctx);
      if (
        child.name === 'ExpressionStatement' ||
        child.name === 'AssignStatement' ||
        child.name === 'PassStatement' ||
        child.name === 'BreakStatement' ||
        child.name === 'ContinueStatement' ||
        child.name === 'ReturnStatement'
      ) {
        return indent + transformed + ';';
      }
      return indent + transformed;
    })
    .filter((s) => s.trim() !== '');

  ctx.indentLevel--;
  return statements.join('\n');
}

function transformReturnStatement(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node);
  const value = children.find((c) => c.name !== 'return' && c.name !== 'Keyword');

  if (!value) {
    return 'return';
  }

  return `return ${transformNode(value, ctx)}`;
}

function transformFunctionDefinition(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node);

  let funcName = '';
  let paramList: SyntaxNode | null = null;
  let body: SyntaxNode | null = null;

  for (const child of children) {
    if (child.name === 'VariableName') {
      funcName = getNodeText(child, ctx.source);
    } else if (child.name === 'ParamList') {
      paramList = child;
    } else if (child.name === 'Body') {
      body = child;
    }
  }

  const params = paramList ? transformParamList(paramList, ctx) : '';
  const bodyCode = body ? transformBody(body, ctx) : '';

  return `function ${funcName}(${params}) {\n${bodyCode}\n}`;
}

function transformParamList(node: SyntaxNode, ctx: TransformContext): string {
  const children = getChildren(node);
  const params: string[] = [];

  for (const child of children) {
    if (child.name === 'VariableName') {
      params.push(getNodeText(child, ctx.source));
    } else if (child.name === 'AssignParam' || child.name === 'DefaultParam') {
      // Parameter with default value
      const paramChildren = getChildren(child);
      const name = paramChildren.find((c) => c.name === 'VariableName');
      const defaultVal = paramChildren[paramChildren.length - 1];

      if (name && defaultVal && name !== defaultVal) {
        const nameCode = getNodeText(name, ctx.source);
        const defaultCode = transformNode(defaultVal, ctx);
        params.push(`${nameCode} = ${defaultCode}`);
      } else if (name) {
        params.push(getNodeText(name, ctx.source));
      }
    }
  }

  return params.join(', ');
}

function transformComment(node: SyntaxNode, ctx: TransformContext): string {
  const text = getNodeText(node, ctx.source);
  // Convert Python comment to JS comment
  return '//' + text.slice(1);
}

export { transformNode, createContext };

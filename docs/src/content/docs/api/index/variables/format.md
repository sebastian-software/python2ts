---
editUrl: false
next: false
prev: false
title: "format"
---

> `const` **format**: (`value`: `unknown`, `spec`: `string`) => `string` = `builtins.format`

Defined in: [packages/pythonlib/src/index.ts:190](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/index.ts#L190)

Convert a value to a formatted representation using a format specification.

Supports Python format spec mini-language for numbers and strings.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | `unknown` | The value to format |
| `spec` | `string` | The format specification string |

## Returns

`string`

The formatted string

## See

[Python format()](https://docs.python.org/3/library/functions.html#format)

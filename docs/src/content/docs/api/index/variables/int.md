---
editUrl: false
next: false
prev: false
title: "int"
---

> `const` **int**: (`x`: `string` \| `number` \| `boolean`, `base?`: `number`) => `number` = `builtins.int`

Defined in: [packages/pythonlib/src/index.ts:179](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/index.ts#L179)

Convert a value to an integer.

Truncates floats toward zero. Parses strings in the given base.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `x` | `string` \| `number` \| `boolean` | The value to convert |
| `base?` | `number` | The base for string conversion (default: 10) |

## Returns

`number`

The integer value

## See

[Python int()](https://docs.python.org/3/library/functions.html#int)

---
editUrl: false
next: false
prev: false
title: "bool"
---

> `const` **bool**: (`x`: `unknown`) => `boolean` = `builtins.bool`

Defined in: [packages/pythonlib/src/index.ts:183](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/index.ts#L183)

Convert a value to a boolean using Python's truthiness rules.

False values: null, undefined, false, 0, empty strings, empty arrays, empty Maps/Sets.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `x` | `unknown` | The value to convert |

## Returns

`boolean`

The boolean value

## See

[Python bool()](https://docs.python.org/3/library/functions.html#bool)

---
editUrl: false
next: false
prev: false
title: "ascii"
---

> `const` **ascii**: (`x`: `unknown`) => `string` = `builtins.ascii`

Defined in: [packages/pythonlib/src/index.ts:184](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/index.ts#L184)

Return a string containing a printable ASCII representation.

Non-ASCII characters are escaped using \\xhh, \\uhhhh, or \\Uhhhhhhhh.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `x` | `unknown` | The value to represent |

## Returns

`string`

ASCII-safe printable representation

## See

[Python ascii()](https://docs.python.org/3/library/functions.html#ascii)

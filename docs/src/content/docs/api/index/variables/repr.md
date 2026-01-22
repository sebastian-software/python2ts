---
editUrl: false
next: false
prev: false
title: "repr"
---

> `const` **repr**: (`x`: `unknown`) => `string` = `builtins.repr`

Defined in: [packages/pythonlib/src/index.ts:182](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/index.ts#L182)

Return a string containing a printable representation of an object.

Strings are quoted, other types use str() representation.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `x` | `unknown` | The value to represent |

## Returns

`string`

A printable representation

## See

[Python repr()](https://docs.python.org/3/library/functions.html#repr)

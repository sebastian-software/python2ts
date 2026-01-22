---
editUrl: false
next: false
prev: false
title: "isinstance"
---

> `const` **isinstance**: (`obj`: `unknown`, `classInfo`: `unknown`) => `boolean` = `builtins.isinstance`

Defined in: [packages/pythonlib/src/index.ts:187](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/index.ts#L187)

Return True if the object is an instance of the specified class.

Supports JavaScript constructors (Number, String, etc.) and Python type names.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `obj` | `unknown` | The object to check |
| `classInfo` | `unknown` | The class or type name to check against |

## Returns

`boolean`

True if obj is an instance of classInfo

## See

[Python isinstance()](https://docs.python.org/3/library/functions.html#isinstance)

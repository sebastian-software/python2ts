---
editUrl: false
next: false
prev: false
title: "type"
---

> `const` **type**: (`obj`: `unknown`) => `string` = `builtins.type`

Defined in: [packages/pythonlib/src/index.ts:188](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/index.ts#L188)

Return the type name of an object as a string.

Returns Python-style type names: 'int', 'float', 'str', 'bool', 'list', 'dict', 'set'.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `obj` | `unknown` | The object to check |

## Returns

`string`

The type name

## See

[Python type()](https://docs.python.org/3/library/functions.html#type)

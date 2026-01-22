---
editUrl: false
next: false
prev: false
title: "tuple"
---

> `const` **tuple**: \<`T`\>(...`items`: `T`) => `Readonly`\<`T`\> = `builtins.tuple`

Defined in: [packages/pythonlib/src/index.ts:159](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/index.ts#L159)

Create an immutable tuple (frozen array).

## Type Parameters

| Type Parameter |
| ------ |
| `T` *extends* `unknown`[] |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| ...`items` | `T` | The elements to include in the tuple |

## Returns

`Readonly`\<`T`\>

A frozen (readonly) array

## See

[Python tuple()](https://docs.python.org/3/library/functions.html#func-tuple)

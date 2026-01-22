---
editUrl: false
next: false
prev: false
title: "partial"
---

> **partial**\<`T`\>(`func`: `T`, ...`partialArgs`: `unknown`[]): (...`args`: `unknown`[]) => `ReturnType`\<`T`\>

Defined in: [packages/pythonlib/src/functools.ts:20](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/functools.ts#L20)

Create a partial function application
partial(func, arg1, arg2) returns a function that calls func with arg1, arg2 prepended

Example:
  const add = (a: number, b: number) => a + b
  const add5 = partial(add, 5)
  add5(3) // returns 8

## Type Parameters

| Type Parameter |
| ------ |
| `T` *extends* (...`args`: `unknown`[]) => `unknown` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `func` | `T` |
| ...`partialArgs` | `unknown`[] |

## Returns

> (...`args`: `unknown`[]): `ReturnType`\<`T`\>

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`args` | `unknown`[] |

### Returns

`ReturnType`\<`T`\>

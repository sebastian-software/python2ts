---
editUrl: false
next: false
prev: false
title: "reduce"
---

> **reduce**\<`T`, `U`\>(`func`: (`acc`: `U`, `val`: `T`) => `U`, `iterable`: `Iterable`\<`T`\>, `initializer?`: `U`): `U`

Defined in: [packages/pythonlib/src/functools.ts:34](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/functools.ts#L34)

Apply a function of two arguments cumulatively to the items of an iterable
reduce((x, y) => x + y, [1, 2, 3, 4, 5]) returns 15
reduce((x, y) => x + y, [1, 2, 3, 4, 5], 10) returns 25

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | - |
| `U` | `T` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `func` | (`acc`: `U`, `val`: `T`) => `U` |
| `iterable` | `Iterable`\<`T`\> |
| `initializer?` | `U` |

## Returns

`U`

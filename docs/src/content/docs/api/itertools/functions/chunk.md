---
editUrl: false
next: false
prev: false
title: "chunk"
---

> **chunk**\<`T`\>(`iterable`: `Iterable`\<`T`\>, `size`: `number`): `T`[][]

Defined in: [packages/pythonlib/src/itertools.ts:457](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/itertools.ts#L457)

Split an iterable into chunks of specified size.

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `iterable` | `Iterable`\<`T`\> |
| `size` | `number` |

## Returns

`T`[][]

## Inspired

Remeda, Lodash

chunk([1, 2, 3, 4, 5], 2) -> [[1, 2], [3, 4], [5]]

---
editUrl: false
next: false
prev: false
title: "compress"
---

> **compress**\<`T`\>(`data`: `Iterable`\<`T`\>, `selectors`: `Iterable`\<`unknown`\>): `T`[]

Defined in: [packages/pythonlib/src/itertools.ts:273](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/itertools.ts#L273)

Return elements from iterable where the corresponding selector is true
compress([1, 2, 3, 4, 5], [1, 0, 1, 0, 1]) -> [1, 3, 5]

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `Iterable`\<`T`\> |
| `selectors` | `Iterable`\<`unknown`\> |

## Returns

`T`[]

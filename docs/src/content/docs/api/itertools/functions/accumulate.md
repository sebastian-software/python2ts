---
editUrl: false
next: false
prev: false
title: "accumulate"
---

> **accumulate**\<`T`\>(`iterable`: `Iterable`\<`T`\>, `func?`: (`acc`: `T`, `val`: `T`) => `T`, `initial?`: `T`): `T`[]

Defined in: [packages/pythonlib/src/itertools.ts:306](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/itertools.ts#L306)

Make an iterator that returns accumulated sums or accumulated results
accumulate([1, 2, 3, 4, 5]) -> [1, 3, 6, 10, 15]
accumulate([1, 2, 3, 4, 5], (x, y) => x * y) -> [1, 2, 6, 24, 120]

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `iterable` | `Iterable`\<`T`\> |
| `func?` | (`acc`: `T`, `val`: `T`) => `T` |
| `initial?` | `T` |

## Returns

`T`[]

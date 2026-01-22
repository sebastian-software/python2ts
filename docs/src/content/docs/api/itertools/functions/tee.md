---
editUrl: false
next: false
prev: false
title: "tee"
---

> **tee**\<`T`\>(`iterable`: `Iterable`\<`T`\>, `n`: `number`): `T`[][]

Defined in: [packages/pythonlib/src/itertools.ts:394](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/itertools.ts#L394)

Return n independent iterators from a single iterable
tee([1, 2, 3], 2) -> [[1, 2, 3], [1, 2, 3]]

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `iterable` | `Iterable`\<`T`\> | `undefined` |
| `n` | `number` | `2` |

## Returns

`T`[][]

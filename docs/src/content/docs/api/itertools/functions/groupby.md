---
editUrl: false
next: false
prev: false
title: "groupby"
---

> **groupby**\<`T`, `K`\>(`iterable`: `Iterable`\<`T`\>, `key?`: (`x`: `T`) => `K`): \[`K`, `T`[]\][]

Defined in: [packages/pythonlib/src/itertools.ts:348](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/itertools.ts#L348)

Return consecutive keys and groups from the iterable
groupby([1, 1, 2, 2, 2, 3, 1, 1]) -> [[1, [1, 1]], [2, [2, 2, 2]], [3, [3]], [1, [1, 1]]]

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | - |
| `K` | `T` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `iterable` | `Iterable`\<`T`\> |
| `key?` | (`x`: `T`) => `K` |

## Returns

\[`K`, `T`[]\][]

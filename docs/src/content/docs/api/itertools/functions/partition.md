---
editUrl: false
next: false
prev: false
title: "partition"
---

> **partition**\<`T`\>(`iterable`: `Iterable`\<`T`\>, `predicate`: (`x`: `T`) => `boolean`): \[`T`[], `T`[]\]

Defined in: [packages/pythonlib/src/itertools.ts:475](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/itertools.ts#L475)

Partition an iterable into two arrays based on a predicate.

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `iterable` | `Iterable`\<`T`\> |
| `predicate` | (`x`: `T`) => `boolean` |

## Returns

\[`T`[], `T`[]\]

## Inspired

Remeda, Lodash

partition([1, 2, 3, 4], x => x % 2 === 0) -> [[2, 4], [1, 3]]

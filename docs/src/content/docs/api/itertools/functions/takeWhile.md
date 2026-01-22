---
editUrl: false
next: false
prev: false
title: "takeWhile"
---

> **takeWhile**\<`T`\>(`predicate`: (`x`: `T`) => `boolean`, `iterable`: `Iterable`\<`T`\>): `T`[]

Defined in: [packages/pythonlib/src/itertools.ts:199](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/itertools.ts#L199)

Take elements while predicate is true
takeWhile(x => x < 5, [1, 4, 6, 4, 1]) -> [1, 4]

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | (`x`: `T`) => `boolean` |
| `iterable` | `Iterable`\<`T`\> |

## Returns

`T`[]

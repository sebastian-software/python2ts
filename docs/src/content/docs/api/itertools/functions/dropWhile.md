---
editUrl: false
next: false
prev: false
title: "dropWhile"
---

> **dropWhile**\<`T`\>(`predicate`: (`x`: `T`) => `boolean`, `iterable`: `Iterable`\<`T`\>): `T`[]

Defined in: [packages/pythonlib/src/itertools.ts:215](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/itertools.ts#L215)

Skip elements while predicate is true, then return the rest
dropWhile(x => x < 5, [1, 4, 6, 4, 1]) -> [6, 4, 1]

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

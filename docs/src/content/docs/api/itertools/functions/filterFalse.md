---
editUrl: false
next: false
prev: false
title: "filterFalse"
---

> **filterFalse**\<`T`\>(`predicate`: (`x`: `T`) => `unknown`, `iterable`: `Iterable`\<`T`\>): `T`[]

Defined in: [packages/pythonlib/src/itertools.ts:291](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/itertools.ts#L291)

Return elements for which predicate is false
filterFalse(x => x % 2, [1, 2, 3, 4, 5]) -> [2, 4]

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | (`x`: `T`) => `unknown` |
| `iterable` | `Iterable`\<`T`\> |

## Returns

`T`[]

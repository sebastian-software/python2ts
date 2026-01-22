---
editUrl: false
next: false
prev: false
title: "cycle"
---

> **cycle**\<`T`\>(`iterable`: `Iterable`\<`T`\>): `Generator`\<`T`\>

Defined in: [packages/pythonlib/src/itertools.ts:129](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/itertools.ts#L129)

Cycle through an iterable indefinitely (INFINITE - returns Generator)
cycle([1, 2, 3]) -> 1, 2, 3, 1, 2, 3, 1, 2, 3, ...

WARNING: This is infinite! Use with for...of and break, or islice.

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `iterable` | `Iterable`\<`T`\> |

## Returns

`Generator`\<`T`\>

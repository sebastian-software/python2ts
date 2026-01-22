---
editUrl: false
next: false
prev: false
title: "zipLongest"
---

> **zipLongest**\<`T`\>(...`args`: \[`...Iterable<T, any, any>[]`, \{ `fillvalue?`: `T`; \}\] \| `Iterable`\<`T`, `any`, `any`\>[]): `T`[][]

Defined in: [packages/pythonlib/src/itertools.ts:232](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/itertools.ts#L232)

Zip iterables together, filling missing values with fillvalue
zipLongest([1, 2, 3], ['a', 'b'], { fillvalue: '-' }) -> [[1, 'a'], [2, 'b'], [3, '-']]

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| ...`args` | \[`...Iterable<T, any, any>[]`, \{ `fillvalue?`: `T`; \}\] \| `Iterable`\<`T`, `any`, `any`\>[] |

## Returns

`T`[][]

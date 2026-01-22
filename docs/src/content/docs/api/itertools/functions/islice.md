---
editUrl: false
next: false
prev: false
title: "islice"
---

> **islice**\<`T`\>(`iterable`: `Iterable`\<`T`\>, `start`: `number`, `stop?`: `number`, `step?`: `number`): `T`[]

Defined in: [packages/pythonlib/src/itertools.ts:166](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/itertools.ts#L166)

Slice an iterable from start to stop with step
islice([1, 2, 3, 4, 5], 1, 4) -> [2, 3, 4]
islice([1, 2, 3, 4, 5], 3) -> [1, 2, 3]

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `iterable` | `Iterable`\<`T`\> | `undefined` |
| `start` | `number` | `undefined` |
| `stop?` | `number` | `undefined` |
| `step?` | `number` | `1` |

## Returns

`T`[]

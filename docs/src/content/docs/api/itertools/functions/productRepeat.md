---
editUrl: false
next: false
prev: false
title: "productRepeat"
---

> **productRepeat**\<`T`\>(`iterable`: `Iterable`\<`T`\>, `repeat`: `number`): `T`[][]

Defined in: [packages/pythonlib/src/itertools.ts:416](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/itertools.ts#L416)

Cartesian product with repeat (product(range(3), repeat=2) like nested loops)
productRepeat([0, 1], 2) -> [[0, 0], [0, 1], [1, 0], [1, 1]]

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `iterable` | `Iterable`\<`T`\> | `undefined` |
| `repeat` | `number` | `1` |

## Returns

`T`[][]

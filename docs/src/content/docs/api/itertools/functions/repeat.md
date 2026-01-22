---
editUrl: false
next: false
prev: false
title: "repeat"
---

> **repeat**\<`T`\>(`obj`: `T`, `times?`: `number`): `Generator`\<`T`, `any`, `any`\> \| `T`[]

Defined in: [packages/pythonlib/src/itertools.ts:148](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/itertools.ts#L148)

Repeat an object. If times is specified, returns an array. Otherwise returns
an infinite generator.

repeat('x', 3) -> ['x', 'x', 'x']
repeat('x') -> Generator that yields 'x' forever (INFINITE)

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `obj` | `T` |
| `times?` | `number` |

## Returns

`Generator`\<`T`, `any`, `any`\> \| `T`[]

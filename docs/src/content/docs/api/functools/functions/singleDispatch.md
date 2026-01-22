---
editUrl: false
next: false
prev: false
title: "singleDispatch"
---

> **singleDispatch**\<`T`\>(`func`: `T`): `T` & `object`

Defined in: [packages/pythonlib/src/functools.ts:173](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/functools.ts#L173)

Transform a function into a single-dispatch generic function
This is a simplified version - full singleDispatch would require runtime type checking

## Type Parameters

| Type Parameter |
| ------ |
| `T` *extends* (...`args`: `unknown`[]) => `unknown` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `func` | `T` |

## Returns

`T` & `object`

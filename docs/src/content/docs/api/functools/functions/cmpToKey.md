---
editUrl: false
next: false
prev: false
title: "cmpToKey"
---

> **cmpToKey**\<`T`\>(`mycmp`: (`a`: `T`, `b`: `T`) => `number`): (`x`: `T`) => `object`

Defined in: [packages/pythonlib/src/functools.ts:302](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/functools.ts#L302)

Compare two objects for ordering (returns -1, 0, or 1)
Used for sorting with a key function

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `mycmp` | (`a`: `T`, `b`: `T`) => `number` |

## Returns

> (`x`: `T`): `object`

### Parameters

| Parameter | Type |
| ------ | ------ |
| `x` | `T` |

### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `__lt__()` | (`other`: `object`) => `boolean` | [packages/pythonlib/src/functools.ts:304](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/functools.ts#L304) |
| `value` | `T` | [packages/pythonlib/src/functools.ts:304](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/functools.ts#L304) |

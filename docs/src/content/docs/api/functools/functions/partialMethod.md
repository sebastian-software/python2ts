---
editUrl: false
next: false
prev: false
title: "partialMethod"
---

> **partialMethod**\<`T`\>(`func`: `T`, ...`partialArgs`: `unknown`[]): (...`args`: `unknown`[]) => `ReturnType`\<`T`\>

Defined in: [packages/pythonlib/src/functools.ts:162](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/functools.ts#L162)

Return a new partial object which behaves like func called with keyword arguments
In TypeScript, we simulate this with an options object as the last argument

## Type Parameters

| Type Parameter |
| ------ |
| `T` *extends* (...`args`: `unknown`[]) => `unknown` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `func` | `T` |
| ...`partialArgs` | `unknown`[] |

## Returns

> (...`args`: `unknown`[]): `ReturnType`\<`T`\>

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`args` | `unknown`[] |

### Returns

`ReturnType`\<`T`\>

---
editUrl: false
next: false
prev: false
title: "wraps"
---

> **wraps**\<`T`\>(`wrapped`: `T`): (`wrapper`: (...`args`: `unknown`[]) => `unknown`) => `T`

Defined in: [packages/pythonlib/src/functools.ts:210](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/functools.ts#L210)

Decorator to update a wrapper function to look like the wrapped function
In TypeScript, this just returns the wrapper as-is (metadata is handled differently)

## Type Parameters

| Type Parameter |
| ------ |
| `T` *extends* (...`args`: `unknown`[]) => `unknown` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `wrapped` | `T` |

## Returns

> (`wrapper`: (...`args`: `unknown`[]) => `unknown`): `T`

### Parameters

| Parameter | Type |
| ------ | ------ |
| `wrapper` | (...`args`: `unknown`[]) => `unknown` |

### Returns

`T`

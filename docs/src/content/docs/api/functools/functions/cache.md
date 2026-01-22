---
editUrl: false
next: false
prev: false
title: "cache"
---

> **cache**\<`T`\>(`func`: `T`): `T`

Defined in: [packages/pythonlib/src/functools.ts:142](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/functools.ts#L142)

Cache decorator that caches all calls (no size limit)
Equivalent to lru_cache(maxsize=None)

## Type Parameters

| Type Parameter |
| ------ |
| `T` *extends* (...`args`: `unknown`[]) => `unknown` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `func` | `T` |

## Returns

`T`

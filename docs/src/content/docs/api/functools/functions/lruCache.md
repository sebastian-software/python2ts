---
editUrl: false
next: false
prev: false
title: "lruCache"
---

> **lruCache**\<`T`\>(`func`: `T`, `maxsize`: `number`): `T` & `object`

Defined in: [packages/pythonlib/src/functools.ts:73](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/functools.ts#L73)

Simple LRU cache decorator (returns a memoized version of the function)
Note: This is a simplified implementation that caches based on JSON-stringified arguments

Example:
  const fib = lruCache((n: number): number => n <= 1 ? n : fib(n - 1) + fib(n - 2))

## Type Parameters

| Type Parameter |
| ------ |
| `T` *extends* (...`args`: `unknown`[]) => `unknown` |

## Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `func` | `T` | `undefined` |
| `maxsize` | `number` | `128` |

## Returns

`T` & `object`

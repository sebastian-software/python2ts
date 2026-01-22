---
editUrl: false
next: false
prev: false
title: "defaultdict"
---

> **defaultdict**\<`K`, `V`\>(`factory`: () => `V`): `Map`\<`K`, `V`\> & `object`

Defined in: [packages/pythonlib/src/collections.ts:109](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/collections.ts#L109)

defaultdict: a dict that provides default values for missing keys

Uses a Proxy to automatically call the factory function for missing keys.

## Type Parameters

| Type Parameter |
| ------ |
| `K` |
| `V` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `factory` | () => `V` |

## Returns

`Map`\<`K`, `V`\> & `object`

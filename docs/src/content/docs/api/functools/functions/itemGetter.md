---
editUrl: false
next: false
prev: false
title: "itemGetter"
---

> **itemGetter**\<`T`\>(...`items`: (`string` \| `number`)[]): (`obj`: `unknown`) => `T` \| `T`[]

Defined in: [packages/pythonlib/src/functools.ts:255](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/functools.ts#L255)

Return a callable object that fetches item from its operand
itemGetter(1) returns a function that gets index 1
itemGetter('key') returns a function that gets the 'key' property

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| ...`items` | (`string` \| `number`)[] |

## Returns

> (`obj`: `unknown`): `T` \| `T`[]

### Parameters

| Parameter | Type |
| ------ | ------ |
| `obj` | `unknown` |

### Returns

`T` \| `T`[]

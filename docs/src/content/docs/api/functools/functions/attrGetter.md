---
editUrl: false
next: false
prev: false
title: "attrGetter"
---

> **attrGetter**\<`T`\>(...`attrs`: `string`[]): (`obj`: `unknown`) => `T` \| `T`[]

Defined in: [packages/pythonlib/src/functools.ts:224](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/functools.ts#L224)

Return a callable object that fetches attr from its operand
attrGetter('name') returns a function that gets the 'name' attribute

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| ...`attrs` | `string`[] |

## Returns

> (`obj`: `unknown`): `T` \| `T`[]

### Parameters

| Parameter | Type |
| ------ | ------ |
| `obj` | `unknown` |

### Returns

`T` \| `T`[]

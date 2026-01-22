---
editUrl: false
next: false
prev: false
title: "methodCaller"
---

> **methodCaller**(`name`: `string`, ...`args`: `unknown`[]): (`obj`: `unknown`) => `unknown`

Defined in: [packages/pythonlib/src/functools.ts:281](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/functools.ts#L281)

Return a callable object that calls the method name on its operand
methodCaller('split', ' ') returns a function that calls .split(' ')

## Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |
| ...`args` | `unknown`[] |

## Returns

> (`obj`: `unknown`): `unknown`

### Parameters

| Parameter | Type |
| ------ | ------ |
| `obj` | `unknown` |

### Returns

`unknown`

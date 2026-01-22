---
editUrl: false
next: false
prev: false
title: "getRefCount"
---

> **getRefCount**(`obj`: `unknown`): `number`

Defined in: [packages/pythonlib/src/sys.ts:226](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/sys.ts#L226)

Return the reference count for the object.
JavaScript uses garbage collection, so this always returns a placeholder value.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `obj` | `unknown` |

## Returns

`number`

Always returns 1 (reference counting not available in JS)

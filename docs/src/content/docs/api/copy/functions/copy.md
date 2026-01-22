---
editUrl: false
next: false
prev: false
title: "copy"
---

> **copy**\<`T`\>(`x`: `T`): `T`

Defined in: [packages/pythonlib/src/copy.ts:31](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/copy.ts#L31)

Create a shallow copy of an object.

For primitive types, returns the value as-is.
For arrays, returns a new array with the same elements.
For objects, returns a new object with the same properties.
For Maps and Sets, returns new instances with the same entries.

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `x` | `T` | The object to copy |

## Returns

`T`

A shallow copy of x

## Example

```typescript
const original = [1, [2, 3], 4]
const copied = copy(original)
copied[0] = 99
console.log(original[0]) // 1 (unchanged)
copied[1][0] = 99
console.log(original[1][0]) // 99 (nested array is shared)
```

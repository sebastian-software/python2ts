---
editUrl: false
next: false
prev: false
title: "deepcopy"
---

> **deepcopy**\<`T`\>(`x`: `T`, `memo?`: `Map`\<`unknown`, `unknown`\>): `T`

Defined in: [packages/pythonlib/src/copy.ts:127](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/copy.ts#L127)

Create a deep copy of an object.

Creates a complete independent copy of the object and all nested objects.
Uses structuredClone when available, with a fallback for older environments.

Note: Functions cannot be deep copied and will be shared between copies.

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `x` | `T` | The object to deep copy |
| `memo?` | `Map`\<`unknown`, `unknown`\> | Internal map for circular reference handling (optional) |

## Returns

`T`

A deep copy of x

## Example

```typescript
const original = { a: 1, b: { c: 2 } }
const copied = deepcopy(original)
copied.b.c = 99
console.log(original.b.c) // 2 (unchanged)
```

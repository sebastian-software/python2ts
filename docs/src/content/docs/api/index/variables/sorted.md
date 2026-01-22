---
editUrl: false
next: false
prev: false
title: "sorted"
---

> `const` **sorted**: \<`T`\>(`iterable`: `Iterable`\<`T`\>, `options?`: `object`) => `T`[] = `builtins.sorted`

Defined in: [packages/pythonlib/src/index.ts:154](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/index.ts#L154)

Return a new sorted list from the items in the iterable.

Uses ES2023 Array.prototype.toSorted() for immutable sorting.

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `iterable` | `Iterable`\<`T`\> | The sequence to sort |
| `options?` | \{ `key?`: (`x`: `T`) => `unknown`; `reverse?`: `boolean`; \} | Sorting options: key function and/or reverse flag |
| `options.key?` | (`x`: `T`) => `unknown` | - |
| `options.reverse?` | `boolean` | - |

## Returns

`T`[]

A new sorted array

## See

[Python sorted()](https://docs.python.org/3/library/functions.html#sorted)

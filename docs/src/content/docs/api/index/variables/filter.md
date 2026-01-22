---
editUrl: false
next: false
prev: false
title: "filter"
---

> `const` **filter**: \<`T`\>(`fn`: (`x`: `T`) => `boolean` \| `null`, `iterable`: `Iterable`\<`T`\>) => `Iterable`\<`T`\> = `builtins.filter`

Defined in: [packages/pythonlib/src/index.ts:156](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/index.ts#L156)

Return an iterable yielding items where the function returns true.

If function is null, return items that are truthy.
Uses ES2024 Iterator.prototype.filter() for lazy evaluation.

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | (`x`: `T`) => `boolean` \| `null` | The predicate function (or null for truthiness check) |
| `iterable` | `Iterable`\<`T`\> | The input iterable |

## Returns

`Iterable`\<`T`\>

An iterable of filtered values

## See

[Python filter()](https://docs.python.org/3/library/functions.html#filter)

---
editUrl: false
next: false
prev: false
title: "map"
---

> `const` **map**: \<`T`, `U`\>(`fn`: (`x`: `T`) => `U`, `iterable`: `Iterable`\<`T`\>) => `Iterable`\<`U`\> = `builtins.map`

Defined in: [packages/pythonlib/src/index.ts:155](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/index.ts#L155)

Apply a function to every item of the iterable and yield the results.

Uses ES2024 Iterator.prototype.map() for lazy evaluation.

## Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `U` |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | (`x`: `T`) => `U` | The function to apply to each element |
| `iterable` | `Iterable`\<`T`\> | The input iterable |

## Returns

`Iterable`\<`U`\>

An iterable of transformed values

## See

[Python map()](https://docs.python.org/3/library/functions.html#map)

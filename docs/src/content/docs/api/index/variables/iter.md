---
editUrl: false
next: false
prev: false
title: "iter"
---

> `const` **iter**: \<`T`\>(`obj`: `Iterable`\<`T`, `any`, `any`\> \| `Record`\<`string`, `unknown`\> \| `null` \| `undefined`) => `string`[] \| `Iterable`\<`T`, `any`, `any`\> = `builtins.iter`

Defined in: [packages/pythonlib/src/index.ts:152](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/index.ts#L152)

Return an iterator object for the given iterable.

For objects without Symbol.iterator, returns the object's keys.

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `obj` | `Iterable`\<`T`, `any`, `any`\> \| `Record`\<`string`, `unknown`\> \| `null` \| `undefined` | The object to iterate over |

## Returns

`string`[] \| `Iterable`\<`T`, `any`, `any`\>

An iterable

## See

[Python iter()](https://docs.python.org/3/library/functions.html#iter)

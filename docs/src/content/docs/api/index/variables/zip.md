---
editUrl: false
next: false
prev: false
title: "zip"
---

> `const` **zip**: \<`T`\>(...`iterables`: \{ \[K in string \| number \| symbol\]: Iterable\<T\[K\<K\>\], any, any\> \}) => `Iterable`\<`T`\> = `builtins.zip`

Defined in: [packages/pythonlib/src/index.ts:151](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/index.ts#L151)

Iterate over multiple iterables in parallel, yielding tuples.

Stops when the shortest iterable is exhausted.

## Type Parameters

| Type Parameter |
| ------ |
| `T` *extends* `unknown`[][] |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| ...`iterables` | \{ \[K in string \| number \| symbol\]: Iterable\<T\[K\<K\>\], any, any\> \} | The iterables to zip together |

## Returns

`Iterable`\<`T`\>

An iterable of tuples containing elements from each input

## See

[Python zip()](https://docs.python.org/3/library/functions.html#zip)

---
editUrl: false
next: false
prev: false
title: "enumerate"
---

> `const` **enumerate**: \<`T`\>(`iterable`: `Iterable`\<`T`\>, `start`: `number`) => `Iterable`\<\[`number`, `T`\]\> = `builtins.enumerate`

Defined in: [packages/pythonlib/src/index.ts:150](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/index.ts#L150)

Return an iterable of tuples containing (index, value) pairs.

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `iterable` | `Iterable`\<`T`\> | `undefined` | The sequence to enumerate |
| `start` | `number` | `0` | The starting index (default: 0) |

## Returns

`Iterable`\<\[`number`, `T`\]\>

An iterable of [index, value] tuples

## See

[Python enumerate()](https://docs.python.org/3/library/functions.html#enumerate)

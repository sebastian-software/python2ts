---
editUrl: false
next: false
prev: false
title: "reversed"
---

> `const` **reversed**: \<`T`\>(`iterable`: `Iterable`\<`T`\>) => `Iterable`\<`T`\> = `builtins.reversed`

Defined in: [packages/pythonlib/src/index.ts:153](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/index.ts#L153)

Return a reversed iterator over the values of the given sequence.

Uses ES2023 Array.prototype.toReversed() for immutable reversal.

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `iterable` | `Iterable`\<`T`\> | The sequence to reverse |

## Returns

`Iterable`\<`T`\>

An iterable yielding elements in reverse order

## See

[Python reversed()](https://docs.python.org/3/library/functions.html#reversed)

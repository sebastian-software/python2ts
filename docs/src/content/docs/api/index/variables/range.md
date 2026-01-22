---
editUrl: false
next: false
prev: false
title: "range"
---

> `const` **range**: (`startOrStop`: `number`, `stop?`: `number`, `step?`: `number`) => `Iterable`\<`number`\> = `builtins.range`

Defined in: [packages/pythonlib/src/index.ts:149](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/index.ts#L149)

Return a sequence of numbers from start to stop (exclusive) by step.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `startOrStop` | `number` | If only one argument, this is stop (start defaults to 0). Otherwise, this is start. |
| `stop?` | `number` | The end value (exclusive) |
| `step?` | `number` | The increment (default: 1) |

## Returns

`Iterable`\<`number`\>

An iterable of numbers

## See

[Python range()](https://docs.python.org/3/library/functions.html#func-range)

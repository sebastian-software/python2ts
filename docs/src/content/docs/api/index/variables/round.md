---
editUrl: false
next: false
prev: false
title: "round"
---

> `const` **round**: (`number`: `number`, `ndigits?`: `number`) => `number` = `builtins.round`

Defined in: [packages/pythonlib/src/index.ts:169](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/index.ts#L169)

Round a number to a given precision in decimal digits.

Uses banker's rounding (round half to even) for values exactly halfway.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `number` | `number` | The number to round |
| `ndigits?` | `number` | Number of decimal places (default: 0) |

## Returns

`number`

The rounded number

## See

[Python round()](https://docs.python.org/3/library/functions.html#round)

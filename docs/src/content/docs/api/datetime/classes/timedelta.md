---
editUrl: false
next: false
prev: false
title: "timedelta"
---

Defined in: [packages/pythonlib/src/datetime.ts:15](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L15)

## Constructors

### Constructor

> **new timedelta**(`options?`: `object`): `timedelta`

Defined in: [packages/pythonlib/src/datetime.ts:20](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L20)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | \{ `days?`: `number`; `hours?`: `number`; `microseconds?`: `number`; `milliseconds?`: `number`; `minutes?`: `number`; `seconds?`: `number`; `weeks?`: `number`; \} |
| `options.days?` | `number` |
| `options.hours?` | `number` |
| `options.microseconds?` | `number` |
| `options.milliseconds?` | `number` |
| `options.minutes?` | `number` |
| `options.seconds?` | `number` |
| `options.weeks?` | `number` |

#### Returns

`timedelta`

## Properties

### days

> `readonly` **days**: `number`

Defined in: [packages/pythonlib/src/datetime.ts:16](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L16)

***

### microseconds

> `readonly` **microseconds**: `number`

Defined in: [packages/pythonlib/src/datetime.ts:18](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L18)

***

### seconds

> `readonly` **seconds**: `number`

Defined in: [packages/pythonlib/src/datetime.ts:17](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L17)

***

### max

> `static` **max**: `timedelta`

Defined in: [packages/pythonlib/src/datetime.ts:106](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L106)

***

### min

> `static` **min**: `timedelta`

Defined in: [packages/pythonlib/src/datetime.ts:105](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L105)

***

### resolution

> `static` **resolution**: `timedelta`

Defined in: [packages/pythonlib/src/datetime.ts:113](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L113)

## Methods

### add()

> **add**(`other`: `timedelta`): `timedelta`

Defined in: [packages/pythonlib/src/datetime.ts:83](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L83)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `other` | `timedelta` |

#### Returns

`timedelta`

***

### multiply()

> **multiply**(`n`: `number`): `timedelta`

Defined in: [packages/pythonlib/src/datetime.ts:99](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L99)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `n` | `number` |

#### Returns

`timedelta`

***

### subtract()

> **subtract**(`other`: `timedelta`): `timedelta`

Defined in: [packages/pythonlib/src/datetime.ts:91](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L91)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `other` | `timedelta` |

#### Returns

`timedelta`

***

### toString()

> **toString**(): `string`

Defined in: [packages/pythonlib/src/datetime.ts:66](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L66)

#### Returns

`string`

***

### totalSeconds()

> **totalSeconds**(): `number`

Defined in: [packages/pythonlib/src/datetime.ts:62](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L62)

#### Returns

`number`

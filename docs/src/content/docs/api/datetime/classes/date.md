---
editUrl: false
next: false
prev: false
title: "date"
---

Defined in: [packages/pythonlib/src/datetime.ts:120](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L120)

## Extended by

- [`datetime`](/python2ts/api/datetime/classes/datetime/)

## Constructors

### Constructor

> **new date**(`year`: `number`, `month`: `number`, `day`: `number`): `date`

Defined in: [packages/pythonlib/src/datetime.ts:125](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L125)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `year` | `number` |
| `month` | `number` |
| `day` | `number` |

#### Returns

`date`

## Properties

### day

> `readonly` **day**: `number`

Defined in: [packages/pythonlib/src/datetime.ts:123](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L123)

***

### month

> `readonly` **month**: `number`

Defined in: [packages/pythonlib/src/datetime.ts:122](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L122)

***

### year

> `readonly` **year**: `number`

Defined in: [packages/pythonlib/src/datetime.ts:121](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L121)

***

### max

> `static` **max**: `date`

Defined in: [packages/pythonlib/src/datetime.ts:263](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L263)

***

### min

> `static` **min**: `date`

Defined in: [packages/pythonlib/src/datetime.ts:262](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L262)

***

### resolution

> `static` **resolution**: [`timedelta`](/python2ts/api/datetime/classes/timedelta/)

Defined in: [packages/pythonlib/src/datetime.ts:264](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L264)

## Methods

### \_\_add\_\_()

> **\_\_add\_\_**(`delta`: [`timedelta`](/python2ts/api/datetime/classes/timedelta/)): `date`

Defined in: [packages/pythonlib/src/datetime.ts:225](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L225)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `delta` | [`timedelta`](/python2ts/api/datetime/classes/timedelta/) |

#### Returns

`date`

***

### \_\_eq\_\_()

> **\_\_eq\_\_**(`other`: `date`): `boolean`

Defined in: [packages/pythonlib/src/datetime.ts:258](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L258)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `other` | `date` |

#### Returns

`boolean`

***

### \_\_ge\_\_()

> **\_\_ge\_\_**(`other`: `date`): `boolean`

Defined in: [packages/pythonlib/src/datetime.ts:254](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L254)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `other` | `date` |

#### Returns

`boolean`

***

### \_\_gt\_\_()

> **\_\_gt\_\_**(`other`: `date`): `boolean`

Defined in: [packages/pythonlib/src/datetime.ts:250](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L250)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `other` | `date` |

#### Returns

`boolean`

***

### \_\_le\_\_()

> **\_\_le\_\_**(`other`: `date`): `boolean`

Defined in: [packages/pythonlib/src/datetime.ts:246](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L246)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `other` | `date` |

#### Returns

`boolean`

***

### \_\_lt\_\_()

> **\_\_lt\_\_**(`other`: `date`): `boolean`

Defined in: [packages/pythonlib/src/datetime.ts:242](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L242)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `other` | `date` |

#### Returns

`boolean`

***

### \_\_sub\_\_()

> **\_\_sub\_\_**(`other`: [`timedelta`](/python2ts/api/datetime/classes/timedelta/) \| `date`): [`timedelta`](/python2ts/api/datetime/classes/timedelta/) \| `date`

Defined in: [packages/pythonlib/src/datetime.ts:230](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L230)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `other` | [`timedelta`](/python2ts/api/datetime/classes/timedelta/) \| `date` |

#### Returns

[`timedelta`](/python2ts/api/datetime/classes/timedelta/) \| `date`

***

### isoCalendar()

> **isoCalendar**(): \[`number`, `number`, `number`\]

Defined in: [packages/pythonlib/src/datetime.ts:187](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L187)

#### Returns

\[`number`, `number`, `number`\]

***

### isoFormat()

> **isoFormat**(): `string`

Defined in: [packages/pythonlib/src/datetime.ts:213](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L213)

#### Returns

`string`

***

### isoWeekday()

> **isoWeekday**(): `number`

Defined in: [packages/pythonlib/src/datetime.ts:182](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L182)

#### Returns

`number`

***

### replace()

> **replace**(`options?`: `object`): `date`

Defined in: [packages/pythonlib/src/datetime.ts:162](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L162)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | \{ `day?`: `number`; `month?`: `number`; `year?`: `number`; \} |
| `options.day?` | `number` |
| `options.month?` | `number` |
| `options.year?` | `number` |

#### Returns

`date`

***

### strftime()

> **strftime**(`format`: `string`): `string`

Defined in: [packages/pythonlib/src/datetime.ts:217](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L217)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `format` | `string` |

#### Returns

`string`

***

### toOrdinal()

> **toOrdinal**(): `number`

Defined in: [packages/pythonlib/src/datetime.ts:170](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L170)

#### Returns

`number`

***

### toString()

> **toString**(): `string`

Defined in: [packages/pythonlib/src/datetime.ts:221](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L221)

#### Returns

`string`

***

### weekday()

> **weekday**(): `number`

Defined in: [packages/pythonlib/src/datetime.ts:176](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L176)

#### Returns

`number`

***

### fromIsoFormat()

> `static` **fromIsoFormat**(`dateString`: `string`): `date`

Defined in: [packages/pythonlib/src/datetime.ts:148](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L148)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `dateString` | `string` |

#### Returns

`date`

***

### fromOrdinal()

> `static` **fromOrdinal**(`ordinal`: `number`): `date`

Defined in: [packages/pythonlib/src/datetime.ts:156](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L156)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `ordinal` | `number` |

#### Returns

`date`

***

### fromTimestamp()

> `static` **fromTimestamp**(`timestamp`: `number`): `date`

Defined in: [packages/pythonlib/src/datetime.ts:143](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L143)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `timestamp` | `number` |

#### Returns

`date`

***

### today()

> `static` **today**(): `date`

Defined in: [packages/pythonlib/src/datetime.ts:138](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L138)

#### Returns

`date`

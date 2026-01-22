---
editUrl: false
next: false
prev: false
title: "time"
---

Defined in: [packages/pythonlib/src/datetime.ts:271](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L271)

## Constructors

### Constructor

> **new time**(`hour`: `number`, `minute`: `number`, `second`: `number`, `microsecond`: `number`): `time`

Defined in: [packages/pythonlib/src/datetime.ts:278](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L278)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `hour` | `number` | `0` |
| `minute` | `number` | `0` |
| `second` | `number` | `0` |
| `microsecond` | `number` | `0` |

#### Returns

`time`

## Properties

### hour

> `readonly` **hour**: `number`

Defined in: [packages/pythonlib/src/datetime.ts:272](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L272)

***

### microsecond

> `readonly` **microsecond**: `number`

Defined in: [packages/pythonlib/src/datetime.ts:275](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L275)

***

### minute

> `readonly` **minute**: `number`

Defined in: [packages/pythonlib/src/datetime.ts:273](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L273)

***

### second

> `readonly` **second**: `number`

Defined in: [packages/pythonlib/src/datetime.ts:274](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L274)

***

### tzinfo

> `readonly` **tzinfo**: `null`

Defined in: [packages/pythonlib/src/datetime.ts:276](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L276)

***

### max

> `static` **max**: `time`

Defined in: [packages/pythonlib/src/datetime.ts:353](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L353)

***

### min

> `static` **min**: `time`

Defined in: [packages/pythonlib/src/datetime.ts:352](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L352)

***

### resolution

> `static` **resolution**: [`timedelta`](/python2ts/api/datetime/classes/timedelta/)

Defined in: [packages/pythonlib/src/datetime.ts:354](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L354)

## Methods

### isoFormat()

> **isoFormat**(`timespec`: `"hours"` \| `"minutes"` \| `"seconds"` \| `"microseconds"` \| `"auto"` \| `"milliseconds"`): `string`

Defined in: [packages/pythonlib/src/datetime.ts:314](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L314)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `timespec` | `"hours"` \| `"minutes"` \| `"seconds"` \| `"microseconds"` \| `"auto"` \| `"milliseconds"` | `"auto"` |

#### Returns

`string`

***

### replace()

> **replace**(`options?`: `object`): `time`

Defined in: [packages/pythonlib/src/datetime.ts:300](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L300)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | \{ `hour?`: `number`; `microsecond?`: `number`; `minute?`: `number`; `second?`: `number`; \} |
| `options.hour?` | `number` |
| `options.microsecond?` | `number` |
| `options.minute?` | `number` |
| `options.second?` | `number` |

#### Returns

`time`

***

### strftime()

> **strftime**(`format`: `string`): `string`

Defined in: [packages/pythonlib/src/datetime.ts:341](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L341)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `format` | `string` |

#### Returns

`string`

***

### toString()

> **toString**(): `string`

Defined in: [packages/pythonlib/src/datetime.ts:348](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L348)

#### Returns

`string`

***

### fromIsoFormat()

> `static` **fromIsoFormat**(`timeString`: `string`): `time`

Defined in: [packages/pythonlib/src/datetime.ts:291](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L291)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `timeString` | `string` |

#### Returns

`time`

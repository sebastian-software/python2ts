---
editUrl: false
next: false
prev: false
title: "datetime"
---

Defined in: [packages/pythonlib/src/datetime.ts:361](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L361)

## Extends

- [`date`](/python2ts/api/datetime/classes/date/)

## Constructors

### Constructor

> **new datetime**(`year`: `number`, `month`: `number`, `day`: `number`, `hour`: `number`, `minute`: `number`, `second`: `number`, `microsecond`: `number`): `datetime`

Defined in: [packages/pythonlib/src/datetime.ts:368](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L368)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `year` | `number` | `undefined` |
| `month` | `number` | `undefined` |
| `day` | `number` | `undefined` |
| `hour` | `number` | `0` |
| `minute` | `number` | `0` |
| `second` | `number` | `0` |
| `microsecond` | `number` | `0` |

#### Returns

`datetime`

#### Overrides

[`date`](/python2ts/api/datetime/classes/date/).[`constructor`](/python2ts/api/datetime/classes/date/#constructor)

## Properties

### day

> `readonly` **day**: `number`

Defined in: [packages/pythonlib/src/datetime.ts:123](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L123)

#### Inherited from

[`date`](/python2ts/api/datetime/classes/date/).[`day`](/python2ts/api/datetime/classes/date/#day)

***

### hour

> `readonly` **hour**: `number`

Defined in: [packages/pythonlib/src/datetime.ts:362](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L362)

***

### microsecond

> `readonly` **microsecond**: `number`

Defined in: [packages/pythonlib/src/datetime.ts:365](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L365)

***

### minute

> `readonly` **minute**: `number`

Defined in: [packages/pythonlib/src/datetime.ts:363](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L363)

***

### month

> `readonly` **month**: `number`

Defined in: [packages/pythonlib/src/datetime.ts:122](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L122)

#### Inherited from

[`date`](/python2ts/api/datetime/classes/date/).[`month`](/python2ts/api/datetime/classes/date/#month)

***

### second

> `readonly` **second**: `number`

Defined in: [packages/pythonlib/src/datetime.ts:364](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L364)

***

### tzinfo

> `readonly` **tzinfo**: `null`

Defined in: [packages/pythonlib/src/datetime.ts:366](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L366)

***

### year

> `readonly` **year**: `number`

Defined in: [packages/pythonlib/src/datetime.ts:121](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L121)

#### Inherited from

[`date`](/python2ts/api/datetime/classes/date/).[`year`](/python2ts/api/datetime/classes/date/#year)

***

### max

> `static` **max**: `datetime`

Defined in: [packages/pythonlib/src/datetime.ts:581](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L581)

#### Overrides

[`date`](/python2ts/api/datetime/classes/date/).[`max`](/python2ts/api/datetime/classes/date/#max)

***

### min

> `static` **min**: `datetime`

Defined in: [packages/pythonlib/src/datetime.ts:580](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L580)

#### Overrides

[`date`](/python2ts/api/datetime/classes/date/).[`min`](/python2ts/api/datetime/classes/date/#min)

***

### resolution

> `static` **resolution**: [`timedelta`](/python2ts/api/datetime/classes/timedelta/)

Defined in: [packages/pythonlib/src/datetime.ts:582](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L582)

#### Overrides

[`date`](/python2ts/api/datetime/classes/date/).[`resolution`](/python2ts/api/datetime/classes/date/#resolution)

## Methods

### \_\_add\_\_()

> **\_\_add\_\_**(`delta`: [`timedelta`](/python2ts/api/datetime/classes/timedelta/)): `datetime`

Defined in: [packages/pythonlib/src/datetime.ts:556](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L556)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `delta` | [`timedelta`](/python2ts/api/datetime/classes/timedelta/) |

#### Returns

`datetime`

#### Overrides

[`date`](/python2ts/api/datetime/classes/date/).[`__add__`](/python2ts/api/datetime/classes/date/#__add__)

***

### \_\_eq\_\_()

> **\_\_eq\_\_**(`other`: [`date`](/python2ts/api/datetime/classes/date/)): `boolean`

Defined in: [packages/pythonlib/src/datetime.ts:258](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L258)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `other` | [`date`](/python2ts/api/datetime/classes/date/) |

#### Returns

`boolean`

#### Inherited from

[`date`](/python2ts/api/datetime/classes/date/).[`__eq__`](/python2ts/api/datetime/classes/date/#__eq__)

***

### \_\_ge\_\_()

> **\_\_ge\_\_**(`other`: [`date`](/python2ts/api/datetime/classes/date/)): `boolean`

Defined in: [packages/pythonlib/src/datetime.ts:254](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L254)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `other` | [`date`](/python2ts/api/datetime/classes/date/) |

#### Returns

`boolean`

#### Inherited from

[`date`](/python2ts/api/datetime/classes/date/).[`__ge__`](/python2ts/api/datetime/classes/date/#__ge__)

***

### \_\_gt\_\_()

> **\_\_gt\_\_**(`other`: [`date`](/python2ts/api/datetime/classes/date/)): `boolean`

Defined in: [packages/pythonlib/src/datetime.ts:250](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L250)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `other` | [`date`](/python2ts/api/datetime/classes/date/) |

#### Returns

`boolean`

#### Inherited from

[`date`](/python2ts/api/datetime/classes/date/).[`__gt__`](/python2ts/api/datetime/classes/date/#__gt__)

***

### \_\_le\_\_()

> **\_\_le\_\_**(`other`: [`date`](/python2ts/api/datetime/classes/date/)): `boolean`

Defined in: [packages/pythonlib/src/datetime.ts:246](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L246)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `other` | [`date`](/python2ts/api/datetime/classes/date/) |

#### Returns

`boolean`

#### Inherited from

[`date`](/python2ts/api/datetime/classes/date/).[`__le__`](/python2ts/api/datetime/classes/date/#__le__)

***

### \_\_lt\_\_()

> **\_\_lt\_\_**(`other`: [`date`](/python2ts/api/datetime/classes/date/)): `boolean`

Defined in: [packages/pythonlib/src/datetime.ts:242](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L242)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `other` | [`date`](/python2ts/api/datetime/classes/date/) |

#### Returns

`boolean`

#### Inherited from

[`date`](/python2ts/api/datetime/classes/date/).[`__lt__`](/python2ts/api/datetime/classes/date/#__lt__)

***

### \_\_sub\_\_()

> **\_\_sub\_\_**(`other`: [`timedelta`](/python2ts/api/datetime/classes/timedelta/) \| [`date`](/python2ts/api/datetime/classes/date/) \| `datetime`): [`timedelta`](/python2ts/api/datetime/classes/timedelta/) \| `datetime`

Defined in: [packages/pythonlib/src/datetime.ts:562](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L562)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `other` | [`timedelta`](/python2ts/api/datetime/classes/timedelta/) \| [`date`](/python2ts/api/datetime/classes/date/) \| `datetime` |

#### Returns

[`timedelta`](/python2ts/api/datetime/classes/timedelta/) \| `datetime`

#### Overrides

[`date`](/python2ts/api/datetime/classes/date/).[`__sub__`](/python2ts/api/datetime/classes/date/#__sub__)

***

### ctime()

> **ctime**(): `string`

Defined in: [packages/pythonlib/src/datetime.ts:527](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L527)

#### Returns

`string`

***

### date()

> **date**(): [`date`](/python2ts/api/datetime/classes/date/)

Defined in: [packages/pythonlib/src/datetime.ts:497](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L497)

#### Returns

[`date`](/python2ts/api/datetime/classes/date/)

***

### isoCalendar()

> **isoCalendar**(): \[`number`, `number`, `number`\]

Defined in: [packages/pythonlib/src/datetime.ts:187](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L187)

#### Returns

\[`number`, `number`, `number`\]

#### Inherited from

[`date`](/python2ts/api/datetime/classes/date/).[`isoCalendar`](/python2ts/api/datetime/classes/date/#isocalendar)

***

### isoFormat()

> **isoFormat**(`sep`: `string`, `timespec`: `"hours"` \| `"minutes"` \| `"seconds"` \| `"microseconds"` \| `"auto"` \| `"milliseconds"`): `string`

Defined in: [packages/pythonlib/src/datetime.ts:518](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L518)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `sep` | `string` | `"T"` |
| `timespec` | `"hours"` \| `"minutes"` \| `"seconds"` \| `"microseconds"` \| `"auto"` \| `"milliseconds"` | `"auto"` |

#### Returns

`string`

#### Overrides

[`date`](/python2ts/api/datetime/classes/date/).[`isoFormat`](/python2ts/api/datetime/classes/date/#isoformat)

***

### isoWeekday()

> **isoWeekday**(): `number`

Defined in: [packages/pythonlib/src/datetime.ts:182](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L182)

#### Returns

`number`

#### Inherited from

[`date`](/python2ts/api/datetime/classes/date/).[`isoWeekday`](/python2ts/api/datetime/classes/date/#isoweekday)

***

### replace()

> **replace**(`options?`: `object`): `datetime`

Defined in: [packages/pythonlib/src/datetime.ts:477](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L477)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | \{ `day?`: `number`; `hour?`: `number`; `microsecond?`: `number`; `minute?`: `number`; `month?`: `number`; `second?`: `number`; `year?`: `number`; \} |
| `options.day?` | `number` |
| `options.hour?` | `number` |
| `options.microsecond?` | `number` |
| `options.minute?` | `number` |
| `options.month?` | `number` |
| `options.second?` | `number` |
| `options.year?` | `number` |

#### Returns

`datetime`

#### Overrides

[`date`](/python2ts/api/datetime/classes/date/).[`replace`](/python2ts/api/datetime/classes/date/#replace)

***

### strftime()

> **strftime**(`format`: `string`): `string`

Defined in: [packages/pythonlib/src/datetime.ts:548](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L548)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `format` | `string` |

#### Returns

`string`

#### Overrides

[`date`](/python2ts/api/datetime/classes/date/).[`strftime`](/python2ts/api/datetime/classes/date/#strftime)

***

### time()

> **time**(): [`time`](/python2ts/api/datetime/classes/time/)

Defined in: [packages/pythonlib/src/datetime.ts:501](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L501)

#### Returns

[`time`](/python2ts/api/datetime/classes/time/)

***

### timestamp()

> **timestamp**(): `number`

Defined in: [packages/pythonlib/src/datetime.ts:505](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L505)

#### Returns

`number`

***

### toOrdinal()

> **toOrdinal**(): `number`

Defined in: [packages/pythonlib/src/datetime.ts:170](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L170)

#### Returns

`number`

#### Inherited from

[`date`](/python2ts/api/datetime/classes/date/).[`toOrdinal`](/python2ts/api/datetime/classes/date/#toordinal)

***

### toString()

> **toString**(): `string`

Defined in: [packages/pythonlib/src/datetime.ts:552](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L552)

#### Returns

`string`

#### Overrides

[`date`](/python2ts/api/datetime/classes/date/).[`toString`](/python2ts/api/datetime/classes/date/#tostring)

***

### weekday()

> **weekday**(): `number`

Defined in: [packages/pythonlib/src/datetime.ts:176](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L176)

#### Returns

`number`

#### Inherited from

[`date`](/python2ts/api/datetime/classes/date/).[`weekday`](/python2ts/api/datetime/classes/date/#weekday)

***

### combine()

> `static` **combine**(`d`: [`date`](/python2ts/api/datetime/classes/date/), `t`: [`time`](/python2ts/api/datetime/classes/time/)): `datetime`

Defined in: [packages/pythonlib/src/datetime.ts:469](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L469)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `d` | [`date`](/python2ts/api/datetime/classes/date/) |
| `t` | [`time`](/python2ts/api/datetime/classes/time/) |

#### Returns

`datetime`

***

### fromIsoFormat()

> `static` **fromIsoFormat**(`s`: `string`): `datetime`

Defined in: [packages/pythonlib/src/datetime.ts:446](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L446)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `s` | `string` |

#### Returns

`datetime`

#### Overrides

[`date`](/python2ts/api/datetime/classes/date/).[`fromIsoFormat`](/python2ts/api/datetime/classes/date/#fromisoformat)

***

### fromOrdinal()

> `static` **fromOrdinal**(`ordinal`: `number`): [`date`](/python2ts/api/datetime/classes/date/)

Defined in: [packages/pythonlib/src/datetime.ts:156](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L156)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `ordinal` | `number` |

#### Returns

[`date`](/python2ts/api/datetime/classes/date/)

#### Inherited from

[`date`](/python2ts/api/datetime/classes/date/).[`fromOrdinal`](/python2ts/api/datetime/classes/date/#fromordinal)

***

### fromTimestamp()

> `static` **fromTimestamp**(`timestamp`: `number`): `datetime`

Defined in: [packages/pythonlib/src/datetime.ts:420](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L420)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `timestamp` | `number` |

#### Returns

`datetime`

#### Overrides

[`date`](/python2ts/api/datetime/classes/date/).[`fromTimestamp`](/python2ts/api/datetime/classes/date/#fromtimestamp)

***

### now()

> `static` **now**(): `datetime`

Defined in: [packages/pythonlib/src/datetime.ts:394](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L394)

#### Returns

`datetime`

***

### strptime()

> `static` **strptime**(`dateString`: `string`, `format`: `string`): `datetime`

Defined in: [packages/pythonlib/src/datetime.ts:473](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L473)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `dateString` | `string` |
| `format` | `string` |

#### Returns

`datetime`

***

### today()

> `static` **today**(): `datetime`

Defined in: [packages/pythonlib/src/datetime.ts:390](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L390)

#### Returns

`datetime`

#### Overrides

[`date`](/python2ts/api/datetime/classes/date/).[`today`](/python2ts/api/datetime/classes/date/#today)

***

### utcfromTimestamp()

> `static` **utcfromTimestamp**(`timestamp`: `number`): `datetime`

Defined in: [packages/pythonlib/src/datetime.ts:433](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L433)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `timestamp` | `number` |

#### Returns

`datetime`

***

### utcNow()

> `static` **utcNow**(): `datetime`

Defined in: [packages/pythonlib/src/datetime.ts:407](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/datetime.ts#L407)

#### Returns

`datetime`

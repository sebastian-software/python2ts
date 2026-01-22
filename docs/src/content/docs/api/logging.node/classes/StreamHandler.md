---
editUrl: false
next: false
prev: false
title: "StreamHandler"
---

Defined in: [packages/pythonlib/src/logging.node.ts:100](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L100)

Handler that writes to console.

## Extends

- [`Handler`](/python2ts/api/loggingnode/classes/handler/)

## Constructors

### Constructor

> **new StreamHandler**(): `StreamHandler`

#### Returns

`StreamHandler`

#### Inherited from

[`Handler`](/python2ts/api/loggingnode/classes/handler/).[`constructor`](/python2ts/api/loggingnode/classes/handler/#constructor)

## Properties

### formatter

> **formatter**: [`Formatter`](/python2ts/api/loggingnode/classes/formatter/) \| `null` = `null`

Defined in: [packages/pythonlib/src/logging.node.ts:71](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L71)

#### Inherited from

[`Handler`](/python2ts/api/loggingnode/classes/handler/).[`formatter`](/python2ts/api/loggingnode/classes/handler/#formatter)

***

### level

> **level**: `number` = `NOTSET`

Defined in: [packages/pythonlib/src/logging.node.ts:70](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L70)

#### Inherited from

[`Handler`](/python2ts/api/loggingnode/classes/handler/).[`level`](/python2ts/api/loggingnode/classes/handler/#level)

## Methods

### emit()

> **emit**(`record`: [`LogRecord`](/python2ts/api/loggingnode/interfaces/logrecord/)): `void`

Defined in: [packages/pythonlib/src/logging.node.ts:101](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L101)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `record` | [`LogRecord`](/python2ts/api/loggingnode/interfaces/logrecord/) |

#### Returns

`void`

#### Overrides

[`Handler`](/python2ts/api/loggingnode/classes/handler/).[`emit`](/python2ts/api/loggingnode/classes/handler/#emit)

***

### format()

> **format**(`record`: [`LogRecord`](/python2ts/api/loggingnode/interfaces/logrecord/)): `string`

Defined in: [packages/pythonlib/src/logging.node.ts:81](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L81)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `record` | [`LogRecord`](/python2ts/api/loggingnode/interfaces/logrecord/) |

#### Returns

`string`

#### Inherited from

[`Handler`](/python2ts/api/loggingnode/classes/handler/).[`format`](/python2ts/api/loggingnode/classes/handler/#format)

***

### handle()

> **handle**(`record`: [`LogRecord`](/python2ts/api/loggingnode/interfaces/logrecord/)): `void`

Defined in: [packages/pythonlib/src/logging.node.ts:90](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L90)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `record` | [`LogRecord`](/python2ts/api/loggingnode/interfaces/logrecord/) |

#### Returns

`void`

#### Inherited from

[`Handler`](/python2ts/api/loggingnode/classes/handler/).[`handle`](/python2ts/api/loggingnode/classes/handler/#handle)

***

### setFormatter()

> **setFormatter**(`formatter`: [`Formatter`](/python2ts/api/loggingnode/classes/formatter/)): `void`

Defined in: [packages/pythonlib/src/logging.node.ts:77](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L77)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `formatter` | [`Formatter`](/python2ts/api/loggingnode/classes/formatter/) |

#### Returns

`void`

#### Inherited from

[`Handler`](/python2ts/api/loggingnode/classes/handler/).[`setFormatter`](/python2ts/api/loggingnode/classes/handler/#setformatter)

***

### setLevel()

> **setLevel**(`level`: `number`): `void`

Defined in: [packages/pythonlib/src/logging.node.ts:73](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L73)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `level` | `number` |

#### Returns

`void`

#### Inherited from

[`Handler`](/python2ts/api/loggingnode/classes/handler/).[`setLevel`](/python2ts/api/loggingnode/classes/handler/#setlevel)

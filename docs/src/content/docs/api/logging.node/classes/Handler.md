---
editUrl: false
next: false
prev: false
title: "Handler"
---

Defined in: [packages/pythonlib/src/logging.node.ts:69](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L69)

Handler base class for processing log records.

## Extended by

- [`StreamHandler`](/python2ts/api/loggingnode/classes/streamhandler/)
- [`FileHandler`](/python2ts/api/loggingnode/classes/filehandler/)

## Constructors

### Constructor

> **new Handler**(): `Handler`

#### Returns

`Handler`

## Properties

### formatter

> **formatter**: [`Formatter`](/python2ts/api/loggingnode/classes/formatter/) \| `null` = `null`

Defined in: [packages/pythonlib/src/logging.node.ts:71](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L71)

***

### level

> **level**: `number` = `NOTSET`

Defined in: [packages/pythonlib/src/logging.node.ts:70](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L70)

## Methods

### emit()

> `abstract` **emit**(`record`: [`LogRecord`](/python2ts/api/loggingnode/interfaces/logrecord/)): `void`

Defined in: [packages/pythonlib/src/logging.node.ts:88](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L88)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `record` | [`LogRecord`](/python2ts/api/loggingnode/interfaces/logrecord/) |

#### Returns

`void`

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

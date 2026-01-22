---
editUrl: false
next: false
prev: false
title: "Formatter"
---

Defined in: [packages/pythonlib/src/logging.node.ts:146](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L146)

Formatter for log records.

## Constructors

### Constructor

> **new Formatter**(`fmt?`: `string`, `datefmt?`: `string`): `Formatter`

Defined in: [packages/pythonlib/src/logging.node.ts:150](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L150)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `fmt?` | `string` |
| `datefmt?` | `string` |

#### Returns

`Formatter`

## Methods

### format()

> **format**(`record`: [`LogRecord`](/python2ts/api/loggingnode/interfaces/logrecord/)): `string`

Defined in: [packages/pythonlib/src/logging.node.ts:166](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L166)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `record` | [`LogRecord`](/python2ts/api/loggingnode/interfaces/logrecord/) |

#### Returns

`string`

***

### formatTime()

> **formatTime**(`record`: [`LogRecord`](/python2ts/api/loggingnode/interfaces/logrecord/)): `string`

Defined in: [packages/pythonlib/src/logging.node.ts:155](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L155)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `record` | [`LogRecord`](/python2ts/api/loggingnode/interfaces/logrecord/) |

#### Returns

`string`

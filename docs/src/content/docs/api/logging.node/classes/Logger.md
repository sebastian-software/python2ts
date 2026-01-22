---
editUrl: false
next: false
prev: false
title: "Logger"
---

Defined in: [packages/pythonlib/src/logging.node.ts:191](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L191)

Logger class for logging events.

## Constructors

### Constructor

> **new Logger**(`name`: `string`): `Logger`

Defined in: [packages/pythonlib/src/logging.node.ts:198](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L198)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |

#### Returns

`Logger`

## Properties

### handlers

> **handlers**: [`Handler`](/python2ts/api/loggingnode/classes/handler/)[] = `[]`

Defined in: [packages/pythonlib/src/logging.node.ts:194](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L194)

***

### level

> **level**: `number` = `NOTSET`

Defined in: [packages/pythonlib/src/logging.node.ts:193](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L193)

***

### name

> `readonly` **name**: `string`

Defined in: [packages/pythonlib/src/logging.node.ts:192](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L192)

***

### parent

> **parent**: `Logger` \| `null` = `null`

Defined in: [packages/pythonlib/src/logging.node.ts:195](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L195)

***

### propagate

> **propagate**: `boolean` = `true`

Defined in: [packages/pythonlib/src/logging.node.ts:196](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L196)

## Methods

### addHandler()

> **addHandler**(`handler`: [`Handler`](/python2ts/api/loggingnode/classes/handler/)): `void`

Defined in: [packages/pythonlib/src/logging.node.ts:206](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L206)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `handler` | [`Handler`](/python2ts/api/loggingnode/classes/handler/) |

#### Returns

`void`

***

### critical()

> **critical**(`msg`: `string`, ...`args`: `unknown`[]): `void`

Defined in: [packages/pythonlib/src/logging.node.ts:294](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L294)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `msg` | `string` |
| ...`args` | `unknown`[] |

#### Returns

`void`

***

### debug()

> **debug**(`msg`: `string`, ...`args`: `unknown`[]): `void`

Defined in: [packages/pythonlib/src/logging.node.ts:274](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L274)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `msg` | `string` |
| ...`args` | `unknown`[] |

#### Returns

`void`

***

### error()

> **error**(`msg`: `string`, ...`args`: `unknown`[]): `void`

Defined in: [packages/pythonlib/src/logging.node.ts:290](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L290)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `msg` | `string` |
| ...`args` | `unknown`[] |

#### Returns

`void`

***

### exception()

> **exception**(`msg`: `string`, ...`args`: `unknown`[]): `void`

Defined in: [packages/pythonlib/src/logging.node.ts:302](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L302)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `msg` | `string` |
| ...`args` | `unknown`[] |

#### Returns

`void`

***

### fatal()

> **fatal**(`msg`: `string`, ...`args`: `unknown`[]): `void`

Defined in: [packages/pythonlib/src/logging.node.ts:298](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L298)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `msg` | `string` |
| ...`args` | `unknown`[] |

#### Returns

`void`

***

### getEffectiveLevel()

> **getEffectiveLevel**(): `number`

Defined in: [packages/pythonlib/src/logging.node.ts:219](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L219)

#### Returns

`number`

***

### info()

> **info**(`msg`: `string`, ...`args`: `unknown`[]): `void`

Defined in: [packages/pythonlib/src/logging.node.ts:278](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L278)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `msg` | `string` |
| ...`args` | `unknown`[] |

#### Returns

`void`

***

### isEnabledFor()

> **isEnabledFor**(`level`: `number`): `boolean`

Defined in: [packages/pythonlib/src/logging.node.ts:231](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L231)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `level` | `number` |

#### Returns

`boolean`

***

### log()

> **log**(`level`: `number`, `msg`: `string`, ...`args`: `unknown`[]): `void`

Defined in: [packages/pythonlib/src/logging.node.ts:267](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L267)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `level` | `number` |
| `msg` | `string` |
| ...`args` | `unknown`[] |

#### Returns

`void`

***

### removeHandler()

> **removeHandler**(`handler`: [`Handler`](/python2ts/api/loggingnode/classes/handler/)): `void`

Defined in: [packages/pythonlib/src/logging.node.ts:212](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L212)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `handler` | [`Handler`](/python2ts/api/loggingnode/classes/handler/) |

#### Returns

`void`

***

### setLevel()

> **setLevel**(`level`: `number`): `void`

Defined in: [packages/pythonlib/src/logging.node.ts:202](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L202)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `level` | `number` |

#### Returns

`void`

***

### warn()

> **warn**(`msg`: `string`, ...`args`: `unknown`[]): `void`

Defined in: [packages/pythonlib/src/logging.node.ts:286](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L286)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `msg` | `string` |
| ...`args` | `unknown`[] |

#### Returns

`void`

***

### warning()

> **warning**(`msg`: `string`, ...`args`: `unknown`[]): `void`

Defined in: [packages/pythonlib/src/logging.node.ts:282](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/logging.node.ts#L282)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `msg` | `string` |
| ...`args` | `unknown`[] |

#### Returns

`void`

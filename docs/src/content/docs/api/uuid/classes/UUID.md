---
editUrl: false
next: false
prev: false
title: "UUID"
---

Defined in: [packages/pythonlib/src/uuid.ts:13](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/uuid.ts#L13)

UUID class representing a universally unique identifier.

## Constructors

### Constructor

> **new UUID**(`options`: `string` \| \{ `hex`: `string`; \} \| \{ `bytes`: `Uint8Array`; \} \| \{ `int`: `bigint`; \}): `UUID`

Defined in: [packages/pythonlib/src/uuid.ts:28](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/uuid.ts#L28)

Create a UUID from various input formats.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | `string` \| \{ `hex`: `string`; \} \| \{ `bytes`: `Uint8Array`; \} \| \{ `int`: `bigint`; \} |

#### Returns

`UUID`

## Accessors

### bytes

#### Get Signature

> **get** **bytes**(): `Uint8Array`

Defined in: [packages/pythonlib/src/uuid.ts:74](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/uuid.ts#L74)

The UUID as a 16-byte Uint8Array.

##### Returns

`Uint8Array`

***

### clockSeqHiVariant

#### Get Signature

> **get** **clockSeqHiVariant**(): `number`

Defined in: [packages/pythonlib/src/uuid.ts:168](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/uuid.ts#L168)

Get the clock_seq_hi_variant field.

##### Returns

`number`

***

### clockSeqLow

#### Get Signature

> **get** **clockSeqLow**(): `number`

Defined in: [packages/pythonlib/src/uuid.ts:175](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/uuid.ts#L175)

Get the clock_seq_low field.

##### Returns

`number`

***

### hex

#### Get Signature

> **get** **hex**(): `string`

Defined in: [packages/pythonlib/src/uuid.ts:63](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/uuid.ts#L63)

The UUID as a 32-character lowercase hexadecimal string.

##### Returns

`string`

***

### int

#### Get Signature

> **get** **int**(): `bigint`

Defined in: [packages/pythonlib/src/uuid.ts:81](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/uuid.ts#L81)

The UUID as a 128-bit integer.

##### Returns

`bigint`

***

### node

#### Get Signature

> **get** **node**(): `bigint`

Defined in: [packages/pythonlib/src/uuid.ts:182](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/uuid.ts#L182)

Get the node field (last 48 bits).

##### Returns

`bigint`

***

### timeHiVersion

#### Get Signature

> **get** **timeHiVersion**(): `number`

Defined in: [packages/pythonlib/src/uuid.ts:161](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/uuid.ts#L161)

Get the time_hi_version field (next 16 bits).

##### Returns

`number`

***

### timeLow

#### Get Signature

> **get** **timeLow**(): `number`

Defined in: [packages/pythonlib/src/uuid.ts:141](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/uuid.ts#L141)

Get the time_low field (first 32 bits).

##### Returns

`number`

***

### timeMid

#### Get Signature

> **get** **timeMid**(): `number`

Defined in: [packages/pythonlib/src/uuid.ts:154](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/uuid.ts#L154)

Get the time_mid field (next 16 bits).

##### Returns

`number`

***

### urn

#### Get Signature

> **get** **urn**(): `string`

Defined in: [packages/pythonlib/src/uuid.ts:123](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/uuid.ts#L123)

The UUID as a URN (urn:uuid:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).

##### Returns

`string`

***

### variant

#### Get Signature

> **get** **variant**(): `string`

Defined in: [packages/pythonlib/src/uuid.ts:99](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/uuid.ts#L99)

The variant (reserved bits).

##### Returns

`string`

***

### version

#### Get Signature

> **get** **version**(): `number`

Defined in: [packages/pythonlib/src/uuid.ts:92](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/uuid.ts#L92)

The version number (1 through 5, as an integer).

##### Returns

`number`

## Methods

### equals()

> **equals**(`other`: `UUID`): `boolean`

Defined in: [packages/pythonlib/src/uuid.ts:130](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/uuid.ts#L130)

Compare UUIDs for equality.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `other` | `UUID` |

#### Returns

`boolean`

***

### toString()

> **toString**(): `string`

Defined in: [packages/pythonlib/src/uuid.ts:115](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/uuid.ts#L115)

The UUID as a hyphenated string (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).

#### Returns

`string`

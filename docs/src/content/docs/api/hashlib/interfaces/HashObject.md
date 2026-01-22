---
editUrl: false
next: false
prev: false
title: "HashObject"
---

Defined in: [packages/pythonlib/src/hashlib.ts:18](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/hashlib.ts#L18)

Hash object interface mimicking Python's hash object.
Note: digest() and hexdigest() are async to support Web Crypto API.

## Properties

### blockSize

> `readonly` **blockSize**: `number`

Defined in: [packages/pythonlib/src/hashlib.ts:24](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/hashlib.ts#L24)

Internal block size in bytes

***

### digestSize

> `readonly` **digestSize**: `number`

Defined in: [packages/pythonlib/src/hashlib.ts:22](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/hashlib.ts#L22)

Digest size in bytes

***

### name

> `readonly` **name**: `string`

Defined in: [packages/pythonlib/src/hashlib.ts:20](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/hashlib.ts#L20)

Name of the hash algorithm

## Methods

### copy()

> **copy**(): `HashObject`

Defined in: [packages/pythonlib/src/hashlib.ts:32](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/hashlib.ts#L32)

Return a copy of the hash object

#### Returns

`HashObject`

***

### digest()

> **digest**(): `Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

Defined in: [packages/pythonlib/src/hashlib.ts:28](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/hashlib.ts#L28)

Return the digest as bytes (async)

#### Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

***

### hexdigest()

> **hexdigest**(): `Promise`\<`string`\>

Defined in: [packages/pythonlib/src/hashlib.ts:30](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/hashlib.ts#L30)

Return the digest as a hexadecimal string (async)

#### Returns

`Promise`\<`string`\>

***

### update()

> **update**(`data`: `string` \| `Uint8Array`\<`ArrayBufferLike`\>): `void`

Defined in: [packages/pythonlib/src/hashlib.ts:26](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/hashlib.ts#L26)

Update the hash with data (sync - buffers data)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `string` \| `Uint8Array`\<`ArrayBufferLike`\> |

#### Returns

`void`

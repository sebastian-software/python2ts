---
editUrl: false
next: false
prev: false
title: "pbkdf2Hmac"
---

> **pbkdf2Hmac**(`hashName`: `string`, `password`: `string` \| `Uint8Array`\<`ArrayBufferLike`\>, `salt`: `string` \| `Uint8Array`\<`ArrayBufferLike`\>, `iterations`: `number`, `dklen`: `number`): `Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

Defined in: [packages/pythonlib/src/hashlib.ts:324](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/hashlib.ts#L324)

Compute PBKDF2 key derivation.
Note: This is async to support Web Crypto API.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `hashName` | `string` | Name of the hash algorithm |
| `password` | `string` \| `Uint8Array`\<`ArrayBufferLike`\> | Password bytes |
| `salt` | `string` \| `Uint8Array`\<`ArrayBufferLike`\> | Salt bytes |
| `iterations` | `number` | Number of iterations |
| `dklen` | `number` | Derived key length in bytes |

## Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

Derived key as Uint8Array

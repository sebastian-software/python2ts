---
editUrl: false
next: false
prev: false
title: "scrypt"
---

> **scrypt**(`password`: `string` \| `Uint8Array`\<`ArrayBufferLike`\>, `salt`: `string` \| `Uint8Array`\<`ArrayBufferLike`\>, `n`: `number`, `r`: `number`, `p`: `number`, `dklen`: `number`): `Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

Defined in: [packages/pythonlib/src/hashlib.ts:378](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/hashlib.ts#L378)

Compute scrypt key derivation.
Note: scrypt is only available in Node.js, not in Web Crypto API.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `password` | `string` \| `Uint8Array`\<`ArrayBufferLike`\> | Password bytes |
| `salt` | `string` \| `Uint8Array`\<`ArrayBufferLike`\> | Salt bytes |
| `n` | `number` | CPU/memory cost parameter |
| `r` | `number` | Block size parameter |
| `p` | `number` | Parallelization parameter |
| `dklen` | `number` | Derived key length in bytes |

## Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

Derived key as Uint8Array

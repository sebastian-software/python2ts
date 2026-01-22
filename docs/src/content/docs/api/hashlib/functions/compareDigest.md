---
editUrl: false
next: false
prev: false
title: "compareDigest"
---

> **compareDigest**(`a`: `string` \| `Uint8Array`\<`ArrayBufferLike`\>, `b`: `string` \| `Uint8Array`\<`ArrayBufferLike`\>): `Promise`\<`boolean`\>

Defined in: [packages/pythonlib/src/hashlib.ts:411](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/hashlib.ts#L411)

Compare two byte sequences in constant time.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `a` | `string` \| `Uint8Array`\<`ArrayBufferLike`\> | First sequence |
| `b` | `string` \| `Uint8Array`\<`ArrayBufferLike`\> | Second sequence |

## Returns

`Promise`\<`boolean`\>

True if sequences are equal

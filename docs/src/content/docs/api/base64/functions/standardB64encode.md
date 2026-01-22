---
editUrl: false
next: false
prev: false
title: "standardB64encode"
---

> **standardB64encode**(`s`: `string` \| `Uint8Array`\<`ArrayBufferLike`\>): `Uint8Array`

Defined in: [packages/pythonlib/src/base64.ts:91](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/base64.ts#L91)

Encode bytes-like object using standard Base64 and return bytes.
This is identical to b64encode().

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `s` | `string` \| `Uint8Array`\<`ArrayBufferLike`\> | Bytes to encode |

## Returns

`Uint8Array`

Base64 encoded Uint8Array

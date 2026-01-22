---
editUrl: false
next: false
prev: false
title: "b64encode"
---

> **b64encode**(`s`: `string` \| `Uint8Array`\<`ArrayBufferLike`\>): `Uint8Array`

Defined in: [packages/pythonlib/src/base64.ts:59](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/base64.ts#L59)

Encode bytes-like object using Base64 and return bytes.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `s` | `string` \| `Uint8Array`\<`ArrayBufferLike`\> | Bytes to encode (Uint8Array or string) |

## Returns

`Uint8Array`

Base64 encoded Uint8Array

## Example

```typescript
const encoded = b64encode(new TextEncoder().encode("hello"))
console.log(new TextDecoder().decode(encoded)) // "aGVsbG8="
```

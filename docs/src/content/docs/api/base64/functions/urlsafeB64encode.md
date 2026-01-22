---
editUrl: false
next: false
prev: false
title: "urlsafeB64encode"
---

> **urlsafeB64encode**(`s`: `string` \| `Uint8Array`\<`ArrayBufferLike`\>): `Uint8Array`

Defined in: [packages/pythonlib/src/base64.ts:121](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/base64.ts#L121)

Encode bytes-like object using URL-safe Base64 and return bytes.

URL-safe Base64 uses - instead of + and _ instead of /,
and omits padding characters.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `s` | `string` \| `Uint8Array`\<`ArrayBufferLike`\> | Bytes to encode |

## Returns

`Uint8Array`

URL-safe Base64 encoded Uint8Array

## Example

```typescript
const encoded = urlsafeB64encode(new Uint8Array([255, 239]))
// Uses - and _ instead of + and /
```

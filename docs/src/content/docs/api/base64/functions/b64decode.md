---
editUrl: false
next: false
prev: false
title: "b64decode"
---

> **b64decode**(`s`: `string` \| `Uint8Array`\<`ArrayBufferLike`\>): `Uint8Array`

Defined in: [packages/pythonlib/src/base64.ts:77](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/base64.ts#L77)

Decode Base64 encoded bytes-like object or ASCII string and return bytes.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `s` | `string` \| `Uint8Array`\<`ArrayBufferLike`\> | Base64 encoded data (Uint8Array or string) |

## Returns

`Uint8Array`

Decoded Uint8Array

## Example

```typescript
const decoded = b64decode("aGVsbG8=")
console.log(new TextDecoder().decode(decoded)) // "hello"
```

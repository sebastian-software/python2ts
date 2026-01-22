---
editUrl: false
next: false
prev: false
title: "newHash"
---

> **newHash**(`name`: `string`, `data?`: `string` \| `Uint8Array`\<`ArrayBufferLike`\>): [`HashObject`](/python2ts/api/hashlib/interfaces/hashobject/)

Defined in: [packages/pythonlib/src/hashlib.ts:170](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/hashlib.ts#L170)

Create a new hash object for the given algorithm.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | Name of the hash algorithm (e.g., "sha256", "md5") |
| `data?` | `string` \| `Uint8Array`\<`ArrayBufferLike`\> | Optional initial data to hash |

## Returns

[`HashObject`](/python2ts/api/hashlib/interfaces/hashobject/)

A hash object

## Example

```typescript
const h = newHash("sha256")
h.update("hello")
console.log(await h.hexdigest())
```

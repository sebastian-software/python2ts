---
editUrl: false
next: false
prev: false
title: "md5"
---

> **md5**(`data?`: `string` \| `Uint8Array`\<`ArrayBufferLike`\>): [`HashObject`](/python2ts/api/hashlib/interfaces/hashobject/)

Defined in: [packages/pythonlib/src/hashlib.ts:191](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/hashlib.ts#L191)

Create a new MD5 hash object.
Note: MD5 is not available in Web Crypto API (browser).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data?` | `string` \| `Uint8Array`\<`ArrayBufferLike`\> | Optional initial data to hash |

## Returns

[`HashObject`](/python2ts/api/hashlib/interfaces/hashobject/)

An MD5 hash object

## Example

```typescript
const h = md5("hello")
console.log(await h.hexdigest()) // "5d41402abc4b2a76b9719d911017c592"
```

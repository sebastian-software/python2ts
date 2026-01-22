---
editUrl: false
next: false
prev: false
title: "blake2b"
---

> **blake2b**(`data?`: `string` \| `Uint8Array`\<`ArrayBufferLike`\>): [`HashObject`](/python2ts/api/hashlib/interfaces/hashobject/)

Defined in: [packages/pythonlib/src/hashlib.ts:275](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/hashlib.ts#L275)

Create a new BLAKE2b hash object.
Note: BLAKE2 is not available in Web Crypto API (browser).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data?` | `string` \| `Uint8Array`\<`ArrayBufferLike`\> | Optional initial data to hash |

## Returns

[`HashObject`](/python2ts/api/hashlib/interfaces/hashobject/)

A BLAKE2b hash object

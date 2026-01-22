---
editUrl: false
next: false
prev: false
title: "copyfileobj"
---

> **copyfileobj**(`fsrc`: `ReadStream` \| `ReadableStream`, `fdst`: `WriteStream` \| `WritableStream`, `length?`: `number`): `void`

Defined in: [packages/pythonlib/src/shutil.node.ts:288](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/shutil.node.ts#L288)

Copy data from a file-like object to another file-like object.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fsrc` | `ReadStream` \| `ReadableStream` | Source readable stream |
| `fdst` | `WriteStream` \| `WritableStream` | Destination writable stream |
| `length?` | `number` | Number of bytes to copy (optional, copies all if not specified) |

## Returns

`void`

---
editUrl: false
next: false
prev: false
title: "fileDigest"
---

> **fileDigest**(`path`: `string`, `algorithm`: `string`): `Promise`\<`string`\>

Defined in: [packages/pythonlib/src/hashlib.ts:449](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/hashlib.ts#L449)

Generate a file hash.
Note: Only available in Node.js.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `path` | `string` | `undefined` | File path |
| `algorithm` | `string` | `"sha256"` | Hash algorithm name |

## Returns

`Promise`\<`string`\>

Hash as hex string

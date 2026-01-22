---
editUrl: false
next: false
prev: false
title: "which"
---

> **which**(`cmd`: `string`, `path?`: `string`): `Promise`\<`string` \| `null`\>

Defined in: [packages/pythonlib/src/shutil.node.ts:188](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/shutil.node.ts#L188)

Return the path to an executable which would be run if the given cmd was called.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `cmd` | `string` | Command name to find |
| `path?` | `string` | Optional PATH string to search (defaults to process.env.PATH) |

## Returns

`Promise`\<`string` \| `null`\>

Path to the executable, or null if not found

---
editUrl: false
next: false
prev: false
title: "rglob"
---

> **rglob**(`pattern`: `string`, `rootDir`: `string`): `Promise`\<`string`[]\>

Defined in: [packages/pythonlib/src/glob.node.ts:235](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/glob.node.ts#L235)

Return a list of all files matching pattern in directory and subdirectories.
This is an alias for glob with recursive=true.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `pattern` | `string` | `undefined` | The glob pattern (without **) |
| `rootDir` | `string` | `"."` | Root directory to search from |

## Returns

`Promise`\<`string`[]\>

Promise of array of matching paths

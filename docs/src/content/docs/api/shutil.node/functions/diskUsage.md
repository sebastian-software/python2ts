---
editUrl: false
next: false
prev: false
title: "diskUsage"
---

> **diskUsage**(`path`: `string`): `Promise`\<[`DiskUsage`](/python2ts/api/shutilnode/interfaces/diskusage/)\>

Defined in: [packages/pythonlib/src/shutil.node.ts:222](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/shutil.node.ts#L222)

Return disk usage statistics for the given path.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | Path to check |

## Returns

`Promise`\<[`DiskUsage`](/python2ts/api/shutilnode/interfaces/diskusage/)\>

Object with total, used, and free bytes

---
editUrl: false
next: false
prev: false
title: "uuid1"
---

> **uuid1**(`node?`: `bigint`, `clockSeq?`: `number`): [`UUID`](/python2ts/api/uuid/classes/uuid/)

Defined in: [packages/pythonlib/src/uuid.ts:242](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/uuid.ts#L242)

Generate a UUID based on host ID and current time (version 1).

Note: In browser environments, the node ID is randomly generated
since MAC addresses are not accessible.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `node?` | `bigint` | Optional 48-bit node ID (defaults to random) |
| `clockSeq?` | `number` | Optional 14-bit clock sequence (defaults to random) |

## Returns

[`UUID`](/python2ts/api/uuid/classes/uuid/)

A new time-based UUID

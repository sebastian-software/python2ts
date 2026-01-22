---
editUrl: false
next: false
prev: false
title: "uuid3"
---

> **uuid3**(`_namespace`: [`UUID`](/python2ts/api/uuid/classes/uuid/), `_name`: `string`): [`UUID`](/python2ts/api/uuid/classes/uuid/)

Defined in: [packages/pythonlib/src/uuid.ts:314](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/uuid.ts#L314)

Generate a UUID based on the MD5 hash of a namespace identifier and a name (version 3).

## Parameters

| Parameter | Type |
| ------ | ------ |
| `_namespace` | [`UUID`](/python2ts/api/uuid/classes/uuid/) |
| `_name` | `string` |

## Returns

[`UUID`](/python2ts/api/uuid/classes/uuid/)

A new name-based UUID using MD5

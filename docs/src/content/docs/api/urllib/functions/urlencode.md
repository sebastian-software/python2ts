---
editUrl: false
next: false
prev: false
title: "urlencode"
---

> **urlencode**(`query`: \[`string`, `string`\][] \| `Record`\<`string`, `string` \| `string`[]\>, `doseq`: `boolean`): `string`

Defined in: [packages/pythonlib/src/urllib.ts:177](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/urllib.ts#L177)

Encode a dictionary or sequence of tuples as a query string.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `query` | \[`string`, `string`\][] \| `Record`\<`string`, `string` \| `string`[]\> | `undefined` | Query parameters as object or array of tuples |
| `doseq` | `boolean` | `false` | If true, treat sequence values as separate parameters |

## Returns

`string`

URL-encoded query string

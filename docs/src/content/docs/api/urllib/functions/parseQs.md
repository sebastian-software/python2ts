---
editUrl: false
next: false
prev: false
title: "parseQs"
---

> **parseQs**(`qs`: `string`, `keepBlankValues`: `boolean`): `Record`\<`string`, `string`[]\>

Defined in: [packages/pythonlib/src/urllib.ts:211](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/urllib.ts#L211)

Parse a query string into a dictionary.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `qs` | `string` | `undefined` | Query string to parse |
| `keepBlankValues` | `boolean` | `false` | Whether to keep blank values |

## Returns

`Record`\<`string`, `string`[]\>

Object mapping keys to arrays of values

---
editUrl: false
next: false
prev: false
title: "load"
---

> **load**(`fp`: `object`, `options?`: `LoadsOptions`): `unknown`

Defined in: [packages/pythonlib/src/json.ts:177](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/json.ts#L177)

Deserialize a JSON string from file to a Python object.
Note: This is a no-op in browser environments.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fp` | \{ `read`: () => `string`; \} | File-like object with read method |
| `fp.read` | () => `string` | - |
| `options?` | `LoadsOptions` | Deserialization options |

## Returns

`unknown`

Parsed object

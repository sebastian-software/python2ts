---
editUrl: false
next: false
prev: false
title: "dump"
---

> **dump**(`obj`: `unknown`, `fp`: `object`, `options?`: `DumpsOptions`): `void`

Defined in: [packages/pythonlib/src/json.ts:160](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/json.ts#L160)

Serialize obj to a JSON formatted string and write to file.
Note: This is a no-op in browser environments.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `obj` | `unknown` | The object to serialize |
| `fp` | \{ `write`: (`s`: `string`) => `void`; \} | File-like object with write method |
| `fp.write` | (`s`: `string`) => `void` | - |
| `options?` | `DumpsOptions` | Serialization options |

## Returns

`void`

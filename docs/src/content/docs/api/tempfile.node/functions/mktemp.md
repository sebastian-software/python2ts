---
editUrl: false
next: false
prev: false
title: "mktemp"
---

> **mktemp**(`suffix`: `string`, `prefix`: `string`, `dir?`: `string`): `string`

Defined in: [packages/pythonlib/src/tempfile.node.ts:37](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/tempfile.node.ts#L37)

Generate a unique temporary file path (but don't create the file).

Note: This is deprecated in Python but still useful in some cases.
Consider using mkstemp() or NamedTemporaryFile() instead.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `suffix` | `string` | `""` | Optional suffix for the filename |
| `prefix` | `string` | `"tmp"` | Optional prefix for the filename (default: "tmp") |
| `dir?` | `string` | `undefined` | Optional directory (default: system temp dir) |

## Returns

`string`

Path to the temporary file

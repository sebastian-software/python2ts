---
editUrl: false
next: false
prev: false
title: "mkstemp"
---

> **mkstemp**(`suffix`: `string`, `prefix`: `string`, `dir?`: `string`, `_text?`: `boolean`): `Promise`\<\[`FileHandle`, `string`\]\>

Defined in: [packages/pythonlib/src/tempfile.node.ts:59](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/tempfile.node.ts#L59)

Create a temporary file and return a tuple of (handle, path).

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `suffix` | `string` | `""` | Optional suffix for the filename |
| `prefix` | `string` | `"tmp"` | Optional prefix for the filename (default: "tmp") |
| `dir?` | `string` | `undefined` | Optional directory (default: system temp dir) |
| `_text?` | `boolean` | `false` | - |

## Returns

`Promise`\<\[`FileHandle`, `string`\]\>

Promise of tuple [FileHandle, path]

## Example

```typescript
const [handle, path] = await mkstemp(".txt", "myapp-")
await handle.write(Buffer.from("data"))
await handle.close()
```

---
editUrl: false
next: false
prev: false
title: "mkdtemp"
---

> **mkdtemp**(`suffix`: `string`, `prefix`: `string`, `dir?`: `string`): `Promise`\<`string`\>

Defined in: [packages/pythonlib/src/tempfile.node.ts:89](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/tempfile.node.ts#L89)

Create a temporary directory and return its path.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `suffix` | `string` | `""` | Optional suffix for the directory name |
| `prefix` | `string` | `"tmp"` | Optional prefix for the directory name (default: "tmp") |
| `dir?` | `string` | `undefined` | Optional parent directory (default: system temp dir) |

## Returns

`Promise`\<`string`\>

Promise of path to the created directory

## Example

```typescript
const dir = await mkdtemp("", "myapp-")
// Use directory...
await rm(dir, { recursive: true })
```

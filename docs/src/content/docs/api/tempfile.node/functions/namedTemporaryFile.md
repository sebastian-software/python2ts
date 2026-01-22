---
editUrl: false
next: false
prev: false
title: "namedTemporaryFile"
---

> **namedTemporaryFile**(`options?`: `object`): `Promise`\<[`NamedTemporaryFile`](/python2ts/api/tempfilenode/classes/namedtemporaryfile/)\>

Defined in: [packages/pythonlib/src/tempfile.node.ts:259](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/tempfile.node.ts#L259)

Create a temporary file that is automatically deleted when closed.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | \{ `delete?`: `boolean`; `dir?`: `string`; `mode?`: `string`; `prefix?`: `string`; `suffix?`: `string`; \} | Options for creating the file |
| `options.delete?` | `boolean` | - |
| `options.dir?` | `string` | - |
| `options.mode?` | `string` | - |
| `options.prefix?` | `string` | - |
| `options.suffix?` | `string` | - |

## Returns

`Promise`\<[`NamedTemporaryFile`](/python2ts/api/tempfilenode/classes/namedtemporaryfile/)\>

Promise of NamedTemporaryFile object

---
editUrl: false
next: false
prev: false
title: "temporaryDirectory"
---

> **temporaryDirectory**(`options?`: `object`): `Promise`\<[`TemporaryDirectory`](/python2ts/api/tempfilenode/classes/temporarydirectory/)\>

Defined in: [packages/pythonlib/src/tempfile.node.ts:275](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/tempfile.node.ts#L275)

Create a temporary directory that is automatically cleaned up.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | \{ `dir?`: `string`; `prefix?`: `string`; `suffix?`: `string`; \} | Options for creating the directory |
| `options.dir?` | `string` | - |
| `options.prefix?` | `string` | - |
| `options.suffix?` | `string` | - |

## Returns

`Promise`\<[`TemporaryDirectory`](/python2ts/api/tempfilenode/classes/temporarydirectory/)\>

Promise of TemporaryDirectory object

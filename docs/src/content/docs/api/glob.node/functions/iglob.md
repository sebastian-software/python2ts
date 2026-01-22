---
editUrl: false
next: false
prev: false
title: "iglob"
---

> **iglob**(`pattern`: `string`, `options?`: `object`): `AsyncGenerator`\<`string`\>

Defined in: [packages/pythonlib/src/glob.node.ts:124](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/glob.node.ts#L124)

Return an async iterator of paths matching a pathname pattern.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `pattern` | `string` | The glob pattern |
| `options?` | \{ `includeHidden?`: `boolean`; `recursive?`: `boolean`; `rootDir?`: `string`; \} | Options object |
| `options.includeHidden?` | `boolean` | - |
| `options.recursive?` | `boolean` | - |
| `options.rootDir?` | `string` | - |

## Returns

`AsyncGenerator`\<`string`\>

AsyncGenerator of matching paths

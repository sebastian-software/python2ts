---
editUrl: false
next: false
prev: false
title: "copytree"
---

> **copytree**(`src`: `string`, `dst`: `string`, `options?`: `object`): `Promise`\<`string`\>

Defined in: [packages/pythonlib/src/shutil.node.ts:78](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/shutil.node.ts#L78)

Recursively copy an entire directory tree.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `src` | `string` | Source directory path |
| `dst` | `string` | Destination directory path |
| `options?` | \{ `copyFunction?`: (`src`: `string`, `dst`: `string`) => `Promise`\<`void`\>; `dirsExistOk?`: `boolean`; `ignore?`: (`dir`: `string`, `names`: `string`[]) => `string`[]; `symlinkss?`: `boolean`; \} | Options object |
| `options.copyFunction?` | (`src`: `string`, `dst`: `string`) => `Promise`\<`void`\> | - |
| `options.dirsExistOk?` | `boolean` | - |
| `options.ignore?` | (`dir`: `string`, `names`: `string`[]) => `string`[] | - |
| `options.symlinkss?` | `boolean` | - |

## Returns

`Promise`\<`string`\>

The destination directory path

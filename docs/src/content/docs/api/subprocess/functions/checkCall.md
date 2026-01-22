---
editUrl: false
next: false
prev: false
title: "checkCall"
---

> **checkCall**(`args`: `string` \| `string`[], `options?`: [`SubprocessOptions`](/python2ts/api/subprocess/interfaces/subprocessoptions/)): `number`

Defined in: [packages/pythonlib/src/subprocess.ts:235](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L235)

Run a command and raise CalledProcessError if it returns non-zero.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | `string` \| `string`[] | Command and arguments |
| `options?` | [`SubprocessOptions`](/python2ts/api/subprocess/interfaces/subprocessoptions/) | Subprocess options |

## Returns

`number`

Exit code (always 0 if no exception)

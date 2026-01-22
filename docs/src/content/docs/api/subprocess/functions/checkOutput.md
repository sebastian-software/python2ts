---
editUrl: false
next: false
prev: false
title: "checkOutput"
---

> **checkOutput**(`args`: `string` \| `string`[], `options?`: [`SubprocessOptions`](/python2ts/api/subprocess/interfaces/subprocessoptions/)): `string`

Defined in: [packages/pythonlib/src/subprocess.ts:247](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L247)

Run a command and return its output, raising CalledProcessError if it returns non-zero.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | `string` \| `string`[] | Command and arguments |
| `options?` | [`SubprocessOptions`](/python2ts/api/subprocess/interfaces/subprocessoptions/) | Subprocess options |

## Returns

`string`

Captured stdout

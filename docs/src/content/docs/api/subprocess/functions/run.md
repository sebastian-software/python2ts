---
editUrl: false
next: false
prev: false
title: "run"
---

> **run**(`args`: `string` \| `string`[], `options?`: [`SubprocessOptions`](/python2ts/api/subprocess/interfaces/subprocessoptions/)): [`CompletedProcess`](/python2ts/api/subprocess/interfaces/completedprocess/)

Defined in: [packages/pythonlib/src/subprocess.ts:138](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L138)

Run a command and wait for it to complete.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | `string` \| `string`[] | Command and arguments (or a single string if shell=true) |
| `options?` | [`SubprocessOptions`](/python2ts/api/subprocess/interfaces/subprocessoptions/) | Subprocess options |

## Returns

[`CompletedProcess`](/python2ts/api/subprocess/interfaces/completedprocess/)

CompletedProcess with exit code and captured output

## Example

```typescript
// Run a simple command
const result = run(["ls", "-la"])

// Run with shell
const result = run("echo hello && echo world", { shell: true })

// Capture output
const result = run(["git", "status"], { stdout: PIPE })
console.log(result.stdout)

// Check for errors
const result = run(["false"], { check: true }) // Throws CalledProcessError
```

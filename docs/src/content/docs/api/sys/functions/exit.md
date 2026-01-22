---
editUrl: false
next: false
prev: false
title: "exit"
---

> **exit**(`code?`: `number`): `never`

Defined in: [packages/pythonlib/src/sys.ts:131](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/sys.ts#L131)

Exit from Python (terminate the process).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `code?` | `number` | Optional exit status code (default: 0 for success) |

## Returns

`never`

## Throws

This function never returns; it terminates the process.

## Example

```typescript
exit()    // Exit with success
exit(1)   // Exit with error code 1
```

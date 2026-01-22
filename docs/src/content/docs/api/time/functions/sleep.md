---
editUrl: false
next: false
prev: false
title: "sleep"
---

> **sleep**(`secs`: `number`): `void`

Defined in: [packages/pythonlib/src/time.ts:80](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/time.ts#L80)

Suspend execution for the given number of seconds.
WARNING: This uses a synchronous busy-wait that blocks the event loop.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `secs` | `number` | Number of seconds to sleep (can be fractional) |

## Returns

`void`

## Example

```typescript
sleep(0.5) // Sleep for 500 milliseconds
```

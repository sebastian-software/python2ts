---
editUrl: false
next: false
prev: false
title: "perfCounter"
---

> **perfCounter**(): `number`

Defined in: [packages/pythonlib/src/time.ts:100](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/time.ts#L100)

Return the value of a performance counter (monotonic clock).
Uses performance.now() for high precision.

## Returns

`number`

Seconds as a float (relative to an undefined reference point)

## Example

```typescript
const start = perfCounter()
// ... do work ...
const elapsed = perfCounter() - start
```

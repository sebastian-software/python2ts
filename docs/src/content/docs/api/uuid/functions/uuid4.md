---
editUrl: false
next: false
prev: false
title: "uuid4"
---

> **uuid4**(): [`UUID`](/python2ts/api/uuid/classes/uuid/)

Defined in: [packages/pythonlib/src/uuid.ts:205](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/uuid.ts#L205)

Generate a random UUID (version 4).

Uses crypto.randomUUID() when available, otherwise falls back to
crypto.getRandomValues().

## Returns

[`UUID`](/python2ts/api/uuid/classes/uuid/)

A new random UUID

## Example

```typescript
const id = uuid4()
console.log(id.toString()) // "550e8400-e29b-41d4-a716-446655440000"
```

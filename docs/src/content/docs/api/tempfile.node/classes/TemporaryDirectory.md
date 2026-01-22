---
editUrl: false
next: false
prev: false
title: "TemporaryDirectory"
---

Defined in: [packages/pythonlib/src/tempfile.node.ts:216](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/tempfile.node.ts#L216)

A temporary directory that cleans itself up.

Use the static `create()` method to instantiate (constructors cannot be async).

## Example

```typescript
const tmp = await TemporaryDirectory.create({ prefix: "myapp-" })
// Use tmp.name as directory path...
await tmp.cleanup() // Removes directory and contents
```

## Properties

### name

> `readonly` **name**: `string`

Defined in: [packages/pythonlib/src/tempfile.node.ts:218](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/tempfile.node.ts#L218)

The directory path

## Methods

### cleanup()

> **cleanup**(): `Promise`\<`void`\>

Defined in: [packages/pythonlib/src/tempfile.node.ts:241](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/tempfile.node.ts#L241)

Remove the temporary directory and its contents.

#### Returns

`Promise`\<`void`\>

***

### create()

> `static` **create**(`options?`: `object`): `Promise`\<`TemporaryDirectory`\>

Defined in: [packages/pythonlib/src/tempfile.node.ts:229](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/tempfile.node.ts#L229)

Create a new TemporaryDirectory.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | \{ `dir?`: `string`; `prefix?`: `string`; `suffix?`: `string`; \} |
| `options.dir?` | `string` |
| `options.prefix?` | `string` |
| `options.suffix?` | `string` |

#### Returns

`Promise`\<`TemporaryDirectory`\>

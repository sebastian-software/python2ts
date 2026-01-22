---
editUrl: false
next: false
prev: false
title: "NamedTemporaryFile"
---

Defined in: [packages/pythonlib/src/tempfile.node.ts:110](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/tempfile.node.ts#L110)

A named temporary file with async operations.

Use the static `create()` method to instantiate (constructors cannot be async).

## Example

```typescript
const tmp = await NamedTemporaryFile.create({ suffix: ".txt" })
await tmp.write("hello world")
await tmp.close() // File is deleted if deleteOnClose is true
```

## Properties

### deleteOnClose

> `readonly` **deleteOnClose**: `boolean`

Defined in: [packages/pythonlib/src/tempfile.node.ts:116](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/tempfile.node.ts#L116)

Whether to delete the file on close

***

### handle

> `readonly` **handle**: `FileHandle`

Defined in: [packages/pythonlib/src/tempfile.node.ts:112](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/tempfile.node.ts#L112)

The file handle

***

### name

> `readonly` **name**: `string`

Defined in: [packages/pythonlib/src/tempfile.node.ts:114](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/tempfile.node.ts#L114)

The file path

## Accessors

### closed

#### Get Signature

> **get** **closed**(): `boolean`

Defined in: [packages/pythonlib/src/tempfile.node.ts:199](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/tempfile.node.ts#L199)

Check if the file is closed.

##### Returns

`boolean`

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [packages/pythonlib/src/tempfile.node.ts:182](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/tempfile.node.ts#L182)

Close the file.

#### Returns

`Promise`\<`void`\>

***

### flush()

> **flush**(): `Promise`\<`void`\>

Defined in: [packages/pythonlib/src/tempfile.node.ts:175](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/tempfile.node.ts#L175)

Flush the file buffer.

#### Returns

`Promise`\<`void`\>

***

### read()

> **read**(`size?`: `number`): `Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

Defined in: [packages/pythonlib/src/tempfile.node.ts:156](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/tempfile.node.ts#L156)

Read data from the file.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `size?` | `number` |

#### Returns

`Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

***

### seek()

> **seek**(`_offset`: `number`, `_whence`: `number`): `void`

Defined in: [packages/pythonlib/src/tempfile.node.ts:167](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/tempfile.node.ts#L167)

Seek to a position in the file.

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `_offset` | `number` | `undefined` |
| `_whence` | `number` | `0` |

#### Returns

`void`

***

### write()

> **write**(`data`: `string` \| `Uint8Array`\<`ArrayBufferLike`\>): `Promise`\<`number`\>

Defined in: [packages/pythonlib/src/tempfile.node.ts:148](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/tempfile.node.ts#L148)

Write data to the file.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `string` \| `Uint8Array`\<`ArrayBufferLike`\> |

#### Returns

`Promise`\<`number`\>

***

### create()

> `static` **create**(`options?`: `object`): `Promise`\<`NamedTemporaryFile`\>

Defined in: [packages/pythonlib/src/tempfile.node.ts:129](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/tempfile.node.ts#L129)

Create a new NamedTemporaryFile.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | \{ `delete?`: `boolean`; `dir?`: `string`; `mode?`: `string`; `prefix?`: `string`; `suffix?`: `string`; \} |
| `options.delete?` | `boolean` |
| `options.dir?` | `string` |
| `options.mode?` | `string` |
| `options.prefix?` | `string` |
| `options.suffix?` | `string` |

#### Returns

`Promise`\<`NamedTemporaryFile`\>

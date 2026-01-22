---
editUrl: false
next: false
prev: false
title: "deque"
---

Defined in: [packages/pythonlib/src/collections.ts:136](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/collections.ts#L136)

deque: double-ended queue with O(1) append and pop from both ends

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Constructors

### Constructor

> **new deque**\<`T`\>(`iterable?`: `Iterable`\<`T`, `any`, `any`\>, `maxlen?`: `number`): `deque`\<`T`\>

Defined in: [packages/pythonlib/src/collections.ts:140](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/collections.ts#L140)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `iterable?` | `Iterable`\<`T`, `any`, `any`\> |
| `maxlen?` | `number` |

#### Returns

`deque`\<`T`\>

## Accessors

### length

#### Get Signature

> **get** **length**(): `number`

Defined in: [packages/pythonlib/src/collections.ts:228](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/collections.ts#L228)

Number of elements

##### Returns

`number`

## Methods

### \[iterator\]()

> **\[iterator\]**(): `Generator`\<`T`\>

Defined in: [packages/pythonlib/src/collections.ts:235](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/collections.ts#L235)

Make iterable

#### Returns

`Generator`\<`T`\>

***

### append()

> **append**(`x`: `T`): `void`

Defined in: [packages/pythonlib/src/collections.ts:151](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/collections.ts#L151)

Add element to the right end

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `x` | `T` |

#### Returns

`void`

***

### appendLeft()

> **appendLeft**(`x`: `T`): `void`

Defined in: [packages/pythonlib/src/collections.ts:161](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/collections.ts#L161)

Add element to the left end

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `x` | `T` |

#### Returns

`void`

***

### clear()

> **clear**(): `void`

Defined in: [packages/pythonlib/src/collections.ts:221](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/collections.ts#L221)

Remove all elements

#### Returns

`void`

***

### extend()

> **extend**(`iterable`: `Iterable`\<`T`\>): `void`

Defined in: [packages/pythonlib/src/collections.ts:185](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/collections.ts#L185)

Extend the right side with elements from iterable

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `iterable` | `Iterable`\<`T`\> |

#### Returns

`void`

***

### extendLeft()

> **extendLeft**(`iterable`: `Iterable`\<`T`\>): `void`

Defined in: [packages/pythonlib/src/collections.ts:194](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/collections.ts#L194)

Extend the left side with elements from iterable

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `iterable` | `Iterable`\<`T`\> |

#### Returns

`void`

***

### pop()

> **pop**(): `T` \| `undefined`

Defined in: [packages/pythonlib/src/collections.ts:171](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/collections.ts#L171)

Remove and return element from the right end

#### Returns

`T` \| `undefined`

***

### popLeft()

> **popLeft**(): `T` \| `undefined`

Defined in: [packages/pythonlib/src/collections.ts:178](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/collections.ts#L178)

Remove and return element from the left end

#### Returns

`T` \| `undefined`

***

### rotate()

> **rotate**(`n`: `number`): `void`

Defined in: [packages/pythonlib/src/collections.ts:203](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/collections.ts#L203)

Rotate the deque n steps to the right (negative n rotates left)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `n` | `number` | `1` |

#### Returns

`void`

***

### toArray()

> **toArray**(): `T`[]

Defined in: [packages/pythonlib/src/collections.ts:242](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/collections.ts#L242)

Convert to array

#### Returns

`T`[]

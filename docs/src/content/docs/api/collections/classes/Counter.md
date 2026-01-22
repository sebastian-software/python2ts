---
editUrl: false
next: false
prev: false
title: "Counter"
---

Defined in: [packages/pythonlib/src/collections.ts:17](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/collections.ts#L17)

Counter: a dict subclass for counting hashable objects

Elements are stored as keys and their counts are stored as values.

## Extends

- `Map`\<`T`, `number`\>

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Constructors

### Constructor

> **new Counter**\<`T`\>(`iterable?`: `Iterable`\<`T`, `any`, `any`\>): `Counter`\<`T`\>

Defined in: [packages/pythonlib/src/collections.ts:18](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/collections.ts#L18)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `iterable?` | `Iterable`\<`T`, `any`, `any`\> |

#### Returns

`Counter`\<`T`\>

#### Overrides

`Map<T, number>.constructor`

## Properties

### \[toStringTag\]

> `readonly` **\[toStringTag\]**: `string`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:137

#### Inherited from

`Map.[toStringTag]`

***

### size

> `readonly` **size**: `number`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es2015.collection.d.ts:45

#### Returns

the number of elements in the Map.

#### Inherited from

`Map.size`

***

### \[species\]

> `readonly` `static` **\[species\]**: `MapConstructor`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:319

#### Inherited from

`Map.[species]`

## Methods

### \[iterator\]()

> **\[iterator\]**(): `MapIterator`\<\[`T`, `number`\]\>

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es2015.iterable.d.ts:143

Returns an iterable of entries in the map.

#### Returns

`MapIterator`\<\[`T`, `number`\]\>

#### Inherited from

`Map.[iterator]`

***

### clear()

> **clear**(): `void`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es2015.collection.d.ts:20

#### Returns

`void`

#### Inherited from

`Map.clear`

***

### delete()

> **delete**(`key`: `T`): `boolean`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es2015.collection.d.ts:24

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `T` |

#### Returns

`boolean`

true if an element in the Map existed and has been removed, or false if the element does not exist.

#### Inherited from

`Map.delete`

***

### elements()

> **elements**(): `Generator`\<`T`\>

Defined in: [packages/pythonlib/src/collections.ts:54](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/collections.ts#L54)

Iterate over elements, repeating each as many times as its count

#### Returns

`Generator`\<`T`\>

***

### entries()

> **entries**(): `MapIterator`\<\[`T`, `number`\]\>

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es2015.iterable.d.ts:148

Returns an iterable of key, value pairs for every entry in the map.

#### Returns

`MapIterator`\<\[`T`, `number`\]\>

#### Inherited from

`Map.entries`

***

### forEach()

> **forEach**(`callbackfn`: (`value`: `number`, `key`: `T`, `map`: `Map`\<`T`, `number`\>) => `void`, `thisArg?`: `any`): `void`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es2015.collection.d.ts:28

Executes a provided function once per each key/value pair in the Map, in insertion order.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `callbackfn` | (`value`: `number`, `key`: `T`, `map`: `Map`\<`T`, `number`\>) => `void` |
| `thisArg?` | `any` |

#### Returns

`void`

#### Inherited from

`Map.forEach`

***

### get()

> **get**(`key`: `T`): `number`

Defined in: [packages/pythonlib/src/collections.ts:37](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/collections.ts#L37)

Get the count for a key (returns 0 for missing keys)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `T` |

#### Returns

`number`

#### Overrides

`Map.get`

***

### has()

> **has**(`key`: `T`): `boolean`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es2015.collection.d.ts:37

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `T` |

#### Returns

`boolean`

boolean indicating whether an element with the specified key exists or not.

#### Inherited from

`Map.has`

***

### increment()

> **increment**(`key`: `T`, `n`: `number`): `void`

Defined in: [packages/pythonlib/src/collections.ts:30](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/collections.ts#L30)

Increment the count for a key

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `key` | `T` | `undefined` |
| `n` | `number` | `1` |

#### Returns

`void`

***

### keys()

> **keys**(): `MapIterator`\<`T`\>

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es2015.iterable.d.ts:153

Returns an iterable of keys in the map

#### Returns

`MapIterator`\<`T`\>

#### Inherited from

`Map.keys`

***

### mostCommon()

> **mostCommon**(`n?`: `number`): \[`T`, `number`\][]

Defined in: [packages/pythonlib/src/collections.ts:46](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/collections.ts#L46)

List the n most common elements and their counts
If n is undefined, list all elements from most common to least
Uses ES2023 Array.prototype.toSorted() for immutable sorting

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `n?` | `number` |

#### Returns

\[`T`, `number`\][]

***

### set()

> **set**(`key`: `T`, `value`: `number`): `this`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es2015.collection.d.ts:41

Adds a new element with a specified key and value to the Map. If an element with the same key already exists, the element will be updated.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `T` |
| `value` | `number` |

#### Returns

`this`

#### Inherited from

`Map.set`

***

### subtract()

> **subtract**(`iterable`: `Counter`\<`T`\> \| `Iterable`\<`T`, `any`, `any`\>): `void`

Defined in: [packages/pythonlib/src/collections.ts:65](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/collections.ts#L65)

Subtract counts from another iterable or Counter

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `iterable` | `Counter`\<`T`\> \| `Iterable`\<`T`, `any`, `any`\> |

#### Returns

`void`

***

### total()

> **total**(): `number`

Defined in: [packages/pythonlib/src/collections.ts:95](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/collections.ts#L95)

Return total count of all elements

#### Returns

`number`

***

### update()

> **update**(`iterable`: `Counter`\<`T`\> \| `Iterable`\<`T`, `any`, `any`\>): `void`

Defined in: [packages/pythonlib/src/collections.ts:80](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/collections.ts#L80)

Add counts from another iterable or Counter

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `iterable` | `Counter`\<`T`\> \| `Iterable`\<`T`, `any`, `any`\> |

#### Returns

`void`

***

### values()

> **values**(): `MapIterator`\<`number`\>

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es2015.iterable.d.ts:158

Returns an iterable of values in the map

#### Returns

`MapIterator`\<`number`\>

#### Inherited from

`Map.values`

***

### groupBy()

> `static` **groupBy**\<`K`, `T`\>(`items`: `Iterable`\<`T`\>, `keySelector`: (`item`: `T`, `index`: `number`) => `K`): `Map`\<`K`, `T`[]\>

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.es2024.collection.d.ts:25

Groups members of an iterable according to the return value of the passed callback.

#### Type Parameters

| Type Parameter |
| ------ |
| `K` |
| `T` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `items` | `Iterable`\<`T`\> | An iterable. |
| `keySelector` | (`item`: `T`, `index`: `number`) => `K` | A callback which will be invoked for each item in items. |

#### Returns

`Map`\<`K`, `T`[]\>

#### Inherited from

`Map.groupBy`

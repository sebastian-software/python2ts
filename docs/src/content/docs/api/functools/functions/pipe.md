---
editUrl: false
next: false
prev: false
title: "pipe"
---

## Call Signature

> **pipe**\<`T`\>(`value`: `T`): `T`

Defined in: [packages/pythonlib/src/functools.ts:381](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/functools.ts#L381)

Pipe a value through a series of functions.

### Type Parameters

| Type Parameter |
| ------ |
| `T` |

### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `T` |

### Returns

`T`

### Inspired

Remeda, Ramda

Example:
  pipe(5, x => x * 2, x => x + 1) // returns 11

## Call Signature

> **pipe**\<`T`, `A`\>(`value`: `T`, `fn1`: (`x`: `T`) => `A`): `A`

Defined in: [packages/pythonlib/src/functools.ts:382](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/functools.ts#L382)

Pipe a value through a series of functions.

### Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `A` |

### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `T` |
| `fn1` | (`x`: `T`) => `A` |

### Returns

`A`

### Inspired

Remeda, Ramda

Example:
  pipe(5, x => x * 2, x => x + 1) // returns 11

## Call Signature

> **pipe**\<`T`, `A`, `B`\>(`value`: `T`, `fn1`: (`x`: `T`) => `A`, `fn2`: (`x`: `A`) => `B`): `B`

Defined in: [packages/pythonlib/src/functools.ts:383](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/functools.ts#L383)

Pipe a value through a series of functions.

### Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `A` |
| `B` |

### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `T` |
| `fn1` | (`x`: `T`) => `A` |
| `fn2` | (`x`: `A`) => `B` |

### Returns

`B`

### Inspired

Remeda, Ramda

Example:
  pipe(5, x => x * 2, x => x + 1) // returns 11

## Call Signature

> **pipe**\<`T`, `A`, `B`, `C`\>(`value`: `T`, `fn1`: (`x`: `T`) => `A`, `fn2`: (`x`: `A`) => `B`, `fn3`: (`x`: `B`) => `C`): `C`

Defined in: [packages/pythonlib/src/functools.ts:384](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/functools.ts#L384)

Pipe a value through a series of functions.

### Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `A` |
| `B` |
| `C` |

### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `T` |
| `fn1` | (`x`: `T`) => `A` |
| `fn2` | (`x`: `A`) => `B` |
| `fn3` | (`x`: `B`) => `C` |

### Returns

`C`

### Inspired

Remeda, Ramda

Example:
  pipe(5, x => x * 2, x => x + 1) // returns 11

## Call Signature

> **pipe**\<`T`, `A`, `B`, `C`, `D`\>(`value`: `T`, `fn1`: (`x`: `T`) => `A`, `fn2`: (`x`: `A`) => `B`, `fn3`: (`x`: `B`) => `C`, `fn4`: (`x`: `C`) => `D`): `D`

Defined in: [packages/pythonlib/src/functools.ts:385](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/functools.ts#L385)

Pipe a value through a series of functions.

### Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `A` |
| `B` |
| `C` |
| `D` |

### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `T` |
| `fn1` | (`x`: `T`) => `A` |
| `fn2` | (`x`: `A`) => `B` |
| `fn3` | (`x`: `B`) => `C` |
| `fn4` | (`x`: `C`) => `D` |

### Returns

`D`

### Inspired

Remeda, Ramda

Example:
  pipe(5, x => x * 2, x => x + 1) // returns 11

## Call Signature

> **pipe**\<`T`, `A`, `B`, `C`, `D`, `E`\>(`value`: `T`, `fn1`: (`x`: `T`) => `A`, `fn2`: (`x`: `A`) => `B`, `fn3`: (`x`: `B`) => `C`, `fn4`: (`x`: `C`) => `D`, `fn5`: (`x`: `D`) => `E`): `E`

Defined in: [packages/pythonlib/src/functools.ts:392](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/functools.ts#L392)

Pipe a value through a series of functions.

### Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `A` |
| `B` |
| `C` |
| `D` |
| `E` |

### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `T` |
| `fn1` | (`x`: `T`) => `A` |
| `fn2` | (`x`: `A`) => `B` |
| `fn3` | (`x`: `B`) => `C` |
| `fn4` | (`x`: `C`) => `D` |
| `fn5` | (`x`: `D`) => `E` |

### Returns

`E`

### Inspired

Remeda, Ramda

Example:
  pipe(5, x => x * 2, x => x + 1) // returns 11

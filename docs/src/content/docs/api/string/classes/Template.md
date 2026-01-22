---
editUrl: false
next: false
prev: false
title: "Template"
---

Defined in: [packages/pythonlib/src/string.ts:50](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L50)

## Constructors

### Constructor

> **new Template**(`template`: `string`): `Template`

Defined in: [packages/pythonlib/src/string.ts:53](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L53)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `template` | `string` |

#### Returns

`Template`

## Properties

### template

> `readonly` **template**: `string`

Defined in: [packages/pythonlib/src/string.ts:51](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L51)

## Methods

### getIdentifiers()

> **getIdentifiers**(): `string`[]

Defined in: [packages/pythonlib/src/string.ts:90](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L90)

Get identifiers in template

#### Returns

`string`[]

***

### safeSubstitute()

> **safeSubstitute**(`mapping?`: `Record`\<`string`, `unknown`\>): `string`

Defined in: [packages/pythonlib/src/string.ts:74](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L74)

Perform substitution, returning original placeholder for missing keys

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `mapping?` | `Record`\<`string`, `unknown`\> |

#### Returns

`string`

***

### substitute()

> **substitute**(`mapping?`: `Record`\<`string`, `unknown`\>): `string`

Defined in: [packages/pythonlib/src/string.ts:58](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L58)

Perform substitution, raising KeyError for missing keys

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `mapping?` | `Record`\<`string`, `unknown`\> |

#### Returns

`string`

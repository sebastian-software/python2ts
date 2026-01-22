---
editUrl: false
next: false
prev: false
title: "Pattern"
---

Defined in: [packages/pythonlib/src/re.ts:177](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L177)

## Constructors

### Constructor

> **new Pattern**(`pattern`: `string`, `flags`: `number`): `Pattern`

Defined in: [packages/pythonlib/src/re.ts:182](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L182)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `pattern` | `string` | `undefined` |
| `flags` | `number` | `0` |

#### Returns

`Pattern`

## Accessors

### flags

#### Get Signature

> **get** **flags**(): `number`

Defined in: [packages/pythonlib/src/re.ts:379](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L379)

Return the flags

##### Returns

`number`

***

### groupIndex

#### Get Signature

> **get** **groupIndex**(): `Record`\<`string`, `number`\>

Defined in: [packages/pythonlib/src/re.ts:407](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L407)

Return named groups mapping

##### Returns

`Record`\<`string`, `number`\>

***

### groups

#### Get Signature

> **get** **groups**(): `number`

Defined in: [packages/pythonlib/src/re.ts:384](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L384)

Return number of groups

##### Returns

`number`

***

### pattern

#### Get Signature

> **get** **pattern**(): `string`

Defined in: [packages/pythonlib/src/re.ts:374](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L374)

Return the pattern string

##### Returns

`string`

## Methods

### findAll()

> **findAll**(`string`: `string`, `pos`: `number`, `endpos?`: `number`): (`string` \| `string`[])[]

Defined in: [packages/pythonlib/src/re.ts:281](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L281)

Find all matches

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `string` | `string` | `undefined` |
| `pos` | `number` | `0` |
| `endpos?` | `number` | `undefined` |

#### Returns

(`string` \| `string`[])[]

***

### findIter()

> **findIter**(`string`: `string`, `pos`: `number`, `endpos?`: `number`): `Generator`\<[`Match`](/python2ts/api/re/classes/match/)\>

Defined in: [packages/pythonlib/src/re.ts:302](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L302)

Find all matches as iterator

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `string` | `string` | `undefined` |
| `pos` | `number` | `0` |
| `endpos?` | `number` | `undefined` |

#### Returns

`Generator`\<[`Match`](/python2ts/api/re/classes/match/)\>

***

### fullMatch()

> **fullMatch**(`string`: `string`, `pos`: `number`, `endpos?`: `number`): [`Match`](/python2ts/api/re/classes/match/) \| `null`

Defined in: [packages/pythonlib/src/re.ts:237](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L237)

Match pattern against entire string

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `string` | `string` | `undefined` |
| `pos` | `number` | `0` |
| `endpos?` | `number` | `undefined` |

#### Returns

[`Match`](/python2ts/api/re/classes/match/) \| `null`

***

### match()

> **match**(`string`: `string`, `pos`: `number`, `endpos?`: `number`): [`Match`](/python2ts/api/re/classes/match/) \| `null`

Defined in: [packages/pythonlib/src/re.ts:221](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L221)

Match pattern at start of string

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `string` | `string` | `undefined` |
| `pos` | `number` | `0` |
| `endpos?` | `number` | `undefined` |

#### Returns

[`Match`](/python2ts/api/re/classes/match/) \| `null`

***

### search()

> **search**(`string`: `string`, `pos`: `number`, `endpos?`: `number`): [`Match`](/python2ts/api/re/classes/match/) \| `null`

Defined in: [packages/pythonlib/src/re.ts:206](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L206)

Search for pattern in string

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `string` | `string` | `undefined` |
| `pos` | `number` | `0` |
| `endpos?` | `number` | `undefined` |

#### Returns

[`Match`](/python2ts/api/re/classes/match/) \| `null`

***

### split()

> **split**(`string`: `string`, `maxsplit`: `number`): `string`[]

Defined in: [packages/pythonlib/src/re.ts:253](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L253)

Split string by pattern

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `string` | `string` | `undefined` |
| `maxsplit` | `number` | `0` |

#### Returns

`string`[]

***

### sub()

> **sub**(`repl`: `string` \| (`match`: [`Match`](/python2ts/api/re/classes/match/)) => `string`, `string`: `string`, `count`: `number`): `string`

Defined in: [packages/pythonlib/src/re.ts:316](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L316)

Replace pattern in string

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `repl` | `string` \| (`match`: [`Match`](/python2ts/api/re/classes/match/)) => `string` | `undefined` |
| `string` | `string` | `undefined` |
| `count` | `number` | `0` |

#### Returns

`string`

***

### subn()

> **subn**(`repl`: `string` \| (`match`: [`Match`](/python2ts/api/re/classes/match/)) => `string`, `string`: `string`, `count`: `number`): \[`string`, `number`\]

Defined in: [packages/pythonlib/src/re.ts:352](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L352)

Replace pattern and return (newstring, count)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `repl` | `string` \| (`match`: [`Match`](/python2ts/api/re/classes/match/)) => `string` | `undefined` |
| `string` | `string` | `undefined` |
| `count` | `number` | `0` |

#### Returns

\[`string`, `number`\]

***

### toString()

> **toString**(): `string`

Defined in: [packages/pythonlib/src/re.ts:422](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L422)

#### Returns

`string`

---
editUrl: false
next: false
prev: false
title: "Match"
---

Defined in: [packages/pythonlib/src/re.ts:39](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L39)

## Constructors

### Constructor

> **new Match**(`match`: `RegExpExecArray`, `string`: `string`, `pattern`: [`Pattern`](/python2ts/api/re/classes/pattern/), `pos`: `number`, `endpos?`: `number`): `Match`

Defined in: [packages/pythonlib/src/re.ts:46](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L46)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `match` | `RegExpExecArray` | `undefined` |
| `string` | `string` | `undefined` |
| `pattern` | [`Pattern`](/python2ts/api/re/classes/pattern/) | `undefined` |
| `pos` | `number` | `0` |
| `endpos?` | `number` | `undefined` |

#### Returns

`Match`

## Accessors

### endpos

#### Get Signature

> **get** **endpos**(): `number`

Defined in: [packages/pythonlib/src/re.ts:115](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L115)

Return end position of search

##### Returns

`number`

***

### lastGroup

#### Get Signature

> **get** **lastGroup**(): `string` \| `undefined`

Defined in: [packages/pythonlib/src/re.ts:128](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L128)

Return the name of the last matched group

##### Returns

`string` \| `undefined`

***

### lastIndex

#### Get Signature

> **get** **lastIndex**(): `number` \| `undefined`

Defined in: [packages/pythonlib/src/re.ts:120](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L120)

Return the last matched group index

##### Returns

`number` \| `undefined`

***

### pos

#### Get Signature

> **get** **pos**(): `number`

Defined in: [packages/pythonlib/src/re.ts:110](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L110)

Return start position of search

##### Returns

`number`

***

### re

#### Get Signature

> **get** **re**(): [`Pattern`](/python2ts/api/re/classes/pattern/)

Defined in: [packages/pythonlib/src/re.ts:142](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L142)

Return the pattern object

##### Returns

[`Pattern`](/python2ts/api/re/classes/pattern/)

***

### string

#### Get Signature

> **get** **string**(): `string`

Defined in: [packages/pythonlib/src/re.ts:147](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L147)

Return the input string

##### Returns

`string`

## Methods

### \[iterator\]()

> **\[iterator\]**(): `Generator`\<`string` \| `undefined`\>

Defined in: [packages/pythonlib/src/re.ts:162](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L162)

Return iterator of all groups

#### Returns

`Generator`\<`string` \| `undefined`\>

***

### end()

> **end**(`groupNum`: `number`): `number`

Defined in: [packages/pythonlib/src/re.ts:97](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L97)

Return the end index of the match

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `groupNum` | `number` | `0` |

#### Returns

`number`

***

### expand()

> **expand**(`template`: `string`): `string`

Defined in: [packages/pythonlib/src/re.ts:152](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L152)

Expand template with groups

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `template` | `string` |

#### Returns

`string`

***

### group()

> **group**(`groupNum`: `string` \| `number`): `string` \| `undefined`

Defined in: [packages/pythonlib/src/re.ts:55](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L55)

Return the string matched by the RE

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `groupNum` | `string` \| `number` | `0` |

#### Returns

`string` \| `undefined`

***

### groupDict()

> **groupDict**(`defaultValue?`: `string`): `Record`\<`string`, `string` \| `undefined`\>

Defined in: [packages/pythonlib/src/re.ts:73](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L73)

Return a dictionary of named groups

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `defaultValue?` | `string` |

#### Returns

`Record`\<`string`, `string` \| `undefined`\>

***

### groups()

> **groups**(`defaultValue?`: `string`): (`string` \| `undefined`)[]

Defined in: [packages/pythonlib/src/re.ts:64](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L64)

Return a tuple containing all subgroups

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `defaultValue?` | `string` |

#### Returns

(`string` \| `undefined`)[]

***

### span()

> **span**(`groupNum`: `number`): \[`number`, `number`\]

Defined in: [packages/pythonlib/src/re.ts:105](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L105)

Return a tuple (start, end)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `groupNum` | `number` | `0` |

#### Returns

\[`number`, `number`\]

***

### start()

> **start**(`groupNum`: `number`): `number`

Defined in: [packages/pythonlib/src/re.ts:84](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L84)

Return the start index of the match

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `groupNum` | `number` | `0` |

#### Returns

`number`

***

### toString()

> **toString**(): `string`

Defined in: [packages/pythonlib/src/re.ts:168](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/re.ts#L168)

#### Returns

`string`

---
editUrl: false
next: false
prev: false
title: "Popen"
---

Defined in: [packages/pythonlib/src/subprocess.ts:281](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L281)

A subprocess.Popen-like class for more control over process execution.

## Constructors

### Constructor

> **new Popen**(`args`: `string` \| `string`[], `options?`: [`SubprocessOptions`](/python2ts/api/subprocess/interfaces/subprocessoptions/)): `Popen`

Defined in: [packages/pythonlib/src/subprocess.ts:288](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L288)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | `string` \| `string`[] |
| `options?` | [`SubprocessOptions`](/python2ts/api/subprocess/interfaces/subprocessoptions/) |

#### Returns

`Popen`

## Properties

### args

> `readonly` **args**: `string`[]

Defined in: [packages/pythonlib/src/subprocess.ts:282](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L282)

## Accessors

### pid

#### Get Signature

> **get** **pid**(): `number` \| `undefined`

Defined in: [packages/pythonlib/src/subprocess.ts:415](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L415)

The process ID.

##### Returns

`number` \| `undefined`

***

### returncode

#### Get Signature

> **get** **returncode**(): `number` \| `null`

Defined in: [packages/pythonlib/src/subprocess.ts:422](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L422)

The exit code (or null if still running).

##### Returns

`number` \| `null`

***

### stderr

#### Get Signature

> **get** **stderr**(): `string` \| `null`

Defined in: [packages/pythonlib/src/subprocess.ts:436](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L436)

The captured stderr.

##### Returns

`string` \| `null`

***

### stdout

#### Get Signature

> **get** **stdout**(): `string` \| `null`

Defined in: [packages/pythonlib/src/subprocess.ts:429](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L429)

The captured stdout.

##### Returns

`string` \| `null`

## Methods

### communicate()

> **communicate**(`input?`: `string` \| `Uint8Array`\<`ArrayBufferLike`\>): `Promise`\<\[`string` \| `null`, `string` \| `null`\]\>

Defined in: [packages/pythonlib/src/subprocess.ts:378](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L378)

Communicate with the process and return stdout/stderr.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input?` | `string` \| `Uint8Array`\<`ArrayBufferLike`\> |

#### Returns

`Promise`\<\[`string` \| `null`, `string` \| `null`\]\>

***

### kill()

> **kill**(): `boolean`

Defined in: [packages/pythonlib/src/subprocess.ts:406](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L406)

Kill the process.

#### Returns

`boolean`

***

### poll()

> **poll**(): `number` \| `null`

Defined in: [packages/pythonlib/src/subprocess.ts:371](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L371)

Get the exit code (or null if still running).

#### Returns

`number` \| `null`

***

### send\_signal()

> **send\_signal**(`signal`: `number` \| `Signals`): `boolean`

Defined in: [packages/pythonlib/src/subprocess.ts:392](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L392)

Send a signal to the process.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `signal` | `number` \| `Signals` |

#### Returns

`boolean`

***

### terminate()

> **terminate**(): `boolean`

Defined in: [packages/pythonlib/src/subprocess.ts:399](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L399)

Terminate the process.

#### Returns

`boolean`

***

### wait()

> **wait**(): `Promise`\<`number`\>

Defined in: [packages/pythonlib/src/subprocess.ts:356](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L356)

Wait for the process to complete.

#### Returns

`Promise`\<`number`\>

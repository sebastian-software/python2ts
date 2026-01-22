---
editUrl: false
next: false
prev: false
title: "SubprocessOptions"
---

Defined in: [packages/pythonlib/src/subprocess.ts:44](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L44)

Options for subprocess functions.

## Properties

### check?

> `optional` **check**: `boolean`

Defined in: [packages/pythonlib/src/subprocess.ts:64](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L64)

Whether to raise CalledProcessError on non-zero exit

***

### cwd?

> `optional` **cwd**: `string`

Defined in: [packages/pythonlib/src/subprocess.ts:46](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L46)

Working directory for the command

***

### encoding?

> `optional` **encoding**: `BufferEncoding`

Defined in: [packages/pythonlib/src/subprocess.ts:60](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L60)

Encoding for text mode (default: utf-8)

***

### env?

> `optional` **env**: `Record`\<`string`, `string`\>

Defined in: [packages/pythonlib/src/subprocess.ts:48](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L48)

Environment variables

***

### input?

> `optional` **input**: `string` \| `Uint8Array`\<`ArrayBufferLike`\>

Defined in: [packages/pythonlib/src/subprocess.ts:50](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L50)

Input to send to stdin

***

### shell?

> `optional` **shell**: `string` \| `boolean`

Defined in: [packages/pythonlib/src/subprocess.ts:58](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L58)

Shell to use (if true, uses default shell)

***

### stderr?

> `optional` **stderr**: `"pipe"` \| `"stdout"` \| `"devnull"` \| `null`

Defined in: [packages/pythonlib/src/subprocess.ts:54](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L54)

How to handle stderr

***

### stdout?

> `optional` **stdout**: `"pipe"` \| `"devnull"` \| `null`

Defined in: [packages/pythonlib/src/subprocess.ts:52](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L52)

How to handle stdout

***

### text?

> `optional` **text**: `boolean`

Defined in: [packages/pythonlib/src/subprocess.ts:62](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L62)

Whether to capture output as text (default: true)

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [packages/pythonlib/src/subprocess.ts:56](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L56)

Timeout in milliseconds

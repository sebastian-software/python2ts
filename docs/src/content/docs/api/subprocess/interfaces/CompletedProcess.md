---
editUrl: false
next: false
prev: false
title: "CompletedProcess"
---

Defined in: [packages/pythonlib/src/subprocess.ts:30](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L30)

Result of a completed process.

## Properties

### args

> **args**: `string`[]

Defined in: [packages/pythonlib/src/subprocess.ts:32](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L32)

The arguments used to launch the process

***

### returncode

> **returncode**: `number`

Defined in: [packages/pythonlib/src/subprocess.ts:34](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L34)

Exit status of the process

***

### stderr

> **stderr**: `string` \| `null`

Defined in: [packages/pythonlib/src/subprocess.ts:38](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L38)

Captured stderr (if PIPE was used)

***

### stdout

> **stdout**: `string` \| `null`

Defined in: [packages/pythonlib/src/subprocess.ts:36](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/subprocess.ts#L36)

Captured stdout (if PIPE was used)

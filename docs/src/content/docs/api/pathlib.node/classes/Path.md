---
editUrl: false
next: false
prev: false
title: "Path"
---

Defined in: [packages/pythonlib/src/pathlib.node.ts:44](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L44)

Path class representing a filesystem path.
Provides both path manipulation (pure) and filesystem operations.

## Constructors

### Constructor

> **new Path**(...`pathSegments`: `string`[]): `Path`

Defined in: [packages/pythonlib/src/pathlib.node.ts:52](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L52)

Create a new Path instance.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| ...`pathSegments` | `string`[] | Path segments to join |

#### Returns

`Path`

## Accessors

### anchor

#### Get Signature

> **get** **anchor**(): `string`

Defined in: [packages/pythonlib/src/pathlib.node.ts:151](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L151)

The drive or root (on Windows, the drive letter; on Unix, empty or /).

##### Returns

`string`

***

### drive

#### Get Signature

> **get** **drive**(): `string`

Defined in: [packages/pythonlib/src/pathlib.node.ts:159](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L159)

The drive letter (Windows only, empty on Unix).

##### Returns

`string`

***

### name

#### Get Signature

> **get** **name**(): `string`

Defined in: [packages/pythonlib/src/pathlib.node.ts:70](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L70)

The final component of the path.

##### Returns

`string`

***

### parent

#### Get Signature

> **get** **parent**(): `Path`

Defined in: [packages/pythonlib/src/pathlib.node.ts:109](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L109)

The logical parent of the path.

##### Returns

`Path`

***

### parents

#### Get Signature

> **get** **parents**(): `Path`[]

Defined in: [packages/pythonlib/src/pathlib.node.ts:117](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L117)

An immutable sequence of the path's ancestors.

##### Returns

`Path`[]

***

### parts

#### Get Signature

> **get** **parts**(): `string`[]

Defined in: [packages/pythonlib/src/pathlib.node.ts:132](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L132)

The individual components of the path.

##### Returns

`string`[]

***

### root

#### Get Signature

> **get** **root**(): `string`

Defined in: [packages/pythonlib/src/pathlib.node.ts:170](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L170)

The root of the path (/ on Unix, \\ or drive:\\ on Windows).

##### Returns

`string`

***

### stem

#### Get Signature

> **get** **stem**(): `string`

Defined in: [packages/pythonlib/src/pathlib.node.ts:77](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L77)

The final component without its suffix.

##### Returns

`string`

***

### suffix

#### Get Signature

> **get** **suffix**(): `string`

Defined in: [packages/pythonlib/src/pathlib.node.ts:86](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L86)

The file extension of the final component.

##### Returns

`string`

***

### suffixes

#### Get Signature

> **get** **suffixes**(): `string`[]

Defined in: [packages/pythonlib/src/pathlib.node.ts:93](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L93)

A list of the path's file extensions.

##### Returns

`string`[]

## Methods

### absolute()

> **absolute**(): `Path`

Defined in: [packages/pythonlib/src/pathlib.node.ts:375](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L375)

Return the absolute path.

#### Returns

`Path`

Absolute path

***

### asPosix()

> **asPosix**(): `string`

Defined in: [packages/pythonlib/src/pathlib.node.ts:213](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L213)

Return the path as a POSIX path string.

#### Returns

`string`

***

### asUri()

> **asUri**(): `string`

Defined in: [packages/pythonlib/src/pathlib.node.ts:220](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L220)

Return the path as a URI.

#### Returns

`string`

***

### chmod()

> **chmod**(`mode`: `number`): `Promise`\<`void`\>

Defined in: [packages/pythonlib/src/pathlib.node.ts:514](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L514)

Change file permissions.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `mode` | `number` | Permission mode |

#### Returns

`Promise`\<`void`\>

***

### div()

> **div**(`other`: `string` \| `Path`): `Path`

Defined in: [packages/pythonlib/src/pathlib.node.ts:198](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L198)

Division operator alternative: join paths.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | `string` \| `Path` | Path segment to join |

#### Returns

`Path`

A new Path

***

### exists()

> **exists**(): `Promise`\<`boolean`\>

Defined in: [packages/pythonlib/src/pathlib.node.ts:230](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L230)

Whether the path exists.

#### Returns

`Promise`\<`boolean`\>

***

### glob()

> **glob**(`pattern`: `string`): `Promise`\<`Path`[]\>

Defined in: [packages/pythonlib/src/pathlib.node.ts:422](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L422)

Glob pattern matching.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `pattern` | `string` | Glob pattern |

#### Returns

`Promise`\<`Path`[]\>

Array of matching Path objects

***

### isAbsolute()

> **isAbsolute**(): `boolean`

Defined in: [packages/pythonlib/src/pathlib.node.ts:178](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L178)

Whether the path is absolute.

#### Returns

`boolean`

***

### isDir()

> **isDir**(): `Promise`\<`boolean`\>

Defined in: [packages/pythonlib/src/pathlib.node.ts:253](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L253)

Whether the path is a directory.

#### Returns

`Promise`\<`boolean`\>

***

### isFile()

> **isFile**(): `Promise`\<`boolean`\>

Defined in: [packages/pythonlib/src/pathlib.node.ts:242](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L242)

Whether the path is a file.

#### Returns

`Promise`\<`boolean`\>

***

### isSymlink()

> **isSymlink**(): `Promise`\<`boolean`\>

Defined in: [packages/pythonlib/src/pathlib.node.ts:264](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L264)

Whether the path is a symbolic link.

#### Returns

`Promise`\<`boolean`\>

***

### iterdir()

> **iterdir**(): `Promise`\<`Path`[]\>

Defined in: [packages/pythonlib/src/pathlib.node.ts:411](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L411)

Iterate over directory contents.

#### Returns

`Promise`\<`Path`[]\>

Array of Path objects

***

### joinpath()

> **joinpath**(...`pathSegments`: `string`[]): `Path`

Defined in: [packages/pythonlib/src/pathlib.node.ts:188](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L188)

Combine this path with additional segments.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| ...`pathSegments` | `string`[] | Path segments to join |

#### Returns

`Path`

A new Path

***

### linkTo()

> **linkTo**(`target`: `string` \| `Path`): `Promise`\<`void`\>

Defined in: [packages/pythonlib/src/pathlib.node.ts:504](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L504)

Create a hard link.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `target` | `string` \| `Path` | Target of the link |

#### Returns

`Promise`\<`void`\>

***

### lstat()

> **lstat**(): `Promise`\<`Stats`\>

Defined in: [packages/pythonlib/src/pathlib.node.ts:402](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L402)

Get symbolic link statistics.

#### Returns

`Promise`\<`Stats`\>

Stat object for the symlink itself

***

### match()

> **match**(`pattern`: `string`): `boolean`

Defined in: [packages/pythonlib/src/pathlib.node.ts:541](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L541)

Check if path matches a pattern.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `pattern` | `string` | Glob pattern |

#### Returns

`boolean`

True if matches

***

### mkdir()

> **mkdir**(`options?`: `object`): `Promise`\<`void`\>

Defined in: [packages/pythonlib/src/pathlib.node.ts:315](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L315)

Create the directory (and parents if necessary).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | \{ `existOk?`: `boolean`; `parents?`: `boolean`; \} | Options object |
| `options.existOk?` | `boolean` | - |
| `options.parents?` | `boolean` | - |

#### Returns

`Promise`\<`void`\>

***

### readBytes()

> **readBytes**(): `Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

Defined in: [packages/pythonlib/src/pathlib.node.ts:297](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L297)

Read the file contents as bytes.

#### Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

File contents as Uint8Array

***

### readlink()

> **readlink**(): `Promise`\<`Path`\>

Defined in: [packages/pythonlib/src/pathlib.node.ts:384](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L384)

Return the real path (resolving symlinks).

#### Returns

`Promise`\<`Path`\>

Real path

***

### readText()

> **readText**(`encoding`: `BufferEncoding`): `Promise`\<`string`\>

Defined in: [packages/pythonlib/src/pathlib.node.ts:278](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L278)

Read the file contents as text.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `encoding` | `BufferEncoding` | `"utf-8"` | Text encoding (default: utf-8) |

#### Returns

`Promise`\<`string`\>

File contents as string

***

### relativeTo()

> **relativeTo**(`other`: `string` \| `Path`): `Path`

Defined in: [packages/pythonlib/src/pathlib.node.ts:552](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L552)

Return path relative to another path.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `other` | `string` \| `Path` | Base path |

#### Returns

`Path`

Relative path

***

### rename()

> **rename**(`target`: `string` \| `Path`): `Promise`\<`Path`\>

Defined in: [packages/pythonlib/src/pathlib.node.ts:345](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L345)

Rename the path to target.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `target` | `string` \| `Path` | New path |

#### Returns

`Promise`\<`Path`\>

The new Path

***

### replace()

> **replace**(`target`: `string` \| `Path`): `Promise`\<`Path`\>

Defined in: [packages/pythonlib/src/pathlib.node.ts:357](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L357)

Replace target with this file.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `target` | `string` \| `Path` | Target path to replace |

#### Returns

`Promise`\<`Path`\>

The new Path

***

### resolve()

> **resolve**(): `Path`

Defined in: [packages/pythonlib/src/pathlib.node.ts:366](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L366)

Make the path absolute.

#### Returns

`Path`

Absolute path

***

### rglob()

> **rglob**(`pattern`: `string`): `Promise`\<`Path`[]\>

Defined in: [packages/pythonlib/src/pathlib.node.ts:432](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L432)

Recursive glob pattern matching.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `pattern` | `string` | Glob pattern |

#### Returns

`Promise`\<`Path`[]\>

Array of matching Path objects

***

### rmdir()

> **rmdir**(): `Promise`\<`void`\>

Defined in: [packages/pythonlib/src/pathlib.node.ts:328](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L328)

Remove the directory.

#### Returns

`Promise`\<`void`\>

***

### stat()

> **stat**(): `Promise`\<`Stats`\>

Defined in: [packages/pythonlib/src/pathlib.node.ts:393](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L393)

Get file statistics.

#### Returns

`Promise`\<`Stats`\>

File stat object

***

### symlinkTo()

> **symlinkTo**(`target`: `string` \| `Path`): `Promise`\<`void`\>

Defined in: [packages/pythonlib/src/pathlib.node.ts:494](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L494)

Create a symbolic link.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `target` | `string` \| `Path` | Target of the symlink |

#### Returns

`Promise`\<`void`\>

***

### toString()

> **toString**(): `string`

Defined in: [packages/pythonlib/src/pathlib.node.ts:206](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L206)

Return a string representation of the path.

#### Returns

`string`

***

### touch()

> **touch**(`atime?`: `Date`, `mtime?`: `Date`): `Promise`\<`void`\>

Defined in: [packages/pythonlib/src/pathlib.node.ts:524](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L524)

Update access and modification times.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `atime?` | `Date` | Access time |
| `mtime?` | `Date` | Modification time |

#### Returns

`Promise`\<`void`\>

***

### unlink()

> **unlink**(): `Promise`\<`void`\>

Defined in: [packages/pythonlib/src/pathlib.node.ts:335](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L335)

Remove the file or symbolic link.

#### Returns

`Promise`\<`void`\>

***

### withName()

> **withName**(`name`: `string`): `Path`

Defined in: [packages/pythonlib/src/pathlib.node.ts:574](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L574)

Return a new path with a different name.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | New name |

#### Returns

`Path`

New Path

***

### withStem()

> **withStem**(`stem`: `string`): `Path`

Defined in: [packages/pythonlib/src/pathlib.node.ts:585](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L585)

Return a new path with a different stem.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `stem` | `string` | New stem |

#### Returns

`Path`

New Path

***

### withSuffix()

> **withSuffix**(`suffix`: `string`): `Path`

Defined in: [packages/pythonlib/src/pathlib.node.ts:563](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L563)

Return a new path with a different suffix.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `suffix` | `string` | New suffix |

#### Returns

`Path`

New Path

***

### writeBytes()

> **writeBytes**(`data`: `Uint8Array`): `Promise`\<`void`\>

Defined in: [packages/pythonlib/src/pathlib.node.ts:306](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L306)

Write bytes to the file.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | `Uint8Array` | Bytes to write |

#### Returns

`Promise`\<`void`\>

***

### writeText()

> **writeText**(`data`: `string`, `encoding`: `BufferEncoding`): `Promise`\<`void`\>

Defined in: [packages/pythonlib/src/pathlib.node.ts:288](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L288)

Write text to the file.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `data` | `string` | `undefined` | Text to write |
| `encoding` | `BufferEncoding` | `"utf-8"` | Text encoding (default: utf-8) |

#### Returns

`Promise`\<`void`\>

***

### cwd()

> `static` **cwd**(): `Path`

Defined in: [packages/pythonlib/src/pathlib.node.ts:593](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L593)

Get the current working directory as a Path.

#### Returns

`Path`

***

### home()

> `static` **home**(): `Path`

Defined in: [packages/pythonlib/src/pathlib.node.ts:600](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L600)

Get the home directory as a Path.

#### Returns

`Path`

***

### of()

> `static` **of**(...`pathSegments`: `string`[]): `Path`

Defined in: [packages/pythonlib/src/pathlib.node.ts:63](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/pathlib.node.ts#L63)

Static factory method to create a Path.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`pathSegments` | `string`[] |

#### Returns

`Path`

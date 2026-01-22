---
editUrl: false
next: false
prev: false
title: "path"
---

> `const` **path**: `object`

Defined in: [packages/pythonlib/src/os.node.ts:74](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/os.node.ts#L74)

## Type Declaration

| Name | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="basename"></a> `basename()` | (`p`: `string`, `suffix?`: `string`) => `string` | `pathBasename` | Return the base name of pathname | [packages/pythonlib/src/os.node.ts:76](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/os.node.ts#L76) |
| <a id="commonpath"></a> `commonPath()` | (`paths`: `string`[]) => `string` | `pathCommonPath` | Return common path prefix | [packages/pythonlib/src/os.node.ts:84](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/os.node.ts#L84) |
| <a id="dirname"></a> `dirname()` | (`p`: `string`) => `string` | `pathDirname` | Return the directory name of pathname | [packages/pythonlib/src/os.node.ts:77](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/os.node.ts#L77) |
| <a id="expanduser"></a> `expandUser()` | (`p`: `string`) => `string` | `pathExpandUser` | Expand ~ and ~user | [packages/pythonlib/src/os.node.ts:85](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/os.node.ts#L85) |
| <a id="expandvars"></a> `expandVars()` | (`p`: `string`) => `string` | `pathExpandVars` | Expand shell variables | [packages/pythonlib/src/os.node.ts:86](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/os.node.ts#L86) |
| <a id="extname"></a> `extName()` | (`p`: `string`) => `string` | `pathExtName` | Return the extension of pathname | [packages/pythonlib/src/os.node.ts:80](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/os.node.ts#L80) |
| <a id="isabs"></a> `isAbs()` | (`p`: `string`) => `boolean` | `pathIsAbs` | Test whether a path is absolute | [packages/pythonlib/src/os.node.ts:81](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/os.node.ts#L81) |
| <a id="join"></a> `join()` | (...`paths`: `string`[]) => `string` | `pathJoin` | Join path components intelligently | [packages/pythonlib/src/os.node.ts:75](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/os.node.ts#L75) |
| <a id="normpath"></a> `normPath()` | (`p`: `string`) => `string` | `pathNormPath` | Normalize a pathname | [packages/pythonlib/src/os.node.ts:82](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/os.node.ts#L82) |
| <a id="relpath"></a> `relPath()` | (`p`: `string`, `start`: `string`) => `string` | `pathRelPath` | Return relative path from start to path | [packages/pythonlib/src/os.node.ts:83](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/os.node.ts#L83) |
| <a id="split"></a> `split()` | (`p`: `string`) => \[`string`, `string`\] | `pathSplitFn` | Split pathname into (head, tail) | [packages/pythonlib/src/os.node.ts:78](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/os.node.ts#L78) |
| <a id="splitext"></a> `splitExt()` | (`p`: `string`) => \[`string`, `string`\] | `pathSplitExt` | Split pathname into root and extension | [packages/pythonlib/src/os.node.ts:79](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/os.node.ts#L79) |
| `absPath()` | (`p`: `string`) => `string` | - | Return normalized absolutized version of pathname | [packages/pythonlib/src/os.node.ts:89](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/os.node.ts#L89) |
| `exists()` | (`p`: `string`) => `Promise`\<`boolean`\> | - | Test if path exists | [packages/pythonlib/src/os.node.ts:106](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/os.node.ts#L106) |
| `getAtime()` | (`p`: `string`) => `Promise`\<`number`\> | - | Return access time as Unix timestamp | [packages/pythonlib/src/os.node.ts:161](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/os.node.ts#L161) |
| `getCtime()` | (`p`: `string`) => `Promise`\<`number`\> | - | Return creation time as Unix timestamp | [packages/pythonlib/src/os.node.ts:170](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/os.node.ts#L170) |
| `getMtime()` | (`p`: `string`) => `Promise`\<`number`\> | - | Return modification time as Unix timestamp | [packages/pythonlib/src/os.node.ts:152](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/os.node.ts#L152) |
| `getSize()` | (`p`: `string`) => `Promise`\<`number`\> | - | Return size of file | [packages/pythonlib/src/os.node.ts:143](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/os.node.ts#L143) |
| `isDir()` | (`p`: `string`) => `Promise`\<`boolean`\> | - | Test if path is a directory | [packages/pythonlib/src/os.node.ts:125](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/os.node.ts#L125) |
| `isFile()` | (`p`: `string`) => `Promise`\<`boolean`\> | - | Test if path is a file | [packages/pythonlib/src/os.node.ts:116](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/os.node.ts#L116) |
| `isLink()` | (`p`: `string`) => `Promise`\<`boolean`\> | - | Test if path is a symbolic link | [packages/pythonlib/src/os.node.ts:134](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/os.node.ts#L134) |
| `realPath()` | (`p`: `string`) => `Promise`\<`string`\> | - | Return canonical path, eliminating symlinks | [packages/pythonlib/src/os.node.ts:97](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/os.node.ts#L97) |

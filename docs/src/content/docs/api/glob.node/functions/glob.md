---
editUrl: false
next: false
prev: false
title: "glob"
---

> **glob**(`pattern`: `string`, `options?`: `object`): `Promise`\<`string`[]\>

Defined in: [packages/pythonlib/src/glob.node.ts:34](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/glob.node.ts#L34)

Return a list of paths matching a pathname pattern.

The pattern may contain shell-style wildcards:
- `*` matches any number of characters
- `?` matches a single character
- `[seq]` matches any character in seq
- `[!seq]` matches any character not in seq
- `**` matches everything, including any subdirectories

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `pattern` | `string` | The glob pattern |
| `options?` | \{ `includeHidden?`: `boolean`; `recursive?`: `boolean`; `rootDir?`: `string`; \} | Options object |
| `options.includeHidden?` | `boolean` | - |
| `options.recursive?` | `boolean` | - |
| `options.rootDir?` | `string` | - |

## Returns

`Promise`\<`string`[]\>

Promise of array of matching paths

## Example

```typescript
await glob("*.txt")              // All .txt files in current directory
await glob("**/*.py")           // All .py files recursively
await glob("/path/to/*.js")      // All .js files in /path/to
```

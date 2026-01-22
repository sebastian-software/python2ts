---
editUrl: false
next: false
prev: false
title: "len"
---

> `const` **len**: (`obj`: `string` \| `unknown`[] \| `Map`\<`unknown`, `unknown`\> \| `Set`\<`unknown`\> \| \{ `length`: `number`; \}) => `number` = `builtins.len`

Defined in: [packages/pythonlib/src/index.ts:162](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/index.ts#L162)

Return the number of items in an object.

Works with strings, arrays, Maps, Sets, and objects with a length property.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `obj` | `string` \| `unknown`[] \| `Map`\<`unknown`, `unknown`\> \| `Set`\<`unknown`\> \| \{ `length`: `number`; \} | The object to measure |

## Returns

`number`

The number of items

## See

[Python len()](https://docs.python.org/3/library/functions.html#len)

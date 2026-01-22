---
editUrl: false
next: false
prev: false
title: "getattr"
---

> `const` **getattr**: \<`T`\>(`obj`: `unknown`, `name`: `string`, `defaultValue?`: `T`) => `T` \| `undefined` = `builtins.getattr`

Defined in: [packages/pythonlib/src/index.ts:193](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/index.ts#L193)

Python getattr() function - get an attribute from an object

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `obj` | `unknown` | The object to get the attribute from |
| `name` | `string` | The name of the attribute |
| `defaultValue?` | `T` | Optional default value if attribute doesn't exist |

## Returns

`T` \| `undefined`

The attribute value or default value

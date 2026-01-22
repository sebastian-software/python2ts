---
editUrl: false
next: false
prev: false
title: "urlunparse"
---

> **urlunparse**(`components`: [`ParseResult`](/python2ts/api/urllib/interfaces/parseresult/) \| \[`string`, `string`, `string`, `string`, `string`, `string`\]): `string`

Defined in: [packages/pythonlib/src/urllib.ts:109](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/urllib.ts#L109)

Combine URL components back into a URL string.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `components` | [`ParseResult`](/python2ts/api/urllib/interfaces/parseresult/) \| \[`string`, `string`, `string`, `string`, `string`, `string`\] | URL components tuple [scheme, netloc, path, params, query, fragment] |

## Returns

`string`

Combined URL string

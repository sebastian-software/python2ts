---
editUrl: false
next: false
prev: false
title: "urlparse"
---

> **urlparse**(`urlstring`: `string`, `scheme`: `string`, `allowFragments`: `boolean`): [`ParseResult`](/python2ts/api/urllib/interfaces/parseresult/)

Defined in: [packages/pythonlib/src/urllib.ts:52](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/urllib.ts#L52)

Parse a URL into its components.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `urlstring` | `string` | `undefined` | The URL to parse |
| `scheme` | `string` | `""` | Default scheme if not present in URL |
| `allowFragments` | `boolean` | `true` | Whether to parse fragments (default: true) |

## Returns

[`ParseResult`](/python2ts/api/urllib/interfaces/parseresult/)

Parsed URL components

## Example

```typescript
const result = urlparse("https://user:pass@example.com:8080/path?query=1#frag")
console.log(result.scheme)   // "https"
console.log(result.hostname) // "example.com"
console.log(result.port)     // 8080
```

---
editUrl: false
next: false
prev: false
title: "parse"
---

> `const` **parse**: `object`

Defined in: [packages/pythonlib/src/urllib.ts:380](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/urllib.ts#L380)

Namespace object for parse functions (urllib.parse compatibility).

## Type Declaration

| Name | Type | Defined in |
| ------ | ------ | ------ |
| <a id="parseqs"></a> `parseQs()` | (`qs`: `string`, `keepBlankValues`: `boolean`) => `Record`\<`string`, `string`[]\> | [packages/pythonlib/src/urllib.ts:385](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/urllib.ts#L385) |
| <a id="parseqsl"></a> `parseQsl()` | (`qs`: `string`, `keepBlankValues`: `boolean`) => \[`string`, `string`\][] | [packages/pythonlib/src/urllib.ts:386](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/urllib.ts#L386) |
| <a id="quote"></a> `quote()` | (`s`: `string`, `safe`: `string`) => `string` | [packages/pythonlib/src/urllib.ts:387](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/urllib.ts#L387) |
| <a id="quoteplus"></a> `quotePlus()` | (`s`: `string`, `safe`: `string`) => `string` | [packages/pythonlib/src/urllib.ts:388](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/urllib.ts#L388) |
| <a id="splithost"></a> `splithost()` | (`url`: `string`) => \[`string` \| `null`, `string`\] | [packages/pythonlib/src/urllib.ts:392](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/urllib.ts#L392) |
| <a id="splitpasswd"></a> `splitpasswd()` | (`user`: `string`) => \[`string`, `string` \| `null`\] | [packages/pythonlib/src/urllib.ts:394](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/urllib.ts#L394) |
| <a id="splitport"></a> `splitport()` | (`host`: `string`) => \[`string`, `string` \| `null`\] | [packages/pythonlib/src/urllib.ts:395](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/urllib.ts#L395) |
| <a id="splittype"></a> `splittype()` | (`url`: `string`) => \[`string`, `string`\] | [packages/pythonlib/src/urllib.ts:391](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/urllib.ts#L391) |
| <a id="splituser"></a> `splituser()` | (`host`: `string`) => \[`string` \| `null`, `string`\] | [packages/pythonlib/src/urllib.ts:393](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/urllib.ts#L393) |
| <a id="unquote"></a> `unquote()` | (`s`: `string`) => `string` | [packages/pythonlib/src/urllib.ts:389](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/urllib.ts#L389) |
| <a id="unquoteplus"></a> `unquotePlus()` | (`s`: `string`) => `string` | [packages/pythonlib/src/urllib.ts:390](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/urllib.ts#L390) |
| <a id="urlencode"></a> `urlencode()` | (`query`: \[`string`, `string`\][] \| `Record`\<`string`, `string` \| `string`[]\>, `doseq`: `boolean`) => `string` | [packages/pythonlib/src/urllib.ts:384](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/urllib.ts#L384) |
| <a id="urljoin"></a> `urljoin()` | (`base`: `string`, `url`: `string`, `allowFragments`: `boolean`) => `string` | [packages/pythonlib/src/urllib.ts:383](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/urllib.ts#L383) |
| <a id="urlparse"></a> `urlparse()` | (`urlstring`: `string`, `scheme`: `string`, `allowFragments`: `boolean`) => [`ParseResult`](/python2ts/api/urllib/interfaces/parseresult/) | [packages/pythonlib/src/urllib.ts:381](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/urllib.ts#L381) |
| <a id="urlunparse"></a> `urlunparse()` | (`components`: [`ParseResult`](/python2ts/api/urllib/interfaces/parseresult/) \| \[`string`, `string`, `string`, `string`, `string`, `string`\]) => `string` | [packages/pythonlib/src/urllib.ts:382](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/urllib.ts#L382) |

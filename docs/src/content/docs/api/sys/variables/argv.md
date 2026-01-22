---
editUrl: false
next: false
prev: false
title: "argv"
---

> `const` **argv**: `string`[]

Defined in: [packages/pythonlib/src/sys.ts:23](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/sys.ts#L23)

Command line arguments passed to the script.
Unlike Python, this excludes the Node.js executable and script path.

## Example

```typescript
// node script.js arg1 arg2
console.log(argv) // ["arg1", "arg2"]
```

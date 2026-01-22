---
editUrl: false
next: false
prev: false
title: "string"
---

> `const` **string**: `object`

Defined in: [packages/pythonlib/src/string.ts:117](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L117)

## Type Declaration

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `capitalize()` | (`s`: `string`) => `string` | Python str.capitalize() | [packages/pythonlib/src/string.ts:226](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L226) |
| `center()` | (`s`: `string`, `width`: `number`, `fillchar`: `string`) => `string` | Python str.center() | [packages/pythonlib/src/string.ts:351](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L351) |
| `count()` | (`s`: `string`, `sub`: `string`, `start?`: `number`, `end?`: `number`) => `number` | Python str.count() | [packages/pythonlib/src/string.ts:309](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L309) |
| `endsWith()` | (`s`: `string`, `suffix`: `string`, `start?`: `number`, `end?`: `number`) => `boolean` | Python str.endsWith() | [packages/pythonlib/src/string.ts:259](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L259) |
| `find()` | (`s`: `string`, `sub`: `string`, `start?`: `number`, `end?`: `number`) => `number` | Python str.find() | [packages/pythonlib/src/string.ts:267](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L267) |
| `format()` | (`s`: `string`, ...`args`: `unknown`[]) => `string` | Python str.format() - basic implementation | [packages/pythonlib/src/string.ts:438](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L438) |
| `index()` | (`s`: `string`, `sub`: `string`, `start?`: `number`, `end?`: `number`) => `number` | Python str.index() - raises error if not found | [packages/pythonlib/src/string.ts:287](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L287) |
| `isAlnum()` | (`s`: `string`) => `boolean` | Python str.isAlnum() | [packages/pythonlib/src/string.ts:410](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L410) |
| `isAlpha()` | (`s`: `string`) => `boolean` | Python str.isAlpha() | [packages/pythonlib/src/string.ts:396](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L396) |
| `isDigit()` | (`s`: `string`) => `boolean` | Python str.isDigit() | [packages/pythonlib/src/string.ts:403](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L403) |
| `isLower()` | (`s`: `string`) => `boolean` | Python str.isLower() | [packages/pythonlib/src/string.ts:431](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L431) |
| `isSpace()` | (`s`: `string`) => `boolean` | Python str.isSpace() | [packages/pythonlib/src/string.ts:417](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L417) |
| `isUpper()` | (`s`: `string`) => `boolean` | Python str.isUpper() | [packages/pythonlib/src/string.ts:424](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L424) |
| `join()` | (`sep`: `string`, `iterable`: `Iterable`\<`string`\>) => `string` | Python str.join() | [packages/pythonlib/src/string.ts:121](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L121) |
| `lJust()` | (`s`: `string`, `width`: `number`, `fillchar`: `string`) => `string` | Python str.lJust() | [packages/pythonlib/src/string.ts:362](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L362) |
| `lower()` | (`s`: `string`) => `string` | Python str.lower() | [packages/pythonlib/src/string.ts:219](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L219) |
| `lStrip()` | (`s`: `string`, `chars?`: `string`) => `string` | Python str.lStrip() | [packages/pythonlib/src/string.ts:190](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L190) |
| `partition()` | (`s`: `string`, `sep`: `string`) => \[`string`, `string`, `string`\] | Python str.partition() | [packages/pythonlib/src/string.ts:378](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L378) |
| `replace()` | (`s`: `string`, `old`: `string`, `newStr`: `string`, `count?`: `number`) => `string` | Python str.replace() | [packages/pythonlib/src/string.ts:324](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L324) |
| `rFind()` | (`s`: `string`, `sub`: `string`, `start?`: `number`, `end?`: `number`) => `number` | Python str.rFind() | [packages/pythonlib/src/string.ts:277](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L277) |
| `rIndex()` | (`s`: `string`, `sub`: `string`, `start?`: `number`, `end?`: `number`) => `number` | Python str.rIndex() - raises error if not found | [packages/pythonlib/src/string.ts:298](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L298) |
| `rJust()` | (`s`: `string`, `width`: `number`, `fillchar`: `string`) => `string` | Python str.rJust() | [packages/pythonlib/src/string.ts:370](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L370) |
| `rPartition()` | (`s`: `string`, `sep`: `string`) => \[`string`, `string`, `string`\] | Python str.rPartition() | [packages/pythonlib/src/string.ts:387](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L387) |
| `rSplit()` | (`s`: `string`, `sep?`: `string`, `maxsplit?`: `number`) => `string`[] | Python str.rSplit() | [packages/pythonlib/src/string.ts:158](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L158) |
| `rStrip()` | (`s`: `string`, `chars?`: `string`) => `string` | Python str.rStrip() | [packages/pythonlib/src/string.ts:201](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L201) |
| `split()` | (`s`: `string`, `sep?`: `string`, `maxsplit?`: `number`) => `string`[] | Python str.split() | [packages/pythonlib/src/string.ts:128](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L128) |
| `startsWith()` | (`s`: `string`, `prefix`: `string`, `start?`: `number`, `end?`: `number`) => `boolean` | Python str.startsWith() | [packages/pythonlib/src/string.ts:251](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L251) |
| `strip()` | (`s`: `string`, `chars?`: `string`) => `string` | Python str.strip() | [packages/pythonlib/src/string.ts:179](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L179) |
| `swapCase()` | (`s`: `string`) => `string` | Python str.swapCase() | [packages/pythonlib/src/string.ts:241](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L241) |
| `title()` | (`s`: `string`) => `string` | Python str.title() | [packages/pythonlib/src/string.ts:234](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L234) |
| `upper()` | (`s`: `string`) => `string` | Python str.upper() | [packages/pythonlib/src/string.ts:212](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L212) |
| `zFill()` | (`s`: `string`, `width`: `number`) => `string` | Python str.zFill() | [packages/pythonlib/src/string.ts:341](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/string.ts#L341) |

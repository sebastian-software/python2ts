---
editUrl: false
next: false
prev: false
title: "strftime"
---

> **strftime**(`format`: `string`, `t?`: [`StructTime`](/python2ts/api/time/interfaces/structtime/)): `string`

Defined in: [packages/pythonlib/src/time.ts:258](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/time.ts#L258)

Format a StructTime as a string using strftime-style format codes.

Supported format codes:
- %Y: Year with century (e.g., 2023)
- %y: Year without century (00-99)
- %m: Month (01-12)
- %d: Day of month (01-31)
- %H: Hour 24-hour (00-23)
- %I: Hour 12-hour (01-12)
- %M: Minute (00-59)
- %S: Second (00-61)
- %p: AM or PM
- %A: Full weekday name
- %a: Abbreviated weekday name
- %B: Full month name
- %b: Abbreviated month name
- %w: Weekday as decimal (0-6, Sunday is 0)
- %j: Day of year (001-366)
- %U: Week number of year (Sunday first day)
- %W: Week number of year (Monday first day)
- %c: Locale's date and time representation
- %x: Locale's date representation
- %X: Locale's time representation
- %%: Literal %

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `format` | `string` | Format string |
| `t?` | [`StructTime`](/python2ts/api/time/interfaces/structtime/) | StructTime object (defaults to current local time) |

## Returns

`string`

Formatted time string

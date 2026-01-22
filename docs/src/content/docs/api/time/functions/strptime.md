---
editUrl: false
next: false
prev: false
title: "strptime"
---

> **strptime**(`timeString`: `string`, `format`: `string`): [`StructTime`](/python2ts/api/time/interfaces/structtime/)

Defined in: [packages/pythonlib/src/time.ts:349](https://github.com/sebastian-software/python2ts/blob/3e1c1ba154961bc8ffd705e01f06d5b2b873edb2/packages/pythonlib/src/time.ts#L349)

Parse a string according to a format and return a StructTime.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `timeString` | `string` | String to parse |
| `format` | `string` | Format string (same codes as strftime) |

## Returns

[`StructTime`](/python2ts/api/time/interfaces/structtime/)

StructTime object

## Throws

Error if string doesn't match format

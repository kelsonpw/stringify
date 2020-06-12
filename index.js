'use strict';

const fs = require('fs');
const partialRight = require('lodash/partialRight');
const unary = require('lodash/unary');
const eq = require('fast-deep-equal');
const fastJson = require('fast-json-stable-stringify');
const diff = require('deep-diff');

const mapJoin = (arr, fn, joiner = ',') =>
  arr
    .map(unary(fn))
    .join(joiner)
    .replace(RegExp(joiner + '$', ''));

function stringify(value) {
  if ([null, undefined].includes(value)) {
    return null;
  }
  if (Array.isArray(value)) {
    return `[${mapJoin(value, stringify)}]`;
  }
  if (typeof value === 'object') {
    return `{${mapJoin(
      Object.entries(value),
      partialRight(mapJoin, stringify, ':')
    )}}`;
  }
  if (typeof value === 'number') {
    return value;
  }
  return `"${value}"`;
}

const rawdata = fs.readFileSync('info.json');
const data = JSON.parse(rawdata);

const native = JSON.stringify(data);
const custom = stringify(data);
const fast = fastJson(data);

const meetsNative = eq(custom, native);
const meetsFast = eq(custom, fast);
const fastMeetsNative = eq(fast, native);

console.log({
  meetsNative,
  meetsFast,
  fastMeetsNative,
  fastDiff: diff(custom, fast),
  nativeDiff: diff(custom, native),
  nativeFastDiff: diff(fast, native),
});

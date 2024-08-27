# mini-bson

<p>
  <img src="https://github.com/concefly/mini-bson/actions/workflows/ci.yml/badge.svg" alt="CI" />
  <img src="https://img.shields.io/npm/dw/mini-bson" alt="npm" />
  <img src="https://img.shields.io/npm/v/mini-bson" alt="npm" />
</p>

A minimal BSON encoder and decoder.

- Zero dependencies
- Super fast
- Only support pure JSON (no `Date`, `RegExp`, `Map`, `Set`, `Buffer`, etc.)

## Install

```bash
npm install mini-bson --save
```

## Usage

```javascript
import { serialize, deserialize } from 'mini-bson';

const buffer = serialize({ a: 1, b: '2', c: [3, 4] });
const obj = deserialize(buffer);

console.log(obj); // { a: 1, b: '2', c: [3, 4] }
```
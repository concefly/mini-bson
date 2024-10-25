import { describe, bench } from 'vitest';
import data1 from './fixtures/data1.json';
import { deserialize, serialize, setFloat64LE } from '../src';
import { BSON } from 'bson';

const bigData: any = {};

for (const key of Array.from({ length: 1000 }, (_, i) => i)) {
  bigData[key + ''] = data1;
}

describe('textEncoderCache', () => {
  const textEncoderCache = new Map();

  bench('default', () => {
    serialize(bigData);
  });

  bench('with cache', () => {
    serialize(bigData, { textEncoderCache });
  });
});

describe('serialize', () => {
  const textEncoderCache = new Map();

  bench('mongodb', () => {
    BSON.serialize(bigData);
  });

  bench('mini-bson', () => {
    serialize(bigData, { textEncoderCache });
  });
});

describe('serialize numbers', () => {
  const textEncoderCache = new Map();
  const workingBuffer = new Uint8Array(1024 * 1024 * 24);

  const data = {
    ns: Array.from({ length: 10000 }, (_, i) => i),
  };

  bench('mongodb', () => {
    BSON.serialize(data);
    BSON.serialize(data);
    BSON.serialize(data);
  });

  bench('mini-bson', () => {
    serialize(data, { textEncoderCache, workingBuffer });
    serialize(data, { textEncoderCache, workingBuffer });
    serialize(data, { textEncoderCache, workingBuffer });
  });
});

describe('deserialize', () => {
  const bin = serialize(bigData);

  bench('mongodb', () => {
    BSON.deserialize(bin);
  });

  bench('mini-bson', () => {
    deserialize(bin);
  });
});

describe('dataview', () => {
  const num = Math.PI;
  const buffer = new Uint8Array(8);

  bench('DataView', () => {
    const view = new DataView(buffer.buffer);
    view.setFloat64(0, num, true);
  });

  bench('util', () => {
    setFloat64LE(buffer, 0, num);
  });
});

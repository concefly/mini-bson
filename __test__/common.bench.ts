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

  bench(
    'default',
    () => {
      serialize(bigData);
    },
    { throws: true }
  );

  bench(
    'with cache',
    () => {
      serialize(bigData, { textEncoderCache });
    },
    { throws: true }
  );
});

describe('serialize', () => {
  const textEncoderCache = new Map();

  bench(
    'mongodb',
    () => {
      BSON.serialize(bigData);
    },
    { throws: true }
  );

  bench(
    'mini-bson',
    () => {
      serialize(bigData, { textEncoderCache });
    },
    { throws: true }
  );
});

describe('serialize numbers', () => {
  const textEncoderCache = new Map();
  const workingBuffer = new Uint8Array(1024 * 1024 * 24);

  const data = {
    ns: Array.from({ length: 10000 }, (_, i) => i),
  };

  bench(
    'mongodb',
    () => {
      const bin = BSON.serialize(data);
    },
    { throws: true }
  );

  bench(
    'mini-bson',
    () => {
      const bin = serialize(data, { textEncoderCache, workingBuffer });
    },
    { throws: true }
  );
});

describe('deserialize', () => {
  const bin = serialize(bigData);

  bench(
    'mongodb',
    () => {
      BSON.deserialize(bin);
    },
    { throws: true }
  );

  bench(
    'mini-bson',
    () => {
      deserialize(bin);
    },
    { throws: true }
  );
});

describe('dataview', () => {
  const num = Math.PI;
  const buffer = new Uint8Array(8);

  bench(
    'DataView',
    () => {
      const view = new DataView(buffer.buffer);
      view.setFloat64(0, num, true);
    },
    { throws: true }
  );

  bench(
    'util',
    () => {
      setFloat64LE(buffer, 0, num);
    },
    { throws: true }
  );
});

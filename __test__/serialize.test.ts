import { serialize, serializeLength } from '../src';
import { BSON } from 'bson';
import data1 from './fixtures/data1.json';

it.each([
  [{ a: 1 }],
  [{ ab: 1.23 }],
  [{ a: 1, b: 'cat', c: 3.14, d: true, e: false, f: null, g: undefined }],
  [{ a: [1, 2, 3.14] }],
  [{ a: [1, 2, 3.14], b: { c: 'cat', d: 3.14, e: true, f: false, g: null, h: undefined } }],
])('serialize %s', input => {
  const length = serializeLength(input);
  const bin = serialize(input);

  expect(bin.length).toBe(length);

  expect(() => serializeLength(input, { maxLimit: length - 1 })).toThrow('Exceed max limit');

  expect(bin).toBeInstanceOf(Uint8Array);
  expect(bin.length).toBeGreaterThan(0);

  const parsed = BSON.deserialize(bin);
  expect(parsed).toEqual(input);
});

it('complex object', () => {
  const bin = serialize(data1);
  expect(BSON.deserialize(bin)).toEqual(data1);
});

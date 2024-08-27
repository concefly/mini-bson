import { deserialize, serialize } from '../src';
import data1 from './fixtures/data1.json';

it.each([
  [{ a: 1 }],
  [{ ab: 1.23 }],
  [{ a: 1, b: 'cat', c: 3.14, d: true, e: false, f: null, g: undefined }],
  [{ a: [1, 2, 3.14] }],
  [{ a: [1, 2, 3.14], b: { c: 'cat', d: 3.14, e: true, f: false, g: null, h: undefined } }],
])('deserialize %s', input => {
  const bin = serialize(input);
  const parsed = deserialize(bin);

  expect(parsed).toEqual(input);
});

it('deserialize empty object', () => {
  const bin = serialize({});
  const parsed = deserialize(bin);

  expect(parsed).toEqual({});
});

it('deserialize complex object', () => {
  const bin = serialize(data1);
  const parsed = deserialize(bin);

  expect(parsed).toEqual(data1);
});

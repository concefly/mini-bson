import Benchmark from 'benchmark';
import data1 from './fixtures/data1.json';
import { serialize } from '../src';
import { BSON } from 'bson';
import { setFloat64LE } from '../src/util';

const bigData: any = {};

for (const key of Array.from({ length: 1000 }, (_, i) => i)) {
  bigData[key + ''] = data1;
}

it('textEncoderCache', done => {
  const suite = new Benchmark.Suite();
  const textEncoderCache = new Map();

  suite
    .add('default', function () {
      serialize(bigData);
    })
    .add('with textEncoderCache', function () {
      serialize(bigData, { textEncoderCache });
    })
    .on('cycle', function (event: any) {
      // console.log(String(event.target));
    })
    .on('complete', function () {
      const fastest = suite.filter('fastest').map('name');
      expect(fastest).toEqual(['with textEncoderCache']);

      done();
    })
    .run({});
});

it('vs mongodb bson', done => {
  const suite = new Benchmark.Suite();
  const textEncoderCache = new Map();

  suite
    .add('mongodb', function () {
      BSON.serialize(bigData);
    })
    .add('mini-bson', function () {
      serialize(bigData, { textEncoderCache });
    })
    .on('cycle', function (event: any) {
      // console.log(String(event.target));
    })
    .on('complete', function () {
      const fastest = suite.filter('fastest').map('name');
      expect(fastest).toEqual(['mini-bson']);

      done();
    })
    .run({});
});

it('dataview', done => {
  const suite = new Benchmark.Suite();
  const num = Math.PI;
  const buffer = new Uint8Array(8);

  suite
    .add('DataView', function () {
      const view = new DataView(buffer.buffer);
      view.setFloat64(0, num, true);
    })
    .add('util', function () {
      setFloat64LE(buffer, 0, num);
    })
    .on('cycle', function (event: any) {
      // console.log(String(event.target));
    })
    .on('complete', function () {
      const fastest = suite.filter('fastest').map('name');
      expect(fastest).toEqual(['util']);

      done();
    })
    .run({});
});

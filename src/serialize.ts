import { ElementType } from './const';
import { setFloat64LE, setInt32LE } from './util';

export type ISerializeOptions = {
  minBufferSize?: number;
  textEncoderCache?: Map<string, Uint8Array>;
  workingBuffer?: Uint8Array;
  duplicate?: boolean;
};

export type ISerializeCountOptions = {
  textEncoderCache?: Map<string, Uint8Array>;
  maxLimit?: number;
};

type ICtx = { buffer: Uint8Array; offset: number; dryRun?: boolean; dryRunMaxLimit?: number; encodeUTF8: (str: string) => Uint8Array };

const DEFAULT_BUFFER = new Uint8Array(1024 * 1024 * 2); // 2MB

export function serialize<T extends Record<string, any>>(obj: T, opt?: ISerializeOptions): Uint8Array {
  const workingBuffer = opt?.workingBuffer || DEFAULT_BUFFER;
  const textEncoderCache = opt?.textEncoderCache;

  const encoder = new TextEncoder();

  const encodeUTF8 = (str: string) => {
    if (!textEncoderCache) return encoder.encode(str);

    let encoded = textEncoderCache.get(str);
    if (!encoded) {
      encoded = encoder.encode(str);
      textEncoderCache.set(str, encoded);
    }
    return encoded;
  };

  const ctx: ICtx = { buffer: workingBuffer, offset: 0, encodeUTF8 };
  encode_document(ctx, obj);

  const duplicate = opt?.duplicate;

  return duplicate ? ctx.buffer.subarray(0, ctx.offset) : ctx.buffer.slice(0, ctx.offset);
}

export function serializeLength<T extends Record<string, any>>(obj: T, opt?: ISerializeCountOptions): number {
  const textEncoderCache = opt?.textEncoderCache;
  const encoder = new TextEncoder();

  const encodeUTF8 = (str: string) => {
    if (!textEncoderCache) return encoder.encode(str);

    let encoded = textEncoderCache.get(str);
    if (!encoded) {
      encoded = encoder.encode(str);
      textEncoderCache.set(str, encoded);
    }
    return encoded;
  };

  const ctx: ICtx = { buffer: null as any, offset: 0, encodeUTF8, dryRun: true, dryRunMaxLimit: opt?.maxLimit };
  encode_document(ctx, obj);

  const length = ctx.offset;
  return length;
}

// signed byte
function encode_signed_byte(ctx: ICtx, byte: number) {
  if (ctx.dryRun) {
    ctx.offset++;
    _dryRunMaxLimitTest(ctx);
  } else {
    ctx.buffer[ctx.offset++] = byte;
  }
}

// unsigned byte
function encode_unsigned_byte(ctx: ICtx, byte: number) {
  if (ctx.dryRun) {
    ctx.offset++;
    _dryRunMaxLimitTest(ctx);
  } else {
    ctx.buffer[ctx.offset++] = byte & 0xff;
  }
}

// int32 (little-endian)
function encode_int32(ctx: ICtx, value: number) {
  if (ctx.dryRun) {
    ctx.offset += 4;
    _dryRunMaxLimitTest(ctx);
  } else {
    setInt32LE(ctx.buffer, ctx.offset, value);
    ctx.offset += 4;
  }
}

// double
function encode_double(ctx: ICtx, value: number) {
  if (ctx.dryRun) {
    ctx.offset += 8;
    _dryRunMaxLimitTest(ctx);
  } else {
    setFloat64LE(ctx.buffer, ctx.offset, value);
    ctx.offset += 8;
  }
}

// string
function encode_string(ctx: ICtx, value: string) {
  const encoded = ctx.encodeUTF8(value);
  encode_int32(ctx, encoded.length + 1);

  if (ctx.dryRun) {
    ctx.offset += encoded.length + 1;
    _dryRunMaxLimitTest(ctx);
  } else {
    ctx.buffer.set(encoded, ctx.offset);
    ctx.offset += encoded.length;
    encode_unsigned_byte(ctx, 0);
  }
}

// cstring
function encode_cstring(ctx: ICtx, value: string) {
  const encoded = ctx.encodeUTF8(value);

  if (ctx.dryRun) {
    ctx.offset += encoded.length + 1;
    _dryRunMaxLimitTest(ctx);
  } else {
    ctx.buffer.set(encoded, ctx.offset);
    ctx.offset += encoded.length;
    encode_unsigned_byte(ctx, 0);
  }
}

// document
function encode_document(ctx: ICtx, value: Record<string, any>) {
  const offset0 = ctx.offset;
  ctx.offset += 4; // reserve 4 bytes for length

  for (const [k, v] of Object.entries(value)) {
    encode_element(ctx, v, k);
  }

  encode_unsigned_byte(ctx, 0);

  if (ctx.dryRun) {
    _dryRunMaxLimitTest(ctx);
  } else {
    const offset1 = ctx.offset;
    const length = offset1 - offset0;

    setInt32LE(ctx.buffer, offset0, length);
  }
}

// element
function encode_element(ctx: ICtx, value: any, key: string) {
  let typeNum: ElementType;

  if (typeof value === 'number') {
    if (Number.isInteger(value)) typeNum = ElementType.Int32;
    else typeNum = ElementType.Double;
  } else if (typeof value === 'string') {
    typeNum = ElementType.String;
  } else if (value === null) {
    typeNum = ElementType.Null;
  } else if (value === undefined) {
    typeNum = ElementType.Undefined;
  } else if (typeof value === 'boolean') {
    typeNum = ElementType.Boolean;
  } else if (typeof value === 'object') {
    if (Array.isArray(value)) {
      typeNum = ElementType.Array;
    } else {
      typeNum = ElementType.Document;
    }
  } else {
    throw new Error('Unsupported type: ' + typeof value);
  }

  encode_signed_byte(ctx, typeNum);
  encode_cstring(ctx, key);

  if (typeNum === ElementType.Double) encode_double(ctx, value);
  else if (typeNum === ElementType.Int32) encode_int32(ctx, value);
  else if (typeNum === ElementType.String) encode_string(ctx, value);
  else if (typeNum === ElementType.Document) encode_document(ctx, value);
  else if (typeNum === ElementType.Array) encode_document(ctx, Object.fromEntries(Object.entries(value)));
  else if (typeNum === ElementType.Boolean) encode_unsigned_byte(ctx, value ? 1 : 0);
  else if (typeNum === ElementType.Null) {
  } else if (typeNum === ElementType.Undefined) {
  } else throw new Error('Unsupported type num: ' + typeNum);
}

function _dryRunMaxLimitTest(ctx: ICtx) {
  if (ctx.dryRun && ctx.dryRunMaxLimit && ctx.offset > ctx.dryRunMaxLimit) {
    throw new Error('Exceed max limit: ' + ctx.dryRunMaxLimit);
  }
}

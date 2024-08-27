import { ElementType } from './const';
import { setFloat64LE, setInt32LE } from './util';

export type ISerializeOptions = {
  minBufferSize?: number;
  textEncoderCache?: Map<string, Uint8Array>;
  workingBuffer?: Uint8Array;
  duplicate?: boolean;
};

type ICtx = { buffer: Uint8Array; offset: number; encodeUTF8: (str: string) => Uint8Array };

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

// signed byte
function encode_signed_byte(ctx: ICtx, byte: number) {
  ctx.buffer[ctx.offset++] = byte;
}

// unsigned byte
function encode_unsigned_byte(ctx: ICtx, byte: number) {
  ctx.buffer[ctx.offset++] = byte & 0xff;
}

// int32 (little-endian)
function encode_int32(ctx: ICtx, value: number) {
  setInt32LE(ctx.buffer, ctx.offset, value);
  ctx.offset += 4;
}

// double
function encode_double(ctx: ICtx, value: number) {
  setFloat64LE(ctx.buffer, ctx.offset, value);
  ctx.offset += 8;
}

// string
function encode_string(ctx: ICtx, value: string) {
  const encoded = ctx.encodeUTF8(value);
  encode_int32(ctx, encoded.length + 1);

  ctx.buffer.set(encoded, ctx.offset);
  ctx.offset += encoded.length;

  encode_unsigned_byte(ctx, 0);
}

// cstring
function encode_cstring(ctx: ICtx, value: string) {
  const encoded = ctx.encodeUTF8(value);
  ctx.buffer.set(encoded, ctx.offset);
  ctx.offset += encoded.length;

  encode_unsigned_byte(ctx, 0);
}

// document
function encode_document(ctx: ICtx, value: Record<string, any>) {
  const offset0 = ctx.offset;
  ctx.offset += 4; // reserve 4 bytes for length

  for (const [k, v] of Object.entries(value)) {
    encode_element(ctx, v, k);
  }

  encode_unsigned_byte(ctx, 0);

  const offset1 = ctx.offset;
  const length = offset1 - offset0;

  setInt32LE(ctx.buffer, offset0, length);
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

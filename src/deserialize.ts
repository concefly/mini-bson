import { ElementType } from './const';
import { getFloat64LE, getInt32LE } from './util';

export type IDeserializeOptions = {};

type ICtx = { buffer: Uint8Array; offset: number };

const decoder = new TextDecoder();

export function deserialize<T = any>(buffer: Uint8Array, opt?: IDeserializeOptions): T {
  const ctx: ICtx = { buffer, offset: 0 };
  return decode_document(ctx);
}

function decode_signed_byte(ctx: ICtx): number {
  return ctx.buffer[ctx.offset++];
}

function decode_unsigned_byte(ctx: ICtx): number {
  return ctx.buffer[ctx.offset++] & 0xff;
}

function decode_int32(ctx: ICtx): number {
  const value = getInt32LE(ctx.buffer, ctx.offset);
  ctx.offset += 4;
  return value;
}

function decode_double(ctx: ICtx): number {
  const value = getFloat64LE(ctx.buffer, ctx.offset);
  ctx.offset += 8;
  return value;
}

function decode_string(ctx: ICtx): string {
  const length = decode_int32(ctx);
  const value = decoder.decode(ctx.buffer.slice(ctx.offset, ctx.offset + length - 1));
  ctx.offset += length - 1 + 1; // Skip the last 0x00
  return value;
}

function decode_cstring(ctx: ICtx): string {
  const start = ctx.offset;
  while (ctx.buffer[ctx.offset++] !== 0) {}
  return decoder.decode(ctx.buffer.slice(start, ctx.offset - 1));
}

function decode_boolean(ctx: ICtx): boolean {
  return decode_unsigned_byte(ctx) === 1;
}

function decode_document(ctx: ICtx): any {
  const length = decode_int32(ctx);
  const end = ctx.offset + length - 5;

  const object: any = {};

  while (ctx.offset < end) {
    decode_element(ctx, object);
  }

  ctx.offset++; // Skip the last 0x00

  return object;
}

// element
function decode_element(ctx: ICtx, object: any) {
  const typeNum = decode_signed_byte(ctx);
  const key = decode_cstring(ctx);

  let value: any;

  switch (typeNum) {
    case ElementType.Double:
      value = decode_double(ctx);
      break;

    case ElementType.String:
      value = decode_string(ctx);
      break;

    case ElementType.Document:
      value = decode_document(ctx);
      break;

    case ElementType.Array:
      const t = decode_document(ctx);
      value = [];

      for (const [k, v] of Object.entries(t)) {
        value[parseInt(k)] = v;
      }

      break;

    case ElementType.Int32:
      value = decode_int32(ctx);
      break;

    case ElementType.Boolean:
      value = decode_boolean(ctx);
      break;

    case ElementType.Undefined:
      value = undefined;
      break;

    case ElementType.Null:
      value = null;
      break;

    default:
      throw new Error('Unsupported type num: ' + typeNum);
  }

  object[key] = value;
}

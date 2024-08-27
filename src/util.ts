const FLOAT = new Float64Array(1);
const FLOAT_BYTES = new Uint8Array(FLOAT.buffer, 0, 8);

export function setFloat64LE(buffer: Uint8Array, offset: number, value: number) {
  FLOAT[0] = value;
  buffer[offset] = FLOAT_BYTES[0];
  buffer[offset + 1] = FLOAT_BYTES[1];
  buffer[offset + 2] = FLOAT_BYTES[2];
  buffer[offset + 3] = FLOAT_BYTES[3];
  buffer[offset + 4] = FLOAT_BYTES[4];
  buffer[offset + 5] = FLOAT_BYTES[5];
  buffer[offset + 6] = FLOAT_BYTES[6];
  buffer[offset + 7] = FLOAT_BYTES[7];
}

export function setInt32LE(buffer: Uint8Array, offset: number, value: number) {
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = (value >> 8) & 0xff;
  buffer[offset + 2] = (value >> 16) & 0xff;
  buffer[offset + 3] = (value >> 24) & 0xff;
}

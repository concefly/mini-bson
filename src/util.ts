const FLOAT64 = new Float64Array(1);
const FLOAT64_BYTES = new Uint8Array(FLOAT64.buffer, 0, 8);

export function setFloat64LE(buffer: Uint8Array, offset: number, value: number) {
  FLOAT64[0] = value;
  buffer[offset] = FLOAT64_BYTES[0];
  buffer[offset + 1] = FLOAT64_BYTES[1];
  buffer[offset + 2] = FLOAT64_BYTES[2];
  buffer[offset + 3] = FLOAT64_BYTES[3];
  buffer[offset + 4] = FLOAT64_BYTES[4];
  buffer[offset + 5] = FLOAT64_BYTES[5];
  buffer[offset + 6] = FLOAT64_BYTES[6];
  buffer[offset + 7] = FLOAT64_BYTES[7];
}

export function getFloat64LE(buffer: Uint8Array, offset: number) {
  FLOAT64_BYTES[0] = buffer[offset];
  FLOAT64_BYTES[1] = buffer[offset + 1];
  FLOAT64_BYTES[2] = buffer[offset + 2];
  FLOAT64_BYTES[3] = buffer[offset + 3];
  FLOAT64_BYTES[4] = buffer[offset + 4];
  FLOAT64_BYTES[5] = buffer[offset + 5];
  FLOAT64_BYTES[6] = buffer[offset + 6];
  FLOAT64_BYTES[7] = buffer[offset + 7];
  return FLOAT64[0];
}

export function setInt32LE(buffer: Uint8Array, offset: number, value: number) {
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = (value >> 8) & 0xff;
  buffer[offset + 2] = (value >> 16) & 0xff;
  buffer[offset + 3] = (value >> 24) & 0xff;
}

export function getInt32LE(buffer: Uint8Array, offset: number) {
  return buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16) | (buffer[offset + 3] << 24);
}

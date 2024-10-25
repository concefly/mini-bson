export const FLOAT64 = new Float64Array(1);
export const FLOAT64_BYTES = new Uint8Array(FLOAT64.buffer, 0, 8);

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

// 达夫设备加速循环
export function batchCall<T>(list: T[], cb: (item: T, index: number) => void) {
  if (list.length === 0) return;

  const _mod = list.length % 16;
  let i = 0;

  switch (_mod) {
    case 15:
      cb(list[i], i++);
    case 14:
      cb(list[i], i++);
    case 13:
      cb(list[i], i++);
    case 12:
      cb(list[i], i++);
    case 11:
      cb(list[i], i++);
    case 10:
      cb(list[i], i++);
    case 9:
      cb(list[i], i++);
    case 8:
      cb(list[i], i++);
    case 7:
      cb(list[i], i++);
    case 6:
      cb(list[i], i++);
    case 5:
      cb(list[i], i++);
    case 4:
      cb(list[i], i++);
    case 3:
      cb(list[i], i++);
    case 2:
      cb(list[i], i++);
    case 1:
      cb(list[i], i++);
  }

  let n = (list.length - _mod) / 16;

  // 每次循环展开 16 次
  while (n--) {
    cb(list[i], i++); // 1
    cb(list[i], i++);
    cb(list[i], i++);
    cb(list[i], i++);
    cb(list[i], i++);
    cb(list[i], i++);
    cb(list[i], i++);
    cb(list[i], i++); // 8
    cb(list[i], i++);
    cb(list[i], i++);
    cb(list[i], i++);
    cb(list[i], i++);
    cb(list[i], i++);
    cb(list[i], i++);
    cb(list[i], i++);
    cb(list[i], i++); // 16
  }
}

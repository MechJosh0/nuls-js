import { Uint64LE } from 'int64-buffer';

export const PLACE_HOLDER = Buffer.from([0xFF, 0xFF, 0xFF, 0xFF]);

export interface IReadData {
  readBytes: number;
  data: any;
}

const hexRegEx = new RegExp('([0-9]|[a-f])', 'gim');

export function isHex(input: string) {
  return hexRegEx.test(input);
}

export function readUint64LE(buffer: Buffer, offset: number): number {
  return (new Uint64LE(buffer, offset)).toNumber();
}

export function writeUint64LE(data: number, buf: Buffer, offset: number): number {
  const big = new Uint64LE(data);
  const formatted = big.toBuffer();
  formatted.copy(buf, offset);
  return offset + formatted.length;
}

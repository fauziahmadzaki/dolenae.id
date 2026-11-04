/** ISO/IEC 18004 QR, byte mode, version 3, correction L, mask 0.
 * ponytail: ASCII <=53 bytes only, sufficient for DUMMY:<UUID> (42 bytes).
 * Return symbol modules only; renderers MUST add a four-module quiet zone.
 * Never contains QRIS/payment-provider instructions or remote metadata URLs.
 */
export function dummyQrMatrix(payload: string): boolean[][] {
  if (payload.length > 53 || /[^\x00-\x7f]/.test(payload)) throw new RangeError("Dummy QR accepts at most 53 ASCII bytes");
  const bits: number[] = [];
  const append = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };
  append(4, 4); append(payload.length, 8);
  for (let i = 0; i < payload.length; i++) append(payload.charCodeAt(i), 8);
  append(0, Math.min(4, 440 - bits.length));
  while (bits.length % 8) bits.push(0);
  const data = Array.from({ length: bits.length / 8 }, (_, i) => bits.slice(i * 8, i * 8 + 8).reduce((a, b) => a * 2 + b, 0));
  for (let pad = 0; data.length < 55; pad++) data.push(pad % 2 ? 0x11 : 0xec);

  // Reed-Solomon (70,55), GF(256), primitive polynomial x^8+x^4+x^3+x^2+1.
  const multiply = (a: number, b: number) => {
    let product = 0;
    for (; b; b >>>= 1) { if (b & 1) product ^= a; a <<= 1; if (a & 0x100) a ^= 0x11d; }
    return product;
  };
  let generator = [1];
  let root = 1;
  for (let i = 0; i < 15; i++) {
    const next = Array<number>(generator.length + 1).fill(0);
    for (let j = 0; j < generator.length; j++) {
      next[j] = next[j]! ^ generator[j]!;
      next[j + 1] = next[j + 1]! ^ multiply(generator[j]!, root);
    }
    generator = next; root = multiply(root, 2);
  }
  const remainder = Array<number>(15).fill(0);
  for (const value of data) {
    const factor = value ^ remainder.shift()!;
    remainder.push(0);
    for (let i = 0; i < 15; i++) remainder[i] = remainder[i]! ^ multiply(generator[i + 1]!, factor);
  }
  const codewords = [...data, ...remainder];
  const size = 29;
  const matrix = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
  const reserved = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
  const set = (x: number, y: number, dark: boolean) => {
    matrix[y]![x] = dark; reserved[y]![x] = true;
  };
  for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  for (const [cx, cy] of [[3, 3], [25, 3], [3, 25]] as const) {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const x = cx + dx, y = cy + dy, d = Math.max(Math.abs(dx), Math.abs(dy));
      if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, d !== 2 && d !== 4);
    }
  }
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(22 + dx, 22 + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  // Format L=01, mask=000, BCH(15,5), xor mask 0x5412.
  const formatData = 1 << 3;
  let bch = formatData;
  for (let i = 0; i < 10; i++) bch = (bch << 1) ^ ((bch >>> 9) * 0x537);
  const format = ((formatData << 10) | bch) ^ 0x5412;
  const bit = (i: number) => ((format >>> i) & 1) !== 0;
  for (let i = 0; i <= 5; i++) set(8, i, bit(i));
  set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
  for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
  for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
  for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
  set(8, size - 8, true);

  let index = 0;
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--;
    for (let vertical = 0; vertical < size; vertical++) {
      const y = ((right + 1) & 2) === 0 ? size - 1 - vertical : vertical;
      for (let dx = 0; dx < 2; dx++) {
        const x = right - dx;
        if (reserved[y]![x]) continue;
        const dark = index < codewords.length * 8 && ((codewords[index >>> 3]! >>> (7 - (index & 7))) & 1) !== 0;
        matrix[y]![x] = dark !== ((x + y) % 2 === 0);
        index++;
      }
    }
  }
  return matrix;
}

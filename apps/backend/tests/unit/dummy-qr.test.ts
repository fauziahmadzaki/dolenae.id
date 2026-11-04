import { describe, expect, it } from "vitest";
import { dummyQrMatrix } from "../../src/utils/dummy-qr";

// Independent reference: Nayuki QR Code generator (MIT), byte mode, v3-L, mask 0,
// boostecl=false. Keep this vector independent of our encoder/decoder.
const payload = "DUMMY:33333333-3333-4333-a333-333333333333";
const reference = [
  "11111110010010011001101111111", "10000010001110011001101000001",
  "10111010111010011001101011101", "10111010011100011001101011101",
  "10111010001000011001101011101", "10000010010000011001001000001",
  "11111110101010101010101111111", "00000000111011100111100000000",
  "11101111101101100110011000100", "00101100101101100000001100110",
  "11100111010001100000001101111", "10011000100101100111101100000",
  "00100110000011100101101101110", "10010100010111100100001101110",
  "00000010011111100010001101111", "01010000111011100110001101000",
  "00011011111101100110001101011", "00110100001101100110011101100",
  "10101010101001100110010100011", "01001001000101100110000101010",
  "10111110111011100110111111011", "00000000100111100110100011010",
  "11111110101111100111101011011", "10000010100011100111100011011",
  "10111010101100100110111111000", "10111010000100000110110011011",
  "10111010100001000110110011001", "10000010101100011110110011010",
  "11111110101010011110110011011",
];

function decode(matrix: boolean[][]) {
  const reserved = Array.from({ length: 29 }, () => Array<boolean>(29).fill(false));
  const rect = (x: number, y: number, w: number, h: number) => {
    for (let row = y; row < y + h; row++) for (let col = x; col < x + w; col++) reserved[row]![col] = true;
  };
  rect(0, 0, 9, 9); rect(21, 0, 8, 9); rect(0, 21, 9, 8); rect(20, 20, 5, 5);
  rect(6, 9, 1, 12); rect(9, 6, 12, 1);
  const bits: number[] = [];
  for (let right = 28; right > 0; right -= 2) {
    if (right === 6) right--;
    for (let vertical = 0; vertical < 29; vertical++) {
      const y = ((right + 1) & 2) === 0 ? 28 - vertical : vertical;
      for (let dx = 0; dx < 2; dx++) {
        const x = right - dx;
        if (!reserved[y]![x]) bits.push(Number(matrix[y]![x] !== ((x + y) % 2 === 0)));
      }
    }
  }
  const codewords = Array.from({ length: 70 }, (_, i) => bits.slice(i * 8, i * 8 + 8).reduce((a, b) => a * 2 + b, 0));
  const multiply = (a: number, b: number) => {
    let product = 0;
    for (; b; b >>= 1) { if (b & 1) product ^= a; a <<= 1; if (a & 256) a ^= 0x11d; }
    return product;
  };
  // Every RS root (alpha^0..alpha^14) must have zero syndrome.
  let root = 1;
  for (let i = 0; i < 15; i++) {
    expect(codewords.reduce((r, v) => multiply(r, root) ^ v, 0)).toBe(0);
    root = multiply(root, 2);
  }
  expect(bits.slice(0, 4)).toEqual([0, 1, 0, 0]);
  const size = bits.slice(4, 12).reduce((a, b) => a * 2 + b, 0);
  return String.fromCharCode(...Array.from({ length: size }, (_, i) => bits.slice(12 + i * 8, 20 + i * 8).reduce((a, b) => a * 2 + b, 0)));
}

describe("standard dummy QR v3-L", () => {
  it("matches an independently generated ISO QR byte-mode matrix", () => {
    expect(dummyQrMatrix(payload).map((row) => row.map(Number).join(""))).toEqual(reference);
  });
  it.each(["", "HELLO", payload, "A".repeat(53)])("roundtrips ASCII text with valid Reed-Solomon syndromes: %s", (text) => {
    expect(decode(dummyQrMatrix(text))).toBe(text);
  });
  it("rejects capacity overflow and non-ASCII rather than truncating", () => {
    expect(() => dummyQrMatrix("A".repeat(54))).toThrow(RangeError);
    expect(() => dummyQrMatrix("gunung 🌋")).toThrow(RangeError);
  });
});

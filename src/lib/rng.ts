// Deterministic PRNG so seeded data is stable across renders / SSR.
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export class Rand {
  private r: () => number;
  constructor(seed: number | string) {
    this.r = mulberry32(typeof seed === "string" ? hashStr(seed) : seed);
  }
  next() {
    return this.r();
  }
  range(lo: number, hi: number) {
    return lo + (hi - lo) * this.r();
  }
  int(lo: number, hi: number) {
    return Math.floor(this.range(lo, hi + 1));
  }
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.r() * arr.length)];
  }
  bool(p = 0.5) {
    return this.r() < p;
  }
  hex(len: number) {
    const chars = "0123456789abcdef";
    let out = "";
    for (let i = 0; i < len; i++) out += chars[Math.floor(this.r() * 16)];
    return out;
  }
  address() {
    return "0x" + this.hex(40);
  }
}

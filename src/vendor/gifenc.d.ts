export type Palette = number[][];

export type QuantizeOptions = {
  format?: 'rgb565' | 'rgb444' | 'rgba4444';
  clearAlpha?: boolean;
  clearAlphaColor?: number;
  clearAlphaThreshold?: number;
  oneBitAlpha?: boolean | number;
  useSqrt?: boolean;
};

export type WriteFrameOptions = {
  palette?: Palette;
  delay?: number;
  repeat?: number;
  transparent?: boolean;
  transparentIndex?: number;
  colorDepth?: number;
  dispose?: number;
  x?: number;
  y?: number;
};

export type Encoder = {
  writeFrame: (index: Uint8Array, width: number, height: number, options?: WriteFrameOptions) => void;
  finish: () => void;
  bytes: () => Uint8Array;
  bytesView: () => Uint8Array;
  reset: () => void;
};

export function quantize(
  data: Uint8Array | Uint8ClampedArray,
  maxColors: number,
  options?: QuantizeOptions,
): Palette;
export function applyPalette(
  data: Uint8Array | Uint8ClampedArray,
  palette: Palette,
  format?: 'rgb565' | 'rgb444' | 'rgba4444',
): Uint8Array;
export function GIFEncoder(options?: { initialCapacity?: number; auto?: boolean }): Encoder;

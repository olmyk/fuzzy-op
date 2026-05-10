import type { FuzzyPoint } from '@/shared/types/fuzzy';

export type FunctionType =
  | 'triangle'
  | 'trapezoid'
  | 'gaussian'
  | 'bell'
  | 'exponential'
  | 'sigmoid'
  | 'sshape'
  | 'zshape'
  | 'pishape';

export const FUNCTION_LABELS: Record<FunctionType, string> = {
  triangle:    'Triangle',
  trapezoid:   'Trapezoid',
  gaussian:    'Gaussian',
  bell:        'Bell-shaped',
  exponential: 'Exponential',
  sigmoid:     'Sigmoid',
  sshape:      'S-shape',
  zshape:      'Z-shape',
  pishape:     'Pi-shape',
};

export const FUNCTION_TYPES_FOR_NUMBERS: FunctionType[] = [
  'triangle', 'trapezoid', 'gaussian', 'bell', 'exponential', 'pishape',
];

export const FUNCTION_TYPES_FOR_SETS: FunctionType[] = [
  'triangle', 'trapezoid', 'gaussian', 'bell', 'exponential', 'pishape',
  'sigmoid', 'sshape', 'zshape',
];

// --- param shapes ---

export interface TriangleParams   { a: number; b: number; c: number }
export interface TrapezoidParams  { a: number; b: number; c: number; d: number }
export interface GaussianParams   { c: number; sigma: number }
export interface BellParams       { a: number; b: number; c: number }
export interface ExponentialParams { lambda: number; c: number }
export interface SigmoidParams    { a: number; c: number }
export interface SShapeParams     { a: number; b: number }
export interface ZShapeParams     { a: number; b: number }
export interface PiShapeParams    { a: number; b: number; c: number; d: number }

export type ParamsByType = {
  triangle:    TriangleParams;
  trapezoid:   TrapezoidParams;
  gaussian:    GaussianParams;
  bell:        BellParams;
  exponential: ExponentialParams;
  sigmoid:     SigmoidParams;
  sshape:      SShapeParams;
  zshape:      ZShapeParams;
  pishape:     PiShapeParams;
};

// --- defaults ---

export const DEFAULT_PARAMS: ParamsByType = {
  triangle:    { a: 0,   b: 0.5,  c: 1    },
  trapezoid:   { a: 0,   b: 0.25, c: 0.75, d: 1 },
  gaussian:    { c: 0,   sigma: 1           },
  bell:        { a: 1,   b: 2,    c: 0     },
  exponential: { lambda: 1, c: 0            },
  sigmoid:     { a: 5,   c: 0               },
  sshape:      { a: 0,   b: 1               },
  zshape:      { a: 0,   b: 1               },
  pishape:     { a: 0,   b: 0.25, c: 0.75, d: 1 },
};

// --- domain (sampling range) ---

export function getDomain(type: FunctionType, params: ParamsByType[FunctionType]): [number, number] {
  switch (type) {
    case 'triangle': {
      const p = params as TriangleParams;
      return [p.a, p.c];
    }
    case 'trapezoid': {
      const p = params as TrapezoidParams;
      return [p.a, p.d];
    }
    case 'gaussian': {
      const p = params as GaussianParams;
      return [p.c - 3 * p.sigma, p.c + 3 * p.sigma];
    }
    case 'bell': {
      const p = params as BellParams;
      return [p.c - 2.5 * p.a, p.c + 2.5 * p.a];
    }
    case 'exponential': {
      const p = params as ExponentialParams;
      const half = 5 / p.lambda;
      return [p.c - half, p.c + half];
    }
    case 'sigmoid': {
      const p = params as SigmoidParams;
      const half = 6 / Math.abs(p.a);
      return [p.c - half, p.c + half];
    }
    case 'sshape': {
      const p = params as SShapeParams;
      return [p.a, p.b];
    }
    case 'zshape': {
      const p = params as ZShapeParams;
      return [p.a, p.b];
    }
    case 'pishape': {
      const p = params as PiShapeParams;
      return [p.a, p.d];
    }
  }
}

// --- µ(x) evaluators ---

function sshapeMu(a: number, b: number, x: number): number {
  if (x <= a) return 0;
  if (x >= b) return 1;
  const mid = (a + b) / 2;
  const span = b - a;
  if (x <= mid) return 2 * Math.pow((x - a) / span, 2);
  return 1 - 2 * Math.pow((x - b) / span, 2);
}

function zshapeMu(a: number, b: number, x: number): number {
  return 1 - sshapeMu(a, b, x);
}

export function evaluateMu(type: FunctionType, params: ParamsByType[FunctionType], x: number): number {
  switch (type) {
    case 'triangle': {
      const { a, b, c } = params as TriangleParams;
      if (x <= a || x >= c) return 0;
      if (x <= b) return (x - a) / (b - a);
      return (c - x) / (c - b);
    }
    case 'trapezoid': {
      const { a, b, c, d } = params as TrapezoidParams;
      if (x <= a || x >= d) return 0;
      if (x <= b) return (x - a) / (b - a);
      if (x <= c) return 1;
      return (d - x) / (d - c);
    }
    case 'gaussian': {
      const { c, sigma } = params as GaussianParams;
      return Math.exp(-Math.pow(x - c, 2) / (2 * sigma * sigma));
    }
    case 'bell': {
      const { a, b, c } = params as BellParams;
      return 1 / (1 + Math.pow(Math.abs((x - c) / a), 2 * b));
    }
    case 'exponential': {
      const { lambda, c } = params as ExponentialParams;
      return Math.exp(-lambda * Math.abs(x - c));
    }
    case 'sigmoid': {
      const { a, c } = params as SigmoidParams;
      return 1 / (1 + Math.exp(-a * (x - c)));
    }
    case 'sshape': {
      const { a, b } = params as SShapeParams;
      return sshapeMu(a, b, x);
    }
    case 'zshape': {
      const { a, b } = params as ZShapeParams;
      return zshapeMu(a, b, x);
    }
    case 'pishape': {
      const { a, b, c, d } = params as PiShapeParams;
      if (x <= a || x >= d) return 0;
      if (x <= b) return sshapeMu(a, b, x);
      if (x <= c) return 1;
      return zshapeMu(c, d, x);
    }
  }
}

const SAMPLE_COUNT = 80;

export function sampleFunction(
  type: FunctionType,
  params: ParamsByType[FunctionType],
): FuzzyPoint[] {
  const [xMin, xMax] = getDomain(type, params);
  if (!isFinite(xMin) || !isFinite(xMax) || xMax <= xMin) return [];

  const step = (xMax - xMin) / (SAMPLE_COUNT - 1);
  const points: FuzzyPoint[] = [];

  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const x = Math.round((xMin + i * step) * 1e9) / 1e9;
    const mu = Math.min(1, Math.max(0, evaluateMu(type, params, x)));
    if (mu > 0) points.push({ x, mu });
  }

  return points;
}

export function getFunctionLabel(type: FunctionType, params: ParamsByType[FunctionType]): string {
  const values = Object.values(params as unknown as Record<string, number>).join(', ');
  return `${FUNCTION_LABELS[type]}(${values})`;
}

// --- random param generation ---

function rand(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

export function randomParams(type: FunctionType): ParamsByType[FunctionType] {
  switch (type) {
    case 'triangle': {
      const b = rand(-2, 2);
      const spread = rand(0.5, 3);
      return { a: Math.round((b - spread) * 100) / 100, b, c: Math.round((b + spread) * 100) / 100 };
    }
    case 'trapezoid': {
      const center = rand(-1, 1);
      const hw = rand(0.5, 2);
      const plateau = rand(0.1, hw * 0.6);
      return {
        a: Math.round((center - hw) * 100) / 100,
        b: Math.round((center - plateau) * 100) / 100,
        c: Math.round((center + plateau) * 100) / 100,
        d: Math.round((center + hw) * 100) / 100,
      };
    }
    case 'gaussian':
      return { c: rand(-2, 2), sigma: rand(0.3, 2) };
    case 'bell':
      return { a: rand(0.5, 3), b: rand(1, 4), c: rand(-2, 2) };
    case 'exponential':
      return { lambda: rand(0.5, 3), c: rand(-2, 2) };
    case 'sigmoid':
      return { a: rand(1, 8), c: rand(-2, 2) };
    case 'sshape':
    case 'zshape': {
      const lo = rand(-2, 0);
      const hi = rand(0.5, 3);
      return { a: lo, b: Math.round((lo + hi) * 100) / 100 };
    }
    case 'pishape': {
      const center = rand(-1, 1);
      const hw = rand(0.5, 2);
      const plateau = rand(0.1, hw * 0.5);
      return {
        a: Math.round((center - hw) * 100) / 100,
        b: Math.round((center - plateau) * 100) / 100,
        c: Math.round((center + plateau) * 100) / 100,
        d: Math.round((center + hw) * 100) / 100,
      };
    }
  }
}

import slugifyLib from 'slugify';

export function slugify(input: string): string {
  return slugifyLib(input, { lower: true, strict: true, trim: true, locale: 'pt' });
}

export function appendNumericSuffix(base: string, n: number): string {
  return n <= 1 ? base : `${base}-${n}`;
}



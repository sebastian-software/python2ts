/**
 * Python math module for TypeScript
 *
 * Provides mathematical functions and constants matching Python's math module.
 * Includes trigonometric, logarithmic, and special functions like factorial and gcd.
 *
 * @see {@link https://docs.python.org/3/library/math.html | Python math documentation}
 * @module
 */

// ============================================================================
// Constants
// ============================================================================

/** Mathematical constant π = 3.141592... */
export const pi = Math.PI

/** Mathematical constant e = 2.718281... */
export const e = Math.E

/** Mathematical constant τ = 2π = 6.283185... */
export const tau = 2 * Math.PI

/** Positive infinity */
export const inf = Infinity

/** Not a Number (NaN) */
export const nan = NaN

// ============================================================================
// Number-theoretic and representation functions
// ============================================================================

/** Return the ceiling of x, the smallest integer greater than or equal to x */
export function ceil(x: number): number {
  return Math.ceil(x)
}

/** Return the floor of x, the largest integer less than or equal to x */
export function floor(x: number): number {
  return Math.floor(x)
}

/** Return the truncated integer part of x (rounds toward zero) */
export function trunc(x: number): number {
  return Math.trunc(x)
}

/** Return the absolute value of x */
export function fabs(x: number): number {
  return Math.abs(x)
}

/** Return x with the sign of y */
export function copysign(x: number, y: number): number {
  const sign = y < 0 || (y === 0 && 1 / y < 0) ? -1 : 1
  return sign * Math.abs(x)
}

/** Return the fractional and integer parts of x */
export function modf(x: number): [number, number] {
  const intPart = Math.trunc(x)
  const fracPart = x - intPart
  return [fracPart, intPart]
}

/** Return the greatest common divisor of a and b */
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.floor(a))
  b = Math.abs(Math.floor(b))
  while (b) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

/** Return the least common multiple of a and b */
export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0
  return Math.abs(Math.floor(a) * Math.floor(b)) / gcd(a, b)
}

/** Return True if x is neither infinity nor NaN */
export function isfinite(x: number): boolean {
  return Number.isFinite(x)
}

/** Return True if x is positive or negative infinity */
export function isinf(x: number): boolean {
  return !Number.isFinite(x) && !Number.isNaN(x)
}

/** Return True if x is NaN */
export function isnan(x: number): boolean {
  return Number.isNaN(x)
}

/** Return True if the values a and b are close to each other */
export function isclose(
  a: number,
  b: number,
  rel_tol: number = 1e-9,
  abs_tol: number = 0.0
): boolean {
  return Math.abs(a - b) <= Math.max(rel_tol * Math.max(Math.abs(a), Math.abs(b)), abs_tol)
}

// ============================================================================
// Power and logarithmic functions
// ============================================================================

/** Return e raised to the power x */
export function exp(x: number): number {
  return Math.exp(x)
}

/** Return e raised to the power x, minus 1 (more accurate for small x) */
export function expm1(x: number): number {
  return Math.expm1(x)
}

/** Return the natural logarithm of x */
export function log(x: number, base?: number): number {
  if (base === undefined) {
    return Math.log(x)
  }
  return Math.log(x) / Math.log(base)
}

/** Return the natural logarithm of 1+x (more accurate for small x) */
export function log1p(x: number): number {
  return Math.log1p(x)
}

/** Return the base-2 logarithm of x */
export function log2(x: number): number {
  return Math.log2(x)
}

/** Return the base-10 logarithm of x */
export function log10(x: number): number {
  return Math.log10(x)
}

/** Return x raised to the power y */
export function pow(x: number, y: number): number {
  return Math.pow(x, y)
}

/** Return the square root of x */
export function sqrt(x: number): number {
  return Math.sqrt(x)
}

/** Return the cube root of x */
export function cbrt(x: number): number {
  return Math.cbrt(x)
}

/** Return the Euclidean norm, sqrt(sum(x**2 for x in args)) */
export function hypot(...args: number[]): number {
  return Math.hypot(...args)
}

// ============================================================================
// Trigonometric functions
// ============================================================================

/** Return the sine of x (x in radians) */
export function sin(x: number): number {
  return Math.sin(x)
}

/** Return the cosine of x (x in radians) */
export function cos(x: number): number {
  return Math.cos(x)
}

/** Return the tangent of x (x in radians) */
export function tan(x: number): number {
  return Math.tan(x)
}

/** Return the arc sine of x, in radians */
export function asin(x: number): number {
  return Math.asin(x)
}

/** Return the arc cosine of x, in radians */
export function acos(x: number): number {
  return Math.acos(x)
}

/** Return the arc tangent of x, in radians */
export function atan(x: number): number {
  return Math.atan(x)
}

/** Return atan(y / x), in radians. The result is between -π and π */
export function atan2(y: number, x: number): number {
  return Math.atan2(y, x)
}

// ============================================================================
// Hyperbolic functions
// ============================================================================

/** Return the hyperbolic sine of x */
export function sinh(x: number): number {
  return Math.sinh(x)
}

/** Return the hyperbolic cosine of x */
export function cosh(x: number): number {
  return Math.cosh(x)
}

/** Return the hyperbolic tangent of x */
export function tanh(x: number): number {
  return Math.tanh(x)
}

/** Return the inverse hyperbolic sine of x */
export function asinh(x: number): number {
  return Math.asinh(x)
}

/** Return the inverse hyperbolic cosine of x */
export function acosh(x: number): number {
  return Math.acosh(x)
}

/** Return the inverse hyperbolic tangent of x */
export function atanh(x: number): number {
  return Math.atanh(x)
}

// ============================================================================
// Angular conversion
// ============================================================================

/** Convert angle x from radians to degrees */
export function degrees(x: number): number {
  return (x * 180) / Math.PI
}

/** Convert angle x from degrees to radians */
export function radians(x: number): number {
  return (x * Math.PI) / 180
}

// ============================================================================
// Special functions
// ============================================================================

/** Return the factorial of n as an integer */
export function factorial(n: number): number {
  n = Math.floor(n)
  if (n < 0) throw new Error("factorial() not defined for negative values")
  if (n === 0 || n === 1) return 1
  let result = 1
  for (let i = 2; i <= n; i++) {
    result *= i
  }
  return result
}

/** Return the sum of products of values from iterables (dot product) */
export function fsum(iterable: Iterable<number>): number {
  // Use Kahan summation for better precision
  let sum = 0
  let c = 0
  for (const x of iterable) {
    const y = x - c
    const t = sum + y
    c = t - sum - y
    sum = t
  }
  return sum
}

/** Return the product of all elements in the iterable */
export function prod(iterable: Iterable<number>, start: number = 1): number {
  let result = start
  for (const x of iterable) {
    result *= x
  }
  return result
}

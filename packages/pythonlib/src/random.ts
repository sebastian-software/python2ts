/**
 * Python random module for TypeScript
 *
 * Provides random number generation functions matching Python's random module.
 * Uses JavaScript's Math.random() as the underlying generator.
 *
 * Note: This is NOT cryptographically secure. For security-sensitive
 * applications, use the Web Crypto API instead.
 *
 * @see {@link https://docs.python.org/3/library/random.html | Python random documentation}
 */

// ============================================================================
// Basic random functions
// ============================================================================

/** Return a random floating point number in the range [0.0, 1.0) */
export function random(): number {
  return Math.random()
}

/** Return a random floating point number N such that a <= N <= b */
export function uniform(a: number, b: number): number {
  return a + Math.random() * (b - a)
}

/** Return a random integer N such that a <= N <= b (inclusive) */
export function randInt(a: number, b: number): number {
  a = Math.floor(a)
  b = Math.floor(b)
  return Math.floor(Math.random() * (b - a + 1)) + a
}

/** Return a randomly selected element from range(start, stop, step) */
export function randRange(start: number, stop?: number, step: number = 1): number {
  if (stop === undefined) {
    stop = start
    start = 0
  }
  if (step === 0) {
    throw new Error("step cannot be zero")
  }

  const numSteps = Math.ceil((stop - start) / step)
  if (numSteps <= 0) {
    throw new Error("empty range for randRange()")
  }

  const randomStep = Math.floor(Math.random() * numSteps)
  return start + randomStep * step
}

// ============================================================================
// Sequence functions
// ============================================================================

/** Return a random element from the non-empty sequence */
export function choice<T>(seq: T[] | string): T | string {
  if (seq.length === 0) {
    throw new Error("Cannot choose from an empty sequence")
  }
  const index = Math.floor(Math.random() * seq.length)
  return seq[index] as T | string
}

/** Return a k-length list of elements chosen from the population with replacement */
export function choices<T>(population: T[], options?: { weights?: number[]; k?: number }): T[] {
  const k = options?.k ?? 1
  const weights = options?.weights

  if (population.length === 0) {
    throw new Error("Cannot choose from an empty population")
  }

  if (weights) {
    if (weights.length !== population.length) {
      throw new Error("weights and population must have the same length")
    }

    // Compute cumulative weights
    const cumWeights: number[] = []
    let total = 0
    for (const w of weights) {
      total += w
      cumWeights.push(total)
    }

    const result: T[] = []
    for (let i = 0; i < k; i++) {
      const r = Math.random() * total
      // Binary search for the index
      let lo = 0
      let hi = cumWeights.length
      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2)
        if (r > (cumWeights[mid] as number)) {
          lo = mid + 1
        } else {
          hi = mid
        }
      }
      result.push(population[lo] as T)
    }
    return result
  }

  const result: T[] = []
  for (let i = 0; i < k; i++) {
    result.push(population[Math.floor(Math.random() * population.length)] as T)
  }
  return result
}

/** Return a k-length list of unique elements chosen from the population (without replacement) */
export function sample<T>(population: T[], k: number): T[] {
  if (k > population.length) {
    throw new Error("Sample larger than population")
  }
  if (k < 0) {
    throw new Error("Sample size cannot be negative")
  }

  // Fisher-Yates shuffle on a copy, take first k elements
  const pool = [...population]
  for (let i = 0; i < k; i++) {
    const j = i + Math.floor(Math.random() * (pool.length - i))
    const temp = pool[i] as T
    pool[i] = pool[j] as T
    pool[j] = temp
  }
  return pool.slice(0, k)
}

/** Shuffle the sequence in place */
export function shuffle(x: unknown[]): void {
  // Fisher-Yates shuffle
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = x[i]
    x[i] = x[j]
    x[j] = temp
  }
}

// ============================================================================
// Real-valued distributions
// ============================================================================

/** Gaussian distribution with mean mu and standard deviation sigma */
export function gauss(mu: number = 0, sigma: number = 1): number {
  // Box-Muller transform
  let u1: number
  let u2: number
  do {
    u1 = Math.random()
    u2 = Math.random()
  } while (u1 === 0)

  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return mu + z * sigma
}

/** Normal distribution (alias for gauss) */
export const normalVariate = gauss

/** Triangular distribution with low, high, and mode */
export function triangular(low: number = 0, high: number = 1, mode?: number): number {
  if (mode === undefined) {
    mode = (low + high) / 2
  }

  const u = Math.random()
  const c = (mode - low) / (high - low)

  if (u < c) {
    return low + Math.sqrt(u * (high - low) * (mode - low))
  }
  return high - Math.sqrt((1 - u) * (high - low) * (high - mode))
}

/** Beta distribution with alpha and beta parameters */
export function betaVariate(alpha: number, beta: number): number {
  // Use the gamma method
  const y = gammaVariate(alpha, 1)
  if (y === 0) return 0
  return y / (y + gammaVariate(beta, 1))
}

/** Exponential distribution with mean 1/lambd */
export function expoVariate(lambd: number): number {
  // lambd is 1.0 divided by the desired mean
  return -Math.log(1 - Math.random()) / lambd
}

/** Gamma distribution with shape alpha and scale beta */
export function gammaVariate(alpha: number, beta: number): number {
  // Marsaglia and Tsang's method
  if (alpha <= 0 || beta <= 0) {
    throw new Error("gammaVariate: alpha and beta must be > 0")
  }

  if (alpha > 1) {
    const d = alpha - 1 / 3
    const c = 1 / Math.sqrt(9 * d)
    for (;;) {
      let x: number
      let v: number
      do {
        x = gauss()
        v = 1 + c * x
      } while (v <= 0)
      v = v * v * v
      const u = Math.random()
      if (u < 1 - 0.0331 * (x * x) * (x * x)) {
        return d * v * beta
      }
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
        return d * v * beta
      }
    }
  } else {
    // alpha <= 1
    const u = Math.random()
    return gammaVariate(1 + alpha, beta) * Math.pow(u, 1 / alpha)
  }
}

/** Log normal distribution */
export function logNormVariate(mu: number, sigma: number): number {
  return Math.exp(gauss(mu, sigma))
}

/** Von Mises distribution (circular data) */
export function vonMisesVariate(mu: number, kappa: number): number {
  if (kappa <= 1e-6) {
    return 2 * Math.PI * Math.random()
  }

  const s = 0.5 / kappa
  const r = s + Math.sqrt(1 + s * s)

  for (;;) {
    const u1 = Math.random()
    const z = Math.cos(Math.PI * u1)
    const d = z / (r + z)
    const u2 = Math.random()
    if (u2 < 1 - d * d || u2 <= (1 - d) * Math.exp(d)) {
      const q = 1 / r
      const f = (q + z) / (1 + q * z)
      const u3 = Math.random()
      if (u3 > 0.5) {
        return (mu + Math.acos(f)) % (2 * Math.PI)
      }
      return (mu - Math.acos(f)) % (2 * Math.PI)
    }
  }
}

/** Pareto distribution */
export function paretoVariate(alpha: number): number {
  const u = 1 - Math.random()
  return 1 / Math.pow(u, 1 / alpha)
}

/** Weibull distribution */
export function weibullVariate(alpha: number, beta: number): number {
  const u = 1 - Math.random()
  return alpha * Math.pow(-Math.log(u), 1 / beta)
}

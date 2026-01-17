/**
 * Python itertools module for TypeScript
 *
 * Provides iterator building blocks inspired by Python's itertools module.
 *
 * Design Decision (ADR-0008):
 * - Most functions return eager arrays for better debugging and familiarity
 * - Only infinite sequences (cycle, repeat without count) use generators
 */

/**
 * Chain multiple iterables together into a single array
 * chain([1, 2], [3, 4]) -> [1, 2, 3, 4]
 */
export function chain<T>(...iterables: Iterable<T>[]): T[] {
  return iterables.flatMap((it) => [...it])
}

/**
 * Return successive r-length combinations of elements
 * combinations([1, 2, 3], 2) -> [[1, 2], [1, 3], [2, 3]]
 */
export function combinations<T>(iterable: Iterable<T>, r: number): T[][] {
  const pool = [...iterable]
  const n = pool.length
  if (r > n || r < 0) return []

  const result: T[][] = []
  const indices = Array.from({ length: r }, (_, i) => i)
  result.push(indices.map((i) => pool[i]!))

  while (true) {
    let i = r - 1
    while (i >= 0 && indices[i] === i + n - r) i--
    if (i < 0) break
    indices[i]!++
    for (let j = i + 1; j < r; j++) {
      indices[j] = indices[j - 1]! + 1
    }
    result.push(indices.map((i) => pool[i]!))
  }

  return result
}

/**
 * Return successive r-length permutations of elements
 * permutations([1, 2, 3], 2) -> [[1, 2], [1, 3], [2, 1], [2, 3], [3, 1], [3, 2]]
 */
export function permutations<T>(iterable: Iterable<T>, r?: number): T[][] {
  const pool = [...iterable]
  const n = pool.length
  r = r === undefined ? n : r
  if (r > n || r < 0) return []

  const result: T[][] = []
  const indices = Array.from({ length: n }, (_, i) => i)
  const cycles = Array.from({ length: r }, (_, i) => n - i)

  result.push(indices.slice(0, r).map((i) => pool[i]!))

  outer: while (true) {
    for (let i = r - 1; i >= 0; i--) {
      cycles[i]!--
      if (cycles[i] === 0) {
        // Rotate indices[i:] left by one
        const temp = indices[i]!
        for (let j = i; j < n - 1; j++) {
          indices[j] = indices[j + 1]!
        }
        indices[n - 1] = temp
        cycles[i] = n - i
      } else {
        const j = n - cycles[i]!
        ;[indices[i], indices[j]] = [indices[j]!, indices[i]!]
        result.push(indices.slice(0, r).map((i) => pool[i]!))
        continue outer
      }
    }
    break
  }

  return result
}

/**
 * Cartesian product of input iterables
 * product([1, 2], ['a', 'b']) -> [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']]
 */
export function product<T>(...iterables: Iterable<T>[]): T[][] {
  if (iterables.length === 0) return [[]]

  const pools = iterables.map((it) => [...it])

  // Check if any pool is empty
  if (pools.some((p) => p.length === 0)) return []

  const result: T[][] = []
  const indices = new Array(pools.length).fill(0)
  result.push(pools.map((p, i) => p[indices[i]!]!))

  while (true) {
    let i = pools.length - 1
    while (i >= 0) {
      indices[i]!++
      if (indices[i]! < pools[i]!.length) {
        result.push(pools.map((p, j) => p[indices[j]!]!))
        break
      }
      indices[i] = 0
      i--
    }
    if (i < 0) break
  }

  return result
}

/**
 * Cycle through an iterable indefinitely (INFINITE - returns Generator)
 * cycle([1, 2, 3]) -> 1, 2, 3, 1, 2, 3, 1, 2, 3, ...
 *
 * WARNING: This is infinite! Use with for...of and break, or islice.
 */
export function* cycle<T>(iterable: Iterable<T>): Generator<T> {
  const saved: T[] = []
  for (const element of iterable) {
    yield element
    saved.push(element)
  }
  if (saved.length === 0) return
  while (true) {
    yield* saved
  }
}

/**
 * Repeat an object. If times is specified, returns an array. Otherwise returns
 * an infinite generator.
 *
 * repeat('x', 3) -> ['x', 'x', 'x']
 * repeat('x') -> Generator that yields 'x' forever (INFINITE)
 */
export function repeat<T>(obj: T, times?: number): T[] | Generator<T> {
  if (times !== undefined) {
    // Finite: return array
    return Array.from({ length: times }, () => obj)
  }
  // Infinite: return generator
  return (function* () {
    while (true) {
      yield obj
    }
  })()
}

/**
 * Slice an iterable from start to stop with step
 * islice([1, 2, 3, 4, 5], 1, 4) -> [2, 3, 4]
 * islice([1, 2, 3, 4, 5], 3) -> [1, 2, 3]
 */
export function islice<T>(
  iterable: Iterable<T>,
  start: number,
  stop?: number,
  step: number = 1
): T[] {
  // Handle single argument (stop only): islice(it, 5) means islice(it, 0, 5, 1)
  if (stop === undefined) {
    stop = start
    start = 0
  }

  if (step < 1) {
    throw new Error("step must be >= 1")
  }

  const result: T[] = []
  let index = 0
  let nextIndex = start

  for (const element of iterable) {
    if (index >= stop) break
    if (index === nextIndex) {
      result.push(element)
      nextIndex += step
    }
    index++
  }

  return result
}

/**
 * Take elements while predicate is true
 * takewhile(x => x < 5, [1, 4, 6, 4, 1]) -> [1, 4]
 */
export function takewhile<T>(predicate: (x: T) => boolean, iterable: Iterable<T>): T[] {
  const result: T[] = []
  for (const element of iterable) {
    if (predicate(element)) {
      result.push(element)
    } else {
      break
    }
  }
  return result
}

/**
 * Skip elements while predicate is true, then return the rest
 * dropwhile(x => x < 5, [1, 4, 6, 4, 1]) -> [6, 4, 1]
 */
export function dropwhile<T>(predicate: (x: T) => boolean, iterable: Iterable<T>): T[] {
  const result: T[] = []
  let dropping = true
  for (const element of iterable) {
    if (dropping && predicate(element)) {
      continue
    }
    dropping = false
    result.push(element)
  }
  return result
}

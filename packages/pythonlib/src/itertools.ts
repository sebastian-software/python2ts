/**
 * Python itertools module for TypeScript
 *
 * Provides iterator building blocks inspired by Python's itertools module.
 * Includes functions for permutations, combinations, grouping, and chaining iterables.
 *
 * @see {@link https://docs.python.org/3/library/itertools.html | Python itertools documentation}
 * @module
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
  const indices: number[] = Array.from({ length: r }, (_, i) => i)
  result.push(indices.map((i) => pool[i] as T))

  for (;;) {
    let i = r - 1
    while (i >= 0 && indices[i] === i + n - r) i--
    if (i < 0) break
    ;(indices[i] as number)++
    for (let j = i + 1; j < r; j++) {
      indices[j] = (indices[j - 1] as number) + 1
    }
    result.push(indices.map((idx) => pool[idx] as T))
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
  const rLen = r === undefined ? n : r
  if (rLen > n || rLen < 0) return []

  const result: T[][] = []
  const indices: number[] = Array.from({ length: n }, (_, i) => i)
  const cycles: number[] = Array.from({ length: rLen }, (_, i) => n - i)

  result.push(indices.slice(0, rLen).map((i) => pool[i] as T))

  outer: for (;;) {
    for (let i = rLen - 1; i >= 0; i--) {
      ;(cycles[i] as number)--
      if (cycles[i] === 0) {
        // Rotate indices[i:] left by one
        const temp = indices[i] as number
        for (let j = i; j < n - 1; j++) {
          indices[j] = indices[j + 1] as number
        }
        indices[n - 1] = temp
        cycles[i] = n - i
      } else {
        const j = n - (cycles[i] as number)
        const swap = indices[j] as number
        indices[j] = indices[i] as number
        indices[i] = swap
        result.push(indices.slice(0, rLen).map((idx) => pool[idx] as T))
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
  const indices: number[] = new Array<number>(pools.length).fill(0)
  result.push(pools.map((p, i) => p[indices[i] as number] as T))

  for (;;) {
    let i = pools.length - 1
    while (i >= 0) {
      ;(indices[i] as number)++
      const currentPool = pools[i] as T[]
      if ((indices[i] as number) < currentPool.length) {
        result.push(pools.map((p, j) => p[indices[j] as number] as T))
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
  for (;;) {
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
    for (;;) {
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
  let actualStart = start
  let actualStop = stop
  if (actualStop === undefined) {
    actualStop = start
    actualStart = 0
  }

  if (step < 1) {
    throw new Error("step must be >= 1")
  }

  const result: T[] = []
  let index = 0
  let nextIndex = actualStart

  for (const element of iterable) {
    if (index >= actualStop) break
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
 * takeWhile(x => x < 5, [1, 4, 6, 4, 1]) -> [1, 4]
 */
export function takeWhile<T>(predicate: (x: T) => boolean, iterable: Iterable<T>): T[] {
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
 * dropWhile(x => x < 5, [1, 4, 6, 4, 1]) -> [6, 4, 1]
 */
export function dropWhile<T>(predicate: (x: T) => boolean, iterable: Iterable<T>): T[] {
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

/**
 * Zip iterables together, filling missing values with fillvalue
 * zipLongest([1, 2, 3], ['a', 'b'], { fillvalue: '-' }) -> [[1, 'a'], [2, 'b'], [3, '-']]
 */
export function zipLongest<T>(
  ...args: [...Iterable<T>[], { fillvalue?: T }] | Iterable<T>[]
): T[][] {
  let fillvalue: T | undefined
  let iterables: Iterable<T>[]

  // Check if last argument is options object
  const lastArg = args[args.length - 1]
  if (
    lastArg &&
    typeof lastArg === "object" &&
    !Array.isArray(lastArg) &&
    !(Symbol.iterator in lastArg)
  ) {
    fillvalue = (lastArg as { fillvalue?: T }).fillvalue
    iterables = args.slice(0, -1) as Iterable<T>[]
  } else {
    iterables = args as Iterable<T>[]
  }

  if (iterables.length === 0) return []

  const arrays = iterables.map((it) => [...it])
  const maxLen = Math.max(...arrays.map((a) => a.length))
  const result: T[][] = []

  for (let i = 0; i < maxLen; i++) {
    const tuple: T[] = []
    for (const arr of arrays) {
      tuple.push(i < arr.length ? (arr[i] as T) : (fillvalue as T))
    }
    result.push(tuple)
  }

  return result
}

/**
 * Return elements from iterable where the corresponding selector is true
 * compress([1, 2, 3, 4, 5], [1, 0, 1, 0, 1]) -> [1, 3, 5]
 */
export function compress<T>(data: Iterable<T>, selectors: Iterable<unknown>): T[] {
  const result: T[] = []
  const dataArr = [...data]
  const selectorsArr = [...selectors]
  const len = Math.min(dataArr.length, selectorsArr.length)

  for (let i = 0; i < len; i++) {
    if (selectorsArr[i]) {
      result.push(dataArr[i] as T)
    }
  }
  return result
}

/**
 * Return elements for which predicate is false
 * filterFalse(x => x % 2, [1, 2, 3, 4, 5]) -> [2, 4]
 */
export function filterFalse<T>(predicate: (x: T) => unknown, iterable: Iterable<T>): T[] {
  const result: T[] = []
  for (const element of iterable) {
    if (!predicate(element)) {
      result.push(element)
    }
  }
  return result
}

/**
 * Make an iterator that returns accumulated sums or accumulated results
 * accumulate([1, 2, 3, 4, 5]) -> [1, 3, 6, 10, 15]
 * accumulate([1, 2, 3, 4, 5], (x, y) => x * y) -> [1, 2, 6, 24, 120]
 */
export function accumulate<T>(
  iterable: Iterable<T>,
  func?: (acc: T, val: T) => T,
  initial?: T
): T[] {
  const result: T[] = []
  const arr = [...iterable]

  if (arr.length === 0) {
    if (initial !== undefined) {
      return [initial]
    }
    return []
  }

  const operation = func ?? ((a: T, b: T): T => ((a as number) + (b as number)) as unknown as T)

  let acc: T
  let startIdx: number

  if (initial !== undefined) {
    acc = initial
    startIdx = 0
    result.push(acc)
  } else {
    acc = arr[0] as T
    startIdx = 1
    result.push(acc)
  }

  for (let i = startIdx; i < arr.length; i++) {
    acc = operation(acc, arr[i] as T)
    result.push(acc)
  }

  return result
}

/**
 * Return consecutive keys and groups from the iterable
 * groupby([1, 1, 2, 2, 2, 3, 1, 1]) -> [[1, [1, 1]], [2, [2, 2, 2]], [3, [3]], [1, [1, 1]]]
 */
export function groupby<T, K = T>(iterable: Iterable<T>, key?: (x: T) => K): [K, T[]][] {
  const result: [K, T[]][] = []
  const keyFunc = key ?? ((x: T) => x as unknown as K)

  let currentKey: K | undefined
  let currentGroup: T[] = []
  let first = true

  for (const element of iterable) {
    const k = keyFunc(element)
    if (first) {
      currentKey = k
      currentGroup = [element]
      first = false
    } else if (k === currentKey) {
      currentGroup.push(element)
    } else {
      result.push([currentKey as K, currentGroup])
      currentKey = k
      currentGroup = [element]
    }
  }

  if (!first) {
    result.push([currentKey as K, currentGroup])
  }

  return result
}

/**
 * Make an iterator that returns evenly spaced values starting with n
 * count(10, 2) -> 10, 12, 14, 16, 18, ...  (INFINITE Generator)
 */
export function* count(start: number = 0, step: number = 1): Generator<number> {
  let n = start
  for (;;) {
    yield n
    n += step
  }
}

/**
 * Return n independent iterators from a single iterable
 * tee([1, 2, 3], 2) -> [[1, 2, 3], [1, 2, 3]]
 */
export function tee<T>(iterable: Iterable<T>, n: number = 2): T[][] {
  const arr = [...iterable]
  return Array.from({ length: n }, () => [...arr])
}

/**
 * Return successive overlapping pairs from the iterable
 * pairwise([1, 2, 3, 4, 5]) -> [[1, 2], [2, 3], [3, 4], [4, 5]]
 */
export function pairwise<T>(iterable: Iterable<T>): [T, T][] {
  const arr = [...iterable]
  const result: [T, T][] = []
  for (let i = 0; i < arr.length - 1; i++) {
    result.push([arr[i] as T, arr[i + 1] as T])
  }
  return result
}

/**
 * Cartesian product with repeat (product(range(3), repeat=2) like nested loops)
 * productRepeat([0, 1], 2) -> [[0, 0], [0, 1], [1, 0], [1, 1]]
 */
export function productRepeat<T>(iterable: Iterable<T>, repeat: number = 1): T[][] {
  const pool = [...iterable]
  if (repeat < 1 || pool.length === 0) return repeat === 0 ? [[]] : []

  const pools = Array.from({ length: repeat }, () => pool)
  return product(...pools)
}

/**
 * Return r-length combinations with replacement
 * combinationsWithReplacement([1, 2, 3], 2) -> [[1, 1], [1, 2], [1, 3], [2, 2], [2, 3], [3, 3]]
 */
export function combinationsWithReplacement<T>(iterable: Iterable<T>, r: number): T[][] {
  const pool = [...iterable]
  const n = pool.length
  if (r < 0 || n === 0) return r === 0 ? [[]] : []

  const result: T[][] = []
  const indices: number[] = new Array<number>(r).fill(0)
  result.push(indices.map((i) => pool[i] as T))

  for (;;) {
    let i = r - 1
    while (i >= 0 && indices[i] === n - 1) i--
    if (i < 0) break
    const newVal = (indices[i] as number) + 1
    for (let j = i; j < r; j++) {
      indices[j] = newVal
    }
    result.push(indices.map((idx) => pool[idx] as T))
  }

  return result
}

/**
 * Split an iterable into chunks of specified size.
 * @inspired Remeda, Lodash
 *
 * chunk([1, 2, 3, 4, 5], 2) -> [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(iterable: Iterable<T>, size: number): T[][] {
  if (size < 1) {
    throw new Error("chunk size must be at least 1")
  }
  const arr = [...iterable]
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

/**
 * Partition an iterable into two arrays based on a predicate.
 * @inspired Remeda, Lodash
 *
 * partition([1, 2, 3, 4], x => x % 2 === 0) -> [[2, 4], [1, 3]]
 */
export function partition<T>(iterable: Iterable<T>, predicate: (x: T) => boolean): [T[], T[]] {
  const truthy: T[] = []
  const falsy: T[] = []
  for (const item of iterable) {
    if (predicate(item)) {
      truthy.push(item)
    } else {
      falsy.push(item)
    }
  }
  return [truthy, falsy]
}

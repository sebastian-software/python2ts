/**
 * Python dict methods for TypeScript
 * Usage: py.dict.get(), py.dict.keys(), etc.
 */

export const dict = {
  /**
   * Python dict.get() - get value with optional default
   */
  get<K extends string | number | symbol, V>(
    obj: Record<K, V>,
    key: K,
    defaultValue?: V
  ): V | undefined {
    return key in obj ? obj[key] : defaultValue
  },

  /**
   * Python dict.setDefault() - get value or set default
   */
  setDefault<K extends string | number | symbol, V>(obj: Record<K, V>, key: K, defaultValue: V): V {
    if (!(key in obj)) {
      obj[key] = defaultValue
    }
    return obj[key]
  },

  /**
   * Python dict.pop() - remove and return value
   */
  pop<K extends string | number | symbol, V>(
    obj: Record<K, V>,
    key: K,
    defaultValue?: V
  ): V | undefined {
    if (key in obj) {
      const value = obj[key]
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete obj[key]
      return value
    }
    if (defaultValue !== undefined) {
      return defaultValue
    }
    throw new Error("KeyError")
  },

  /**
   * Python dict.popItem() - remove and return last item
   */
  popItem<K extends string | number | symbol, V>(obj: Record<K, V>): [K, V] {
    const keys = Object.keys(obj) as K[]
    const key = keys.pop()
    if (key === undefined) {
      throw new Error("dictionary is empty")
    }
    const value = obj[key]
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete obj[key]
    return [key, value]
  },

  /**
   * Python dict.update() - update with another dict
   */
  update<K extends string | number | symbol, V>(
    obj: Record<K, V>,
    other: Record<K, V> | Iterable<[K, V]>
  ): void {
    if (Symbol.iterator in other) {
      for (const [k, v] of other) {
        obj[k] = v
      }
    } else {
      Object.assign(obj, other)
    }
  },

  /**
   * Python dict.clear() - remove all items
   */
  clear<K extends string | number | symbol, V>(obj: Record<K, V>): void {
    for (const key of Object.keys(obj)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete obj[key as K]
    }
  },

  /**
   * Python dict.copy() - shallow copy
   */
  copy<K extends string | number | symbol, V>(obj: Record<K, V>): Record<K, V> {
    return { ...obj }
  },

  /**
   * Python dict.keys() - returns iterable of keys
   */
  keys<K extends string | number | symbol, V>(obj: Record<K, V>): K[] {
    return Object.keys(obj) as K[]
  },

  /**
   * Python dict.values() - returns iterable of values
   */
  values<K extends string | number | symbol, V>(obj: Record<K, V>): V[] {
    return Object.values(obj)
  },

  /**
   * Python dict.items() - returns iterable of [key, value] pairs
   */
  items<K extends string | number | symbol, V>(obj: Record<K, V>): [K, V][] {
    return Object.entries(obj) as [K, V][]
  },

  /**
   * Python dict.fromKeys() - create dict from keys
   */
  fromKeys<K extends string | number | symbol, V>(keys: K[], value?: V): Record<K, V | undefined> {
    const result = {} as Record<K, V | undefined>
    for (const key of keys) {
      result[key] = value
    }
    return result
  }
}

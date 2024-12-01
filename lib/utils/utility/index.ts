export class Utility {
  /**
   * Enhanced find method for Map that supports the existing usage pattern
   * @param map The map to search
   * @param predicate A predicate function to find a matching value
   * @returns The first matching value or undefined
   * @example ```ts
   * // Map finding
   * const userMap = new Map([
   * ['1', { name: 'John', age: 30 }],
   * ['2', { name: 'Jane', age: 25 }]
   * ]);
   * const foundUser = MapUtils.find(userMap, user => user.age > 25);
   * console.log(foundUser); // { name: 'John', age: 30 }
   * ```
   */
  find<K, V>(
    map: Map<K, V>,
    predicate: (value: V, key?: K, collection?: Map<K, V>) => boolean
  ): V | undefined {
    for (const [key, value] of map) {
      if (predicate(value, key, map)) return value;
    }
    return undefined;
  }

  /**
   * Formats a string by replacing placeholders with values from a dictionary
   * @param template The original string with {key} placeholders
   * @param dict A dictionary of key-value pairs for replacement
   * @returns Formatted string
   * @example ```ts
   * // String formatting
   * const formatted = StringUtils.format('Hello, {name}!', { name: 'John' });
   * console.log(formatted); // "Hello, John!"
   *
   * ```
   */
  format(template: string, dict: Record<string, any>): string {
    return template.replace(/{(\w+)}/g, (match: string, key: string) =>
      dict[key] !== undefined ? dict[key] : match
    );
  }

  /**
   * Selects a random item from an array
   * @param array The array to select from
   * @returns A random item from the array
   * @example ```ts
   * // Random array item
   * const fruits = ['apple', 'banana', 'cherry'];
   * const randomFruit = ArrayUtils.random(fruits);
   * console.log(randomFruit); // Randomly selected fruit
   * ```
   */
  random<T>(array: Array<T>): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}

export const utility = new Utility();

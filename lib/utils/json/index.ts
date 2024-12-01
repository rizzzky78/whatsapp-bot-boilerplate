/**
 * Safely converts a value to a JSON string with optional formatting
 *
 * @template T - The type of the input value
 * @param {T} value - The value to be converted to JSON
 * @param {number} [space=2] - Number of spaces for indentation (default: 2)
 * @returns {string} Formatted JSON string
 * @throws {Error} If the value cannot be stringified
 */
export function toJSON<T>(value: T, space: number = 2): string {
  try {
    // Handle special cases like undefined or functions
    if (value === undefined || typeof value === "function") {
      throw new Error("Cannot stringify undefined or function");
    }

    // Use replacer to handle circular references and complex objects
    const jsonString = JSON.stringify(
      value,
      (key, val) => {
        // Handle potential circular references
        if (val !== null && typeof val === "object") {
          if (Array.isArray(val)) {
            return val;
          }
          return { ...val }; // Create a shallow copy to break potential circular refs
        }
        return val;
      },
      space
    );

    return jsonString;
  } catch (error) {
    // Provide a more informative error message
    throw new Error(
      `Failed to convert to JSON: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Safely parses a JSON string to the specified type
 *
 * @template T - The expected return type
 * @param {string} jsonString - The JSON string to parse
 * @returns {T} Parsed JSON object
 * @throws {Error} If the JSON is invalid or parsing fails
 */
export function fromJSON<T>(jsonString: string): T {
  try {
    // Trim whitespace to handle potential formatting issues
    const trimmedJsonString = jsonString.trim();

    // Validate input
    if (!trimmedJsonString) {
      throw new Error("Empty JSON string");
    }

    // Parse with reviver to handle date parsing and other custom transformations
    return JSON.parse(trimmedJsonString, (key, value) => {
      // Example of date parsing - you can extend this as needed
      const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
      if (typeof value === "string" && dateFormat.test(value)) {
        return new Date(value);
      }
      return value;
    }) as T;
  } catch (error) {
    // Provide a detailed error message
    throw new Error(
      `Failed to parse JSON: ${
        error instanceof Error ? error.message : "Invalid JSON"
      }`
    );
  }
}

/**
 * Safely checks if a string is valid JSON
 *
 * @param {string} jsonString - The string to validate
 * @returns {boolean} Whether the string is valid JSON
 */
export function isValidJSON(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

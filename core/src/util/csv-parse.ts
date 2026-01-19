import Papa from 'papaparse';
import type { z } from 'zod';

// 1. Define the shape of our output
interface CsvParseResult<T> {
  data: T[];
  errors: CsvError[];
}

interface CsvError {
  row: number; // 1-based row index (Excel style)
  message: string; // The error message
  field?: string; // Which column failed (if known)
  value?: any; // The raw value that caused the error
}

/**
 * Parses a CSV string and validates rows against a Zod schema.
 * * @param csvString - The raw CSV content.
 * @param schema - The Zod schema to validate each row against.
 * @param options - Optional overrides for PapaParse config.
 */
export function parseAndValidateCsv<T extends z.ZodTypeAny>(
  csvString: string,
  schema: T,
  options: Papa.ParseConfig = {},
): CsvParseResult<z.infer<T>> {
  const validData: Array<z.infer<T>> = [];
  const errors: CsvError[] = [];

  // 1. Parse raw text to untyped objects
  const parseResult = Papa.parse(csvString, {
    header: true, // Expect first row to be headers
    skipEmptyLines: true, // Ignore empty lines
    dynamicTyping: true, // Attempt to convert "123" to 123, "true" to true
    ...options, // Allow caller to override
  });

  // 2. Handle CSV-level structural errors (e.g., malformed delimiters)
  parseResult.errors.forEach(err => {
    errors.push({
      row: err.row + 1, // Adjust for 0-index if needed, usually Papa returns 0-index
      message: `CSV Syntax Error: ${err.message}`,
    });
  });

  // 3. Validate each row against the Schema
  parseResult.data.forEach((row, index) => {
    // Row index + 2 because: 0-indexed array + 1 for header row = actual line number
    const rowIndex = index + 2;

    const validation = schema.safeParse(row);

    if (!validation.success) {
      // Extract detailed Zod error messages
      errors.push({
        row: rowIndex,
        message: JSON.stringify(validation),
        field: '',
        value: undefined,
      });
    } else {
      validData.push(validation.data);
    }
  });

  return { data: validData, errors };
}

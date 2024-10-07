/**
 * Represents a location in the input (source code). Keeps track of `index` (for
 * use with `.slice` and such), as well as `line` and `column` for displaying to
 * users.
 *
 * The `index` is counted as you would normally index a string for use with `.slice` and such.
 * But the `line` and `column` properly count complex Unicode characters like emojis.
 * Each `\n` character separates lines.
 */
export interface SourceLocation {
  /** The string index into the input (e.g. for use with `.slice`) */
  index: number;

  /**
   * The line number for error reporting. Only the character `\n` is used to
   * signify the beginning of a new line.
   *
   * > [!NOTE]
   * > This is 1-indexed.
   */
  line: number;

  /**
   * The column number for error reporting.
   *
   * > [!NOTE]
   * > This is 1-indexed.
   */
  column: number;
}

export const defaultLocation = {
  index: 0,
  line: 1,
  column: 1,
} as const satisfies SourceLocation;

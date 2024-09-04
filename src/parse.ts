import { skip } from "./skip.ts";
import { eof } from "./eof.ts";
import type { DeepReadonly } from "./deep_readonly.ts";
import type { Parser } from "./parser.ts";
import { formatLocation, init, type Reader } from "./reader.ts";

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

/**
 * Returns a parse result with either the value or error information.
 *
 * Parses the entire `input` string, returning a {@linkcode ParserResult} with
 * the parse value if successful, otherwise a failure value indicating where the
 * error is and what values we were looking for at the time of failure.
 *
 * > [!NOTE]
 * > `parse` assumes you are parsing the entire input and will fail unless you do so.
 *
 * @example
 * ```ts
 * import { text, parse } from "@takker/parser";
 *
 * const a = text("a");
 * const result1 = parse(a, "a");
 * if (result1.ok) {
 *   console.log(result1.value);
 *   // => "a"
 * } else {
 *   const { location, expected } = result1;
 *   console.error("error at line", location.line, "column", location.column);
 *   console.error("expected one of", expected.join(", "));
 * }
 * ```
 */
export const parse = <
  A,
  const ExpectedA extends string[],
  Input,
  Data,
  Cursor,
  T,
  FormattedCursor,
>(
  parser: Parser<A, ExpectedA, Input, Data, Cursor, T, FormattedCursor>,
  reader: DeepReadonly<Reader<Input, Data, Cursor, T, FormattedCursor>>,
  input: Input,
): ParseFinalResult<A, ExpectedA | ["<EOF>"], FormattedCursor> => {
  const result = skip(parser, eof)(reader, init(reader, input));
  if (result[0]) {
    return { ok: true, value: result[1] };
  }
  return {
    ok: false,
    location: formatLocation(reader, result[1]),
    expected: result[3],
  };
};

/** Extracts the parsed type from a {@linkcode Parser}. */
export type ParseFinalResult<A, Expected extends string[], FormattedCursor> =
  | ParseFinalOk<A>
  | ParseFinalFail<Expected, FormattedCursor>;

/**
 * Represents a successful parse result.
 */
export interface ParseFinalOk<A> {
  ok: true;
  value: DeepReadonly<A>;
}

/**
 * Represents a failed parse result, where it failed, and what types of
 * values were expected at the point of failure.
 */
export interface ParseFinalFail<Expected extends string[], FormattedCursor> {
  ok: false;
  location: FormattedCursor;
  expected: Expected;
}

/**
 * Returns the parsed result or throws an error.
 *
 * Return the result from successfully parsing the `input` string.
 *
 * If the parse fails, throws an {@linkcode Error} with a message describing the line/column
 * and what values were expected. This method is provided for convenience in case
 * you are not interested in handling the failure case.
 *
 * > [!NOTE]
 * > If you plan on handling failures, use {@linkcode parse} directly to get full
 * > information about went wrong so you can present the error message better for our
 * > application.
 *
 * ```ts
 * import { text, tryParse } from "@takker/parser";
 *
 * const a = text("a");
 * tryParse(a, "a"); // => "a"
 * ```
 */
export const tryParse = <
  A,
  const ExpectedA extends string[],
  Input,
  Data,
  Cursor,
  T,
  FormattedCursor,
>(
  parser: Parser<A, ExpectedA, Input, Data, Cursor, T, FormattedCursor>,
  reader: DeepReadonly<Reader<Input, Data, Cursor, T, FormattedCursor>>,
  input: Input,
): DeepReadonly<A> => {
  const result = parse(parser, reader, input);
  if (result.ok) return result.value;
  const { expected, location } = result;
  const message = `parse error at ${location}: ` +
    `expected ${expected.join(", ")}`;
  throw new Error(message);
};

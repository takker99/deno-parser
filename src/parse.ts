import { skip } from "./skip.ts";
import { eof } from "./eof.ts";
import { type Context, toSourceLocation } from "./context.ts";
import type { ActionResult } from "./action.ts";
export type { ActionFail, ActionOK, ActionResult } from "./action.ts";

/**
 * The parsing action.
 * This should only be called directly when writing custom parsers.
 *
 * > [!NOTE]
 * > Make sure to use {@linkcode merge} when combining multiple
 * > {@linkcode ActionResult}s or else you will lose important parsing information.
 *
 * @param context A parsing context
 * @returns An {@linkcode ActionResult}
 */
export type Parser<A, Input extends ArrayLike<unknown> = string> = (
  context: Context<Input>,
) => ActionResult<A>;

/** Extracts the parsed type from a {@linkcode Parser}. */
export type ParserResult<P> = P extends Parser<infer A, infer L> ? A
  : never;

/**  Extracts the input type from a {@linkcode Parser}. */
export type ParserInput<P> = P extends Parser<infer A, infer L> ? L
  : never;

/**
 * Represents a successful parse result.
 */
export interface ParseOK<A> {
  /**
   * Whether the parse was successful.
   */
  ok: true;

  /** The parsed value */
  value: A;
}

/**
 * Represents a failed parse result, where it failed, and what types of
 * values were expected at the point of failure.
 */
export interface ParseFail {
  /**
   * Whether the parse was successful.
   */
  ok: false;

  /** The input location where the parse failed */
  location: SourceLocation;

  /** List of expected values at the location the parse failed */
  expected: string[];
}

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
export const parse = <A, Input extends ArrayLike<unknown>>(
  parser: Parser<A, Input>,
  input: Input,
): ParseOK<A> | ParseFail => {
  const result = skip(parser, eof)([input, [0, 1, 1]]);
  if (result.ok) {
    return { ok: true, value: result.value };
  }
  return {
    ok: false,
    location: toSourceLocation(result.furthest),
    expected: result.expected,
  };
};

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
export const tryParse = <A, Input extends ArrayLike<unknown>>(
  parser: Parser<A, Input>,
  input: Input,
): A => {
  const result = parse(parser, input);
  if (result.ok) {
    return result.value;
  }
  const { expected, location } = result;
  const { line, column } = location;
  const message = `parse error at line ${line} column ${column}: ` +
    `expected ${expected.join(", ")}`;
  throw new Error(message);
};

import { skip } from "./skip.ts";
import { eof } from "./eof.ts";
import type { Expected } from "./expected.ts";
import type { SourceLocation } from "./SourceLocation.ts";

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
export type Parser<A, Input extends ArrayLike<unknown>> = (
  input: Input,
  location?: SourceLocation,
  options?: ParserOptions,
) => ParseResult<A>;

// deno-lint-ignore no-empty-interface
export interface ParserOptions {}

/** Extracts the parsed type from a {@linkcode Parser}. */
export type ParserResult<
  Input extends ArrayLike<unknown>,
  P extends Parser<unknown, Input>,
> = P extends Parser<infer A, Input> ? A
  : never;

/**  Extracts the input type from a {@linkcode Parser}. */
export type ParserInput<P extends Parser<unknown, ArrayLike<unknown>>> =
  P extends Parser<unknown, infer I extends ArrayLike<unknown>> ? I : never;

export type ParseResult<A> = ParseOk<A> | ParseFail;

/**
 * Represents a successful parse result.
 */
export interface ParseOk<A> {
  /**
   * Whether the parse was successful.
   */
  ok: true;

  /** The parsed value */
  value: A;

  /** List of expected values at the location the parse failed */
  expected: Expected[];

  /** The next location where a parse starts to read */
  next: SourceLocation;
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

  /** List of expected values at the location the parse failed */
  expected: Expected[];
}

export const isOk = <A>(
  parseResult: ParseResult<A>,
): parseResult is ParseOk<A> => parseResult.ok;

export const isFail = <A>(
  parseResult: ParseResult<A>,
): parseResult is ParseFail => !parseResult.ok;

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
 * import { assertEquals } from "@std/assert";
 *
 * const a = text("a");
 * const result1 = parse(a, "a");
 * if (result1.ok) {
 *   assertEquals(result1.value, "a");
 * } else {
 *   const { expected } = result1;
 *   console.error(`${expected.length} parse error(s) occurred:\n${
 *     expected.map(({ expected, location: { line, column } }) =>
 *       `at line ${line} column ${column}: expected ${[...expected].join(", ")}`
 *     )
 *   }`);
 * }
 * ```
 */
export const parse = <A, Input extends ArrayLike<unknown>>(
  parser: Parser<A, Input>,
  input: Input,
): ParseResult<A> => skip(parser, eof)(input);

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
 * import { assertEquals } from "@std/assert";
 *
 * const a = text("a");
 * assertEquals(tryParse(a, "a"), "a");
 * ```
 */
export const tryParse = <A, Input extends ArrayLike<unknown>>(
  parser: Parser<A, Input>,
  input: Input,
): A => {
  const result = parse(parser, input);
  if (isOk(result)) return result.value;
  const { expected } = result;
  const message = `${expected.length} parse error(s) occurred:\n${
    expected.map(({ expected, location: { line, column } }) =>
      `at line ${line} column ${column}: expected ${[...expected].join(", ")}`
    )
  }`;
  throw new Error(message);
};

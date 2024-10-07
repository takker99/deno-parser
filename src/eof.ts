import { makeExpected } from "./expected.ts";
import type { ParseResult } from "./parse.ts";
import { defaultLocation, type SourceLocation } from "./SourceLocation.ts";

const EOF = "<EOF>" as const;

/**
 * This parser succeeds if the input has already been fully parsed.
 *
 * Typically you won't need to use this since {@linkcode parse} already checks this for you.
 * But if your language uses newlines to terminate statements, you might want to check for
 * newlines **or** eof in case the text file doesn't end with a trailing newline
 * (many text editors omit this character).
 *
 * @example
 * ```ts
 * import { and, eof, map, match, or, repeat, tryParse } from "@takker/parser";
 * import { assertEquals } from "@std/assert";
 *
 * const endline = or(match(/\r?\n/), eof);
 * const statement = map(
 *   and(match(/[a-z]+/i), endline),
 *   ([first]) => first,
 * );
 * const file = repeat(statement);
 * assertEquals(tryParse(file, "A\nB\nC\n"), ["A", "B", "C"]);
 * ```
 */
export const eof = <T, Input extends ArrayLike<T>>(
  input: Input,
  location: SourceLocation = defaultLocation,
): ParseResult<"<EOF>"> =>
  input.length <= location.index
    ? {
      ok: true,
      expected: [makeExpected(location, EOF)],
      value: EOF,
      next: location,
    }
    : { ok: false, expected: [makeExpected(location, EOF)] };

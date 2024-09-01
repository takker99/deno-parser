import { type Context, contextFail, contextOk } from "./context.ts";
import type { ActionResult } from "./parse.ts";

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
 *
 * const endline = or(match(/\r?\n/), eof);
 * const statement = map(
 *   and(match(/[a-z]+/i), endline),
 *   ([first]) => first,
 * );
 * const file = repeat(statement);
 * tryParse(file, "A\nB\nC"); // => ["A", "B", "C"]
 * ```
 */
export const eof = <T, I extends ArrayLike<T>>(
  context: Context<I>,
): ActionResult<"<EOF>"> => {
  const [input, [i]] = context;
  return i < input.length
    ? contextFail(context, i, [EOF])
    : contextOk(context, i, EOF);
};

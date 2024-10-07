import { isDone } from "./reader.ts";
import type { Parser } from "./parser.ts";
import { makeExpected } from "./expected.ts";

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
 * import { skip, eof, map, match, or, repeat } from "@takker/parser";
 * import { tryParse } from "@takker/parser/text-parser";
 * import { assertEquals } from "@std/assert";
 *
 * const endline = or(match(/\r?\n/), eof);
 * const statement = skip(match(/[a-z]+/i), endline);
 * const file = repeat(statement);
 * Deno.test("eof", () => {
 *   assertEquals(tryParse(file, "A\nB\nC"), ["A", "B", "C"]);
 * });
 * ```
 */
export const eof: Parser<"<EOF>"> = (reader, ...context) =>
  isDone(reader, context)
    ? [true, context, [], EOF]
    : [false, context, [makeExpected(reader, context, EOF)]];

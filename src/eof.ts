import type { DeepReadonly } from "./deep_readonly.ts";
import type { ActionResult } from "./parser.ts";
import { getNextCursor, isFinish, Reader } from "./reader.ts";

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
export const eof = <Input, Data, Cursor, T, FormattedCursor>(
  reader: DeepReadonly<Reader<Input, Data, Cursor, T, FormattedCursor>>,
  data: DeepReadonly<Data>,
): ActionResult<"<EOF>", Data, Cursor, ["<EOF>"]> =>
  isFinish(reader, data)
    ? [true, EOF, data]
    : [false, getNextCursor(reader, data), data, [EOF]];

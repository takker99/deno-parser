import { or } from "./or.ts";
import type { ParsedValue, Parser } from "./parser.ts";
import type { BaseReader } from "./reader.ts";

/**
 * Parse using the parsers given, returning the first one that succeeds.
 *
 * > [!NOTE]
 * > Be careful with this function if multiple parsers overlap in what they
 * > parse. See the code snippet below for more details.
 *
 * > [!NOTE]
 * > The parsers do not all have to return the same type, but TypeScript
 * > does not always infer the correct type. You can switch to
 * > {@linkcode or} or supply a type parameter to this function to fix it.
 *
 * See also {@linkcode or}.
 *
 * @example
 * ```ts
 * import { choice, text } from "@takker/parser";
 * import { tryParse } from "@takker/parser/text-parser";
 * import { assertEquals } from "@std/assert";
 *
 * const parser = choice(text("a"), text("b"), text("c"));
 * Deno.test("choice", () => {
 *  assertEquals(tryParse(parser, "a"), "a");
 *  assertEquals(tryParse(parser, "b"), "b");
 *  assertEquals(tryParse(parser, "c"), "c");
 * });
 * ```
 *
 * @example
 * ```ts
 * import { choice, text } from "@takker/parser";
 * import { tryParse } from "@takker/parser/text-parser";
 * import { assertThrows } from "@std/assert";
 *
 * const parser = choice(text("abc"), text("abc-123"));
 * Deno.test("choice", () => {
 *   assertThrows(() => tryParse(parser, "abc-123"));
 * });
 * ```
 *
 * This fails because the first parser `abc` succeeds, but then there is still
 * the additional text `-123` afterward that is left unparsed. It is an error to
 * leave unparsed text after calling {@linkcode parse} or {@linkcode tryParse}.
 *
 * Since both parsers start with `abc`, we have to put the longer one first.
 *
 * ```ts
 * import { choice, text } from "@takker/parser";
 * import { tryParse } from "@takker/parser/text-parser";
 * import { assertEquals } from "@std/assert";
 *
 * const parser = choice(text("abc-123"), text("abc"));
 * Deno.test("choice", () => {
 *   assertEquals(tryParse(parser, "abc-123"), "abc-123");
 * });
 * ```
 */
export const choice = <
  const Reader extends BaseReader,
  ParserList extends readonly Parser<unknown, Reader>[],
>(
  ...parsers: [...ParserList]
): Parser<ParsedValue<ParserList[number]>, Reader> => (
  // TODO: This could be optimized with a custom parser, but I should probably add
  // benchmarking first to see if it really matters enough to rewrite it
  parsers.reduce((acc, p) => or(acc, p)) as Parser<
    ParsedValue<ParserList[number]>,
    Reader
  >
);

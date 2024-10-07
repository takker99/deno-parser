import { type BaseReader, drop, pop, save } from "./reader.ts";
import { isOk, merge, type Parser } from "./parser.ts";

/**
 * Try to parse using `parserA`. If that fails, parse using `parserB`.
 *
 * This is good for parsing things like _expressions_ or _statements_ in
 * programming languages, where many different types of things are applicable.
 *
 * See {@linkcode choice} for additional information.
 *
 * @example Basic usage
 * ```ts
 * import { or, text } from "@takker/parser";
 * import { tryParse } from "@takker/parser/text-parser";
 * import { assertEquals } from "@std/assert";
 *
 * const a = text("a");
 * const b = text("b");
 * const ab = or(a, b);
 * Deno.test("or", () => {
 *   assertEquals(tryParse(ab, "a"), "a");
 *   assertEquals(tryParse(ab, "b"), "b");
 * });
 * ```
 *
 * @example Optional parsers
 * ```ts
 * import { ok, or, text } from "@takker/parser";
 * import { tryParse } from "@takker/parser/text-parser";
 * import { assertEquals } from "@std/assert";
 *
 * const aMaybe = or(text("a"), ok(null));
 * Deno.test("or", () => {
 *   assertEquals(tryParse(aMaybe, "a"), "a");
 *   assertEquals(tryParse(aMaybe, ""), null);
 * });
 * ```
 * `or` can be used to implement optional parsers.
 */
export const or = <A, B, const Reader extends BaseReader>(
  parserA: Parser<A, Reader>,
  parserB: Parser<B, Reader>,
): Parser<A | B, Reader> =>
(reader, ...context) => {
  const a = parserA(reader, ...save(reader, context));
  const next = a[1];
  if (isOk(a)) {
    return [true, drop(reader, next), a[2], a[3]];
  }
  return merge(reader, a, parserB(reader, ...pop(reader, next)));
};

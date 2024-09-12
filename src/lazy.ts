import type { Parser } from "./parser.ts";
import type { BaseReader } from "./reader.ts";

/**
 * Takes a `fn` that returns a parser. The callback is called at most once,
 * and only right when the parse action needs to happen.
 *
 * > [!NOTE]
 * > This function exists so you can reference parsers that have not yet
 * > been defined. Many grammars are recursive, but JavaScript variables are not, so
 * > this is a workaround. Typically you will want to use `lazy` on parsers that
 * > parse expressions or statements, with lots of {@linkcode or} calls chained together.
 *
 * > [!NOTE]
 * > Recursive references can confuse TypeScript. Whenever you use `lazy`
 * > you should manually supply the type parameter so that TypeScript doesn't assume
 * > it's `any`.
 *
 * @example
 * ```ts
 * import { lazy, match, or, type Parser, sepBy, text, wrap } from "@takker/parser";
 * import { tryParse } from "@takker/parser/text-parser";
 * import { assertEquals } from "@std/assert";
 *
 * type XExpr = XItem | XList;
 * type XItem = string;
 * type XList = XExpr[];
 * const expr: Parser<XExpr> = lazy(() => or(list, item));
 * const item: Parser<XItem> = match(/[a-z]+/i);
 * const list: Parser<XList> = wrap(
 *   text("["),
 *   sepBy(expr, text(",")),
 *   text("]"),
 * );
 * Deno.test("lazy", () => {
 *   assertEquals(
 *     tryParse(expr, "[a,b,[c,d,[]],[[e]]]"),
 *     ["a", "b", ["c", "d", []], [["e"]]],
 *   );
 * });
 * ```
 *
 * `lazy` must be used here in order to reference variables `item` and `list`
 * before they are defined. You could try to put `expr` at the end of the file, but
 * then `list` would reference `expr` before it's defined, so `list` would have to
 * be wrapped in `lazy` instead.
 */
export const lazy = <A, const Reader extends BaseReader>(
  fn: () => Parser<A, Reader>,
): Parser<A, Reader> =>
// NOTE: This parsing action overwrites itself on the specified parser. We're
// assuming that the same parser won't be returned to multiple `lazy` calls. I
// never heard of such a thing happening in Parsimmon, and it doesn't seem
// likely to happen here either. I assume this is faster than using variable
// closure and an `if`-statement here, but I honestly don't know.
(...args) => fn()(...args);

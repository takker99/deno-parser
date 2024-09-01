import {
  type ActionFail,
  type ActionOK,
  type ActionResult,
  isOk,
  makeActionFail,
  makeActionOK,
} from "./action.ts";
import type { SourceLocation } from "./parse.ts";

/**
 * Represents the current parsing context.
 *
 * It is passed to every {@linkcode Parser}.
 * Generally you will return a call to the {@linkcode contextOk} or {@linkcode contextFail} from inside a custom parser.
 *
 * While you can construct your own `Context` directly, it is not necessary or advised.
 *
 * @example
 * ```ts
 * import { contextOk, contextFail, type Parser } from "@takker/parser";
 *
 * const bracket: Parser<"[" | "]"> = (context) => {
 *   const [input, [start]] = context;
 *   const end = start + 1;
 *   const ch = (input as string).slice(start, end);
 *   if (ch === "[" || ch === "]") {
 *     return contextOk(context, end, ch);
 *   }
 *   return contextFail(context, start, ["[", "]"]);
 * };
 * ```
 */
export type Context<Input extends ArrayLike<unknown>> = [
  /** The current parsing input */
  Input,

  /** The current parsing location */
  InternalSourceLocation,
];

/**
 * The shortened internal representation of a {@linkcode SourceLocation}.
 * This representation can take advantage of minification more than {@linkcode SourceLocation}.
 *
 * The series of numbers means `[index, line, column]`.
 */
export type InternalSourceLocation = [number, number, number];

/**
 * Converts an {@linkcode InternalSourceLocation} to a {@linkcode SourceLocation}.
 *
 * @param internal An internal source location
 * @returns A source location
 */
export const toSourceLocation = (
  internal: InternalSourceLocation,
): SourceLocation => ({
  index: internal[0],
  line: internal[1],
  column: internal[2],
});

/**
 * Represents a successful parse ending before the given `index`, with the
 * specified `value`.
 *
 * This function takes a new source `index` and a parse `value`,
 * returning a {@linkcode ActionOK}
 *
 * This should be returned inside custom parsers.
 *
 * @param context A current parsing context
 * @param index A new source index representing the next character to parse
 * @param value A parsed value
 * @returns A {@linkcode ActionOK}
 */
export const contextOk = <Input extends ArrayLike<unknown>, A>(
  context: Context<Input>,
  index: number,
  value: A,
): ActionOK<A> =>
  makeActionOK(internalMove(context, index), value, [-1, -1, -1], []);

/**
 * Represents a failed parse starting at the given `index`, with the specified
 * list `expected` messages (note: this list usually only has one item).
 *
 * This function takes a new source `index` and a list of `expected` values,
 * returning a {@linkcode ActionFail}
 *
 * This should be returned inside custom parsers.
 *
 * @param context A current parsing context
 * @param index A new source index representing where the parse failed
 * @param expected A list of expected thins at the location the parse failed
 * @returns A {@linkcode ActionFail}
 */
export const contextFail = <Input extends ArrayLike<unknown>>(
  context: Context<Input>,
  index: number,
  expected: string[],
): ActionFail => makeActionFail(internalMove(context, index), expected);

/**
 * Merge two sequential {@linkcode ActionResult}s so that the `expected` and location data
 * is preserved correctly.
 *
 * Takes `result1` and merges its `expected` values with `result2`, allowing error messages to be preserved.
 *
 * @example
 * ```ts
 * import { contextOk, merge, type Parser } from "@takker/parser";
 *
 * // NOTE: This is not the shortest way to write this parser,
 * // it's just an example of a custom parser that needs to
 * // call multiple other parsers.
 * function multiply(
 *   parser1: Parser<number>,
 *   parser2: Parser<number>,
 * ): Parser<number> {
 *   return (context) => {
 *     const result1 = parser1(context);
 *     if (!result1.ok) return result1;
 *     const result2 = merge(result1, parser2(context));
 *     if (!result2.ok) return result2;
 *     context = [context[0], result2.location];
 *     const value = result1.value * result2.value;
 *     return merge(result2, contextOk(context, context[1][0], value));
 *   };
 * }
 * ```
 */
export const merge = <A, B>(
  a: ActionResult<A>,
  b: ActionResult<B>,
): ActionResult<B> => {
  const compare = b.furthest[0] - a.furthest[0];
  if (compare > 0) {
    return b;
  }
  const expected = compare < 0
    ? a.expected
    : [...new Set([...a.expected, ...b.expected])];
  return isOk(b)
    ? makeActionOK(b.location, b.value, a.furthest, expected)
    : makeActionFail(a.furthest, expected);
};

const internalMove = <T, Input extends ArrayLike<T>>(
  context: Context<Input>,
  index: number,
  delimiters?: T[],
): InternalSourceLocation => {
  const [input, location] = context;
  let [start, line, column] = location;
  if (index == start) return location;

  const end = index;
  // If the input is a string, we have to use its iterator in order to properly count complex Unicode characters.
  if (typeof input == "string") {
    // @ts-ignore Typescript can't assume that delimiters is `string[]` when `input` is a string
    delimiters ??= ["\n"];
    const chunk = (input as string).slice(start, end);
    for (const ch of chunk) {
      if ((delimiters as string[]).includes(ch)) {
        line++;
        column = 1;
      } else {
        column++;
      }
    }
  } else {
    for (let i = start; i < end; i++) {
      const ch = input[i];
      if (delimiters?.includes?.(ch)) {
        line++;
        column = 1;
      } else {
        column++;
      }
    }
  }

  return [index, line, column];
};

import type { BaseReader, Context, ReaderTuple } from "./reader.ts";

/**
 * The parsing action.
 * This should only be called directly when writing custom parsers.
 *
 * > [!NOTE]
 * > Make sure to use {@linkcode merge} when combining multiple
 * > {@linkcode ParseResult}s or else you will lose important parsing information.
 *
 * @param context A parsing context
 * @returns An {@linkcode ParseResult}
 */

export type Parser<
  A,
  Expected extends string[],
  Reader extends BaseReader = BaseReader,
> = <R extends Reader>(
  reader: ReaderTuple<R>,
  input: R["input"],
  seeker?: R["seeker"],
) => ParseResult<A, Expected, R>;

export const isOk = <A, Expected, R extends BaseReader>(
  result: ParseResult<A, Expected, R>,
): result is ParseOk<A, R> => result[0];

export type ParseResult<A, Expected, R extends BaseReader> =
  | ParseOk<A, R>
  | ParseFail<Expected, R>;
export type ParseOk<A, R extends BaseReader> = readonly [
  ok: true,
  context: Context<R>,
  value: A,
];
export type ParseFail<Expected, R extends BaseReader> = readonly [
  ok: false,
  context: Context<R>,
  expected: Expected,
];

export type ParsedValue<P extends Parser<unknown, string[]>> = P extends
  Parser<infer A, infer _ extends string[]> ? A : never;

export type ParsedExpected<P extends Parser<unknown, string[]>> = P extends
  Parser<infer _, infer Expected extends string[]> ? Expected : never;

import { type Expected, mergeExpected } from "./expected.ts";
import {
  type BaseReader,
  compare_,
  type Context,
  type ReaderTuple,
} from "./reader.ts";

export type { Expected };

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
  Reader extends BaseReader = BaseReader,
> = <R extends Reader>(
  reader: ReaderTuple<R>,
  input: R["input"],
  seeker?: R["seeker"],
) => ParseResult<A, R>;

export const isOk = <A, R extends BaseReader>(
  result: ParseResult<A, R>,
): result is ParseOk<A, R> => result[0];

export type ParseResult<A, Reader extends BaseReader> =
  | ParseOk<A, Reader>
  | ParseFail<Reader>;
export type ParseOk<A, R extends BaseReader> = readonly [
  ok: true,
  context: Context<R>,
  expected: Expected<R>[],
  value: A,
];

export type ParseFail<R extends BaseReader> = readonly [
  ok: false,
  context: Context<R>,
  expected: Expected<R>[],
];

export type ParsedValue<P extends Parser<unknown>> = P extends
  Parser<infer A, infer _ extends BaseReader> ? A : never;

export const merge = <
  const A,
  const B,
  const R extends BaseReader,
  const C = B,
>(
  reader: ReaderTuple<R>,
  a: ParseResult<A, R>,
  b: ParseResult<B, R>,
  fn?: (value: B) => C,
): (typeof b) extends ParseOk<B, R> ? ParseOk<C, R> : ParseFail<R> => {
  const expectedB = mergeExpected(reader, ...b[2]);
  const minPos = expectedB.at(-1)?.[1];
  const expectedA = minPos
    ? a[2].filter(([, pos]) => compare_(reader, minPos, pos) <= 0)
    : a[2];
  const parseFail = [
    b[0],
    b[1],
    mergeExpected(reader, ...expectedA, ...expectedB),
  ] as [
    boolean,
    Context<R>,
    Expected<R>[],
  ];
  return (b[0]
    ? [...parseFail, fn?.(b[3]) ?? b[3]]
    : parseFail) as unknown as (typeof b) extends ParseOk<B, R> ? ParseOk<C, R>
      : ParseFail<R>;
};

import type { DeepReadonly } from "./deep_readonly.ts";
import type { Reader, ReaderParams } from "./reader.ts";

/**
 * The parsing action.
 * This should only be called directly when writing custom parsers.
 *
 * > [!NOTE]
 * > Make sure to use {@linkcode merge} when combining multiple
 * > {@linkcode ActionResult}s or else you will lose important parsing information.
 *
 * @param context A parsing context
 * @returns An {@linkcode ActionResult}
 */
export type Parser<
  A,
  Expected extends string[] | never,
  Input,
  Data,
  Cursor,
  T,
  FormattedCursor,
> = (
  reader: Reader<Input, Data, Cursor, T, FormattedCursor>,
  data: DeepReadonly<Data>,
) => ActionResult<A, Data, Cursor, Expected>;

export type ParserParams<P> = P extends
  (reader: infer R, data: DeepReadonly<infer Data>) => infer AR
  ? ReaderParams<R> extends
    [infer Input, Data, infer Cursor, infer T, infer FormattedCursor]
    ? [AR] extends [ActionResult<infer A, Data, Cursor, infer Expected>]
      ? [A, Expected, Input, Data, Cursor, T, FormattedCursor]
    : never
  : never
  : never;
export type ParserdData<P> = ParserParams<P> extends [infer A, ...unknown[]] ? A
  : never;
export type ParserdExpected<P> = ParserParams<P> extends
  [unknown, infer Expected, ...unknown[]] ? Expected extends string[] ? Expected
  : never
  : never;

/**
 * The result of a {@linkcode Parser} callback.
 * It is either an {@linkcode ActionOK} or an {@linkcode ActionFail}.
 */
export type ActionResult<A, Data, Cursor, Expected extends string[]> =
  | ActionOk<A, Data>
  | ActionFail<Cursor, Data, [...Expected]>;

/**
 * Represents a successful result from a parser's action callback. This is made
 * automatically by calling {@linkcode contextOk}. Make sure to use {@linkcode merge}
 * when writing a custom parser that executes multiple parser actions.
 */
export type ActionOk<A, Data> = readonly [
  true,
  DeepReadonly<A>,
  DeepReadonly<Data>,
];

/**
 * Represents a successful result from a parser's action callback. This is made
 * automatically by calling {@linkcode contextOk}. Make sure to use {@linkcode merge}
 * when writing a custom parser that executes multiple parser actions.
 */
export type ActionFail<Cursor, Data, Expected extends string[]> = readonly [
  false,
  DeepReadonly<Cursor>,
  DeepReadonly<Data>,
  [...Expected],
];

export const isOk = <A, Data, Cursor, Expected extends string[]>(
  result: ActionResult<A, Data, Cursor, Expected>,
): result is ActionOk<A, Data> => result[0];

export const nextData = <A, Data, Cursor, Expected extends string[]>(
  result: ActionResult<A, Data, Cursor, Expected>,
): DeepReadonly<Data> => result[2];

export const parsedValue = <A, Data>(
  result: ActionOk<A, Data>,
): DeepReadonly<A> => result[1];

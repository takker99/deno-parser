export interface BaseReader {
  input: unknown;
  seeker: unknown;
  position: unknown;
  location: BaseLocation;
}
export interface BaseLocation {
  index: number;
}

export type Chunk<R extends BaseReader> = R extends { chunk: infer C } ? C
  : R["input"];
export type Context<R extends BaseReader> = readonly [
  input: R["input"],
  seeker?: R["seeker"],
];
export type ReadResult<R extends BaseReader> =
  | readonly [isEmpty: false, context: Context<R>, value: Chunk<R>]
  | readonly [isEmpty: true, context: Context<R>];

export const isEmpty = <R extends BaseReader>(
  result: ReadResult<R>,
): result is [isEmpty: true, Context<R>] => result[0];

export type ReaderTuple<R extends BaseReader> = readonly [
  initialSeeker: R["seeker"],
  read: (context: Context<R>, size: number) => ReadResult<R>,
  getCurrentPosition: (seeker: R["seeker"]) => R["position"],
  saveCurrentPosition: (seeker: R["seeker"]) => R["seeker"],
  restorePreviousPosition: (seeker: R["seeker"]) => R["seeker"],
  discardPreviousPosition: (seeker: R["seeker"]) => R["seeker"],
  isDone: (context: Context<R>) => boolean,
  compare: (a: R["position"], b: R["position"]) => number,
  format: (position: R["position"]) => BaseLocation,
];

const getInitialSeeker = <R extends BaseReader>(
  reader: ReaderTuple<R>,
  context: Context<R>,
): R["seeker"] => context[1] ?? reader[0];

export const read = <R extends BaseReader>(
  size: number,
  reader: ReaderTuple<R>,
  input: R["input"],
  seeker?: R["seeker"],
): ReadResult<R> => reader[1]([input, seeker], size);

export const getCurrentPosition = <R extends BaseReader>(
  reader: ReaderTuple<R>,
  context: Context<R>,
): R["position"] => reader[2](getInitialSeeker(reader, context));

/**
 * save the current position of the reader
 *
 * The function name comes from `git stash save`
 *
 * @param reader
 * @param context
 * @returns
 */
export const save = <R extends BaseReader>(
  reader: ReaderTuple<R>,
  context: Context<R>,
): Context<R> => [context[0], reader[3](getInitialSeeker(reader, context))];

/**
 * restore the previous position of the reader and discard it.
 * The current position is changed to the previous one.
 *
 * The function name comes from `git stash pop`
 *
 * @param reader
 * @param context
 * @returns
 */
export const pop = <R extends BaseReader>(
  reader: ReaderTuple<R>,
  context: Context<R>,
): Context<R> => [context[0], reader[4](getInitialSeeker(reader, context))];

/**
 * discard the previous position of the reader.
 * The current position is not changed.
 *
 * The function name comes from `git stash drop`
 *
 * @param reader
 * @param context
 * @returns
 */
export const drop = <R extends BaseReader>(
  reader: ReaderTuple<R>,
  context: Context<R>,
): Context<R> => [context[0], reader[5](getInitialSeeker(reader, context))];

export const isDone = <R extends BaseReader>(
  reader: ReaderTuple<R>,
  context: Context<R>,
): boolean => reader[6](context);

export const compare = <R extends BaseReader>(
  reader: ReaderTuple<R>,
  a: R["position"],
  b: R["position"],
): number => reader[7](a, b);

export const formatLocation = <R extends BaseReader>(
  reader: ReaderTuple<R>,
  position: R["position"],
): R["location"] => reader[8](position);

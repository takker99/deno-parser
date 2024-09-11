export interface BaseReader {
  input: unknown;
  seeker: unknown;
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
  saveCurrentPosition: (seeker: R["seeker"]) => R["seeker"],
  restorePreviousPosition: (seeker: R["seeker"]) => R["seeker"],
  discardPreviousPosition: (seeker: R["seeker"]) => R["seeker"],
  isDone: (context: Context<R>) => boolean,
  compare: (a: R["seeker"], b: R["seeker"]) => number,
  format: (seeker: R["seeker"]) => BaseLocation,
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

export const saveCurrentPosition = <R extends BaseReader>(
  reader: ReaderTuple<R>,
  context: Context<R>,
): Context<R> => [context[0], reader[2](getInitialSeeker(reader, context))];

export const restorePreviousPosition = <R extends BaseReader>(
  reader: ReaderTuple<R>,
  context: Context<R>,
): Context<R> => [context[0], reader[3](getInitialSeeker(reader, context))];

export const discardPreviousPosition = <R extends BaseReader>(
  reader: ReaderTuple<R>,
  context: Context<R>,
): Context<R> => [context[0], reader[4](getInitialSeeker(reader, context))];

export const isDone = <R extends BaseReader>(
  reader: ReaderTuple<R>,
  context: Context<R>,
): boolean => reader[5](context);

export const compare = <R extends BaseReader>(
  reader: ReaderTuple<R>,
  a: Context<R>,
  b: Context<R>,
): number =>
  reader[6](getInitialSeeker(reader, a), getInitialSeeker(reader, b));

export const formatLocation = <R extends BaseReader>(
  reader: ReaderTuple<R>,
  context: Context<R>,
): R["location"] => reader[7](getInitialSeeker(reader, context));

import {
  type BaseReader,
  compare_,
  type Context,
  getCurrentPosition,
  type ReaderTuple,
} from "./reader.ts";

export type Expected<R extends BaseReader> = readonly [
  expected: Set<string>,
  position: R["position"],
];
export const makeExpected = <R extends BaseReader>(
  reader: ReaderTuple<R>,
  context: Context<R>,
  ...names: string[]
): Expected<R> => [new Set(names), getCurrentPosition(reader, context)];

export const mergeExpected = <R extends BaseReader>(
  reader: ReaderTuple<R>,
  ...expected: Expected<R>[]
): Expected<R>[] =>
  expected.reduce((acc, [e, position]) => {
    const index = acc.findIndex(([, pos]) =>
      compare_(reader, position, pos) === 0
    );
    if (index < 0) {
      acc.push([e, position]);
      return acc;
    }
    for (const item of e) acc[index][0].add(item);
    return acc;
  }, [] as Expected<R>[]).sort((a, b) => compare_(reader, b[1], a[1]));

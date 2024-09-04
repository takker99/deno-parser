import type { DeepReadonly } from "./deep_readonly.ts";

export type Pop<Data, T> = (
  data: DeepReadonly<Data>,
  size: number,
) => [T, DeepReadonly<Data>];
/**
 * Save the current cursor in the stack to be restored later.
 */
export type Save<Data> = (data: DeepReadonly<Data>) => DeepReadonly<Data>;
export type GetNextCursor<Data, Cursor> = (
  data: DeepReadonly<Data>,
) => DeepReadonly<Cursor>;
export type Init<Input, Data> = (input: Input) => DeepReadonly<Data>;
/**
 * Restore the data back to the previous cursor.
 */
export type Restore<Data> = (data: DeepReadonly<Data>) => DeepReadonly<Data>;
/**
 * Discard the previous cursor.
 */
export type Discard<Data> = (data: DeepReadonly<Data>) => DeepReadonly<Data>;
export type IsFinish<Data> = (data: DeepReadonly<Data>) => boolean;
export type FormatLocation<Cursor, FormattedCursor> = (
  cursor: DeepReadonly<Cursor>,
) => FormattedCursor;

export type Reader<Input, Data, Cursor, T, FormattedCursor> = readonly [
  Init<Input, Data>,
  Pop<Data, T>,
  Save<Data>,
  Restore<Data>,
  Discard<Data>,
  GetNextCursor<Data, Cursor>,
  IsFinish<Data>,
  FormatLocation<Cursor, FormattedCursor>,
];

export type ReaderParams<R> = R extends readonly [...infer L] | [...infer L]
  ? L extends [
    (input: infer Input) => unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
  ] ? L[0] extends (input: Input) => DeepReadonly<infer Data> ? L[1] extends (
        data: DeepReadonly<Data>,
        size: number,
      ) => [infer T, DeepReadonly<Data>]
        ? L[2] extends (data: DeepReadonly<Data>) => DeepReadonly<Data>
          ? L[3] extends (data: DeepReadonly<Data>) => DeepReadonly<Data>
            ? L[4] extends (data: DeepReadonly<Data>) => DeepReadonly<Data>
              ? L[5] extends
                (data: DeepReadonly<Data>) => DeepReadonly<infer Cursor>
                ? L[6] extends (data: DeepReadonly<Data>) => boolean
                  ? L[7] extends
                    (data: DeepReadonly<Cursor>) => infer FormattedCursor
                    ? [Input, Data, Cursor, T, FormattedCursor]
                  : never
                : never
              : never
            : never
          : never
        : never
      : never
    : never
  : never
  : never;

export const init = <Input, Data, Cursor, T, FormattedCursor>(
  reader: DeepReadonly<Reader<Input, Data, Cursor, T, FormattedCursor>>,
  input: Input,
): DeepReadonly<Data> => reader[0](input);
export const pop = <Input, Data, Cursor, T, FormattedCursor>(
  reader: DeepReadonly<Reader<Input, Data, Cursor, T, FormattedCursor>>,
  data: DeepReadonly<Data>,
  size: number,
): [T, DeepReadonly<Data>] => reader[1](data, size);
export const save = <Input, Data, Cursor, T, FormattedCursor>(
  reader: DeepReadonly<Reader<Input, Data, Cursor, T, FormattedCursor>>,
  data: DeepReadonly<Data>,
): DeepReadonly<Data> => reader[2](data);
export const restore = <Input, Data, Cursor, T, FormattedCursor>(
  reader: DeepReadonly<Reader<Input, Data, Cursor, T, FormattedCursor>>,
  data: DeepReadonly<Data>,
): DeepReadonly<Data> => reader[3](data);
export const discard = <Input, Data, Cursor, T, FormattedCursor>(
  reader: DeepReadonly<Reader<Input, Data, Cursor, T, FormattedCursor>>,
  data: DeepReadonly<Data>,
): DeepReadonly<Data> => reader[4](data);
export const getNextCursor = <Input, Data, Cursor, T, FormattedCursor>(
  reader: DeepReadonly<Reader<Input, Data, Cursor, T, FormattedCursor>>,
  data: DeepReadonly<Data>,
): DeepReadonly<Cursor> => reader[5](data);
export const isFinish = <Input, Data, Cursor, T, FormattedCursor>(
  reader: DeepReadonly<Reader<Input, Data, Cursor, T, FormattedCursor>>,
  data: DeepReadonly<Data>,
): boolean => reader[6](data);
export const formatLocation = <Input, Data, Cursor, T, FormattedCursor>(
  reader: DeepReadonly<Reader<Input, Data, Cursor, T, FormattedCursor>>,
  cursor: DeepReadonly<Cursor>,
): FormattedCursor => reader[7](cursor);

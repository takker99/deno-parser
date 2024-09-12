import { isDone } from "./reader.ts";
import type { Parser } from "./parser.ts";
import { makeExpected } from "./expected.ts";

const EOF = "<EOF>" as const;

export const eof: Parser<"<EOF>"> = (reader, ...context) =>
  isDone(reader, context)
    ? [true, context, [], EOF]
    : [false, context, [makeExpected(reader, context, EOF)]];

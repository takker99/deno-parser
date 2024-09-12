import { isDone } from "./reader.ts";
import { makeExpected, type Parser } from "./parser.ts";

const EOF = "<EOF>" as const;

export const eof: Parser<"<EOF>"> = (reader, ...context) =>
  isDone(reader, context)
    ? [true, context, [], EOF]
    : [false, context, [makeExpected(reader, context, EOF)]];

import { isDone } from "./reader.ts";
import type { Parser } from "./parser.ts";

const EOF = "<EOF>" as const;

export const eof: Parser<"<EOF>", ["<EOF>"]> = (reader, ...context) =>
  isDone(reader, context) ? [true, context, EOF] : [false, context, [EOF]];

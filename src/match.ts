import type { TextReader } from "./text_parser.ts";
import { formatLocation, read } from "./reader.ts";
import type { Parser } from "./parser.ts";

export const match = (
  regexp: RegExp,
): Parser<string, TextReader> => {
  for (const flag of regexp.flags) {
    switch (flag) {
      case "i": // ignoreCase
      case "s": // dotAll
      case "m": // multiline
      case "u": // unicode
        continue;
      default:
        throw new Error("only the regexp flags 'imsu' are supported");
    }
  }
  const sticky = new RegExp(regexp.source, regexp.flags + "y");
  return (reader, ...context) => {
    sticky.lastIndex = context[1]?.[0]?.[0] ?? 0;
    const match = context[0].match(sticky);
    if (!match) {
      return [false, context, [[`${regexp}`, formatLocation(reader, context)]]];
    }
    const res = read(match[0].length, reader, ...context);
    return [true, res[1], [], res[2] ?? ""];
  };
};

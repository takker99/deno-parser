import type { SourceLocation } from "./SourceLocation.ts";

export const move = <T, Input extends ArrayLike<T>>(
  input: Input,
  prev: SourceLocation,
  next: number,
  delimiters?: T[],
): SourceLocation => {
  const start = prev.index;
  if (next == start) return prev;
  let { line, column } = prev;

  // If the input is a string, we have to use its iterator in order to properly count complex Unicode characters.
  if (typeof input == "string") {
    // @ts-ignore Typescript can't assume that delimiters is `string[]` when `input` is a string
    delimiters ??= ["\n"];
    const chunk = (input as string).slice(start, next);
    for (const ch of chunk) {
      if ((delimiters as string[]).includes(ch)) {
        line++;
        column = 1;
      } else {
        column++;
      }
    }
  } else {
    for (let i = start; i < next; i++) {
      const ch = input[i];
      if (delimiters?.includes?.(ch)) {
        line++;
        column = 1;
      } else {
        column++;
      }
    }
  }

  return { index: next, line, column };
};

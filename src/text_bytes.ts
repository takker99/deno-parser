import type { DeepReadonly } from "./deep_readonly.ts";
import { desc } from "./desc.ts";
import { digits } from "./digits.ts";
import { map } from "./map.ts";
import type { Parser } from "./parser.ts";

export const textBytes = <
  T extends ArrayLike<number>,
  S extends string,
  Input,
  Data,
  Cursor,
  FormattedCursor,
>(string: S): Parser<S, [S], Input, Data, Cursor, T, FormattedCursor> =>
  desc(
    map(
      digits<number[], Input, Data, Cursor, T, FormattedCursor>(
        string.split("").map((char) => char.charCodeAt(0)),
      ),
      () => string as DeepReadonly<S>,
    ),
    [string],
  );

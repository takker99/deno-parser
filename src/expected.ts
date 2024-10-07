import type { SourceLocation } from "./SourceLocation.ts";

export interface Expected {
  /** List of expected values at the location the parse failed */
  expected: Set<string>;
  location: SourceLocation;
}

export const makeExpected = (
  location: SourceLocation,
  ...names: string[]
): Expected => ({ expected: new Set(names), location });

export const mergeExpected = (
  ...expected: Expected[]
): Expected[] =>
  expected.reduce((acc, item) => {
    const expectedInTheSameLocation = acc.find((expected) =>
      expected.location.index === item.location.index
    );
    if (!expectedInTheSameLocation) {
      acc.push(item);
      return acc;
    }
    expectedInTheSameLocation.expected = expectedInTheSameLocation.expected
      .union(
        item.expected,
      );
    return acc;
  }, [] as Expected[]).sort((a, b) => b.location.index - a.location.index);

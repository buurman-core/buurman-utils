import { compose } from "ramda";
import {
    LEADING_WHITESPACE_REGEX,
    TRAILING_WHITESPACE_REGEX,
} from "./regular-expressions";
import { isNotEmptyLine } from "./predicates";

export const filterLines = (str: string, predicate: (v: string) => boolean) =>
    str
        .split("\n")
        .filter(predicate)
        .join("\n");

export const createLineFilterer = (predicate: (v: string) => boolean) => (
    str: string,
) => filterLines(str, predicate);

export const removeEmptyLines = createLineFilterer(isNotEmptyLine);

export const removeLeadingWhiteSpace = (str: string) =>
    str.replace(LEADING_WHITESPACE_REGEX, "");

export const removeTrailingWhiteSpace = (str: string) =>
    str.replace(TRAILING_WHITESPACE_REGEX, "");

export const removeLeadingAndTrailingWhiteSpace = compose(
    removeLeadingWhiteSpace,
    removeTrailingWhiteSpace,
);

export const ensureArray = <T>(value: null | undefined | T | T[]): T[] =>
    value == null ? [] : Array.isArray(value) ? value : [value];

export const join = (separator: string) => (arr: string[]) =>
    arr.join(separator);

export const reverse = <T>(arr: T[]): T[] => [...arr].reverse();

reverse.typed = <T>() => (arr: T[]) => reverse<T>(arr);

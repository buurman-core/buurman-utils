import { EMPTY_LINE_REGEX } from "./regular-expressions";

export const isEmptyLine = (line: string) => EMPTY_LINE_REGEX.test(line);
export const isNotEmptyLine = (line: string) => !isEmptyLine(line);

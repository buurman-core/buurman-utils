import { Await } from "./lang";

export interface TryToApi<TValue, TError extends Error>
    extends Promise<Await<TValue>> {}

export const tryTo = <
    TFn extends (...args: any[]) => any,
    TError extends Error = Error
>(
    description: string,
    fn: TFn,
): TryToApi<ReturnType<TFn>, TError> => {
    try {
        let value = fn();

        if (value instanceof Promise) {
            //@ts-ignore
            return value.then(value => ({ value })).catch(error => ({ error }));
        } else {
            return value;
        }
    } catch (error) {
        const err = new error.constructor(
            `Failed to ${description}: ${error.message}`,
        );
        err.stack = error.stack;
        //@ts-ignore
        return { error: err };
    }
};

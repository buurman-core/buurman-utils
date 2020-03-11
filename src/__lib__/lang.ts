// prettier-ignore
/**
 * Gets the value of a promise from a promise or a function that returns one.
 * Reverts to returning the provided T generic if T is not a promise
 * or a function that returns one.
 */
export type Await<T> =
    // if (T is a promise)
    T extends Promise<infer UValue>
        // return inferred value type
        ? UValue
    // else if (T is a function that returns a promise)
        : T extends (...args: any[]) => Promise<infer UValue>
        // return inferred value type from function return type
        ? UValue
    // else
        // return T
        : T;

export enum InputType {
    string = "string",
    boolean = "boolean",
    number = "number",
    object = "object",
    array = "array",
}

export type getInputTypePrimitive<
    T extends InputType
> = T extends InputType.string
    ? string
    : T extends InputType.number
    ? number
    : T extends InputType.boolean
    ? boolean
    : T extends InputType.number
    ? number
    : T extends InputType.object
    ? object
    : T extends InputType.array
    ? any[]
    : unknown;

export enum InputType {
    string = "string",
    boolean = "boolean",
    number = "number",
    object = "object",
    array = "array",
}

export type InputPrimitive = string | number | boolean | object | any[];

export type getInputTypePrimitive<
    T extends InputType
> = T extends InputType.string
    ? string
    : T extends InputType.number
    ? number
    : T extends InputType.boolean
    ? boolean
    : T extends InputType.object
    ? object
    : T extends InputType.array
    ? any[]
    : unknown;

export type getInputTypeEnum<T extends InputPrimitive> = T extends string
    ? InputType.string
    : T extends number
    ? InputType.number
    : T extends boolean
    ? InputType.boolean
    : T extends number
    ? InputType.number
    : T extends object
    ? InputType.object
    : T extends any[]
    ? InputType.array
    : unknown;

export interface Input<TType extends InputType> {
    description: string;
    type: TType;
    default?: getInputTypePrimitive<TType>;
    required?: boolean;
}

export interface InputValues {
    [name: string]: InputPrimitive;
}

export type InputDefinitions<
    TInputs extends { [name: string]: InputPrimitive }
> = {
    [P in keyof TInputs]: Input<getInputTypeEnum<TInputs[P]>>;
};

export const validateInputs = <TInputValues extends InputValues>(
    definitions: InputDefinitions<InputValues>,
    inputs: TInputValues = {} as TInputValues,
) => {
    const inputEntries: [
        keyof TInputValues,
        Input<getInputTypeEnum<TInputValues[keyof TInputValues]>>,
    ][] = Object.entries(definitions) as any;

    for (const [name, input] of inputEntries) {
        validateInput(name as string, input, inputs[name]);
    }
};

export const validateInput = <TInputValue extends InputPrimitive>(
    name: string,
    definition: Input<getInputTypeEnum<TInputValue>>,
    value: TInputValue,
) => {
    if (definition.required && value == null) {
        throw new Error(`${name} input is required.`);
    } else if (!definition.required && value == null) {
        return;
    }

    switch (definition.type) {
        default:
            throw new Error(`Type ${definition.type} not implemented`);

        case InputType.string:
            if (typeof value !== "string") {
                throw new Error(`${name} input must be a string.`);
            }
            break;

        case InputType.number:
            if (typeof value !== "number") {
                throw new Error(`${name} input must be a number.`);
            }
            break;

        case InputType.boolean:
            if (typeof value !== "boolean") {
                throw new Error(`${name} input must be a boolean.`);
            }
            break;

        case InputType.object:
            if (typeof value !== "object") {
                throw new Error(`${name} input must be an object.`);
            }
            break;

        case InputType.array:
            if (Array.isArray(value)) {
                throw new Error(`${name} input must be an array.`);
            }
            break;
    }
};

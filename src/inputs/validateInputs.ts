import { getInputTypePrimitive, InputType } from "./models/InputType";
import { InputValues } from "./models/InputValues";

export interface Input<TType extends InputType> {
    description: string;
    type: TType;
    default?: getInputTypePrimitive<TType>;
    required?: boolean;
}

export const validateInputs = <
    TInputs extends { [name: string]: Input<InputType> },
    TInputValues extends InputValues<TInputs>
>(
    config: TInputs,
    inputs: TInputValues = {} as TInputValues,
) => {
    if (!config.inputs) {
        return;
    }

    const inputEntries: [
        keyof TInputs,
        TInputs[keyof TInputs],
    ][] = Object.entries(config.inputs) as any;

    for (const [name, input] of inputEntries) {
        const value = inputs[name];

        if (input.required && value == null) {
            throw new Error(`${name} input is required.`);
        } else if (!input.required && value == null) {
            continue;
        }

        switch (input.type) {
            default:
                throw new Error(`Type ${input.type} not implemented`);

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
    }
};

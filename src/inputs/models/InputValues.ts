import { InputType, getInputTypePrimitive } from "../..";
import { Input } from "../validateInputs";

export type InputValues<
    TInputs extends { [name: string]: Input<InputType> }
> = {
    [P in keyof TInputs]: getInputTypePrimitive<TInputs[P]["type"]>;
};

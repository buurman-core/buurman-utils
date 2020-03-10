import { InputValues } from "../../inputs/models/InputValues";
import { ActionRunContext } from "./ActionRunContext";

export interface Action<TInputs extends InputValues<any>> {
    (context: ActionRunContext, inputs?: TInputs): Promise<void>;
}

import { readFile } from "fs-extra";
import { safeLoad } from "js-yaml";
import { join } from "path";
import { Input, InputType } from "../..";

export interface ActionConfig<
    TInputs extends { [name: string]: Input<InputType> }
> {
    name: string;
    description: string;
    inputs?: TInputs;
}

export const getActionConfig = async <
    TInputs extends { [name: string]: Input<InputType> }
>(
    path: string,
) =>
    safeLoad(await readFile(join(path, "action.yml"), "utf-8")) as ActionConfig<
        TInputs
    >;

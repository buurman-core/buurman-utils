import execa from "execa";
import { readFile } from "fs-extra";
import { safeLoad } from "js-yaml";
import { join } from "path";
import { withDir } from "tmp-promise";
import { ActionRunContext } from "./ActionRunContext";

export enum ActionInputType {
    string = "string",
    boolean = "boolean",
    number = "number",
    object = "object",
    array = "array",
}

export type getActionInputTypePrimitive<
    T extends ActionInputType
> = T extends ActionInputType.string
    ? string
    : T extends ActionInputType.number
    ? number
    : T extends ActionInputType.boolean
    ? boolean
    : T extends ActionInputType.number
    ? number
    : T extends ActionInputType.object
    ? object
    : T extends ActionInputType.array
    ? any[]
    : unknown;

export interface ActionInput<TType extends ActionInputType> {
    description: string;
    type: TType;
    default?: getActionInputTypePrimitive<TType>;
    required?: boolean;
}

export interface ActionConfig<
    TInputs extends { [name: string]: ActionInput<ActionInputType> }
> {
    name: string;
    description: string;
    inputs?: TInputs;
}

export interface Action<TInputs extends InputValues<any>> {
    (context: ActionRunContext, inputs?: TInputs): Promise<void>;
}

const checkoutAction = async (actionReference: string, path: string) => {
    const [githubPath, ref] = actionReference.split("@");
    await execa(`git`, [`clone`, `git@github.com:${githubPath}.git`, `.`], {
        cwd: path,
    });
    await execa(`git`, [`checkout`, ref], { cwd: path });
    await execa(`npm`, [`ci`], { cwd: path });
};

export type InputValues<
    TInputs extends { [name: string]: ActionInput<ActionInputType> }
> = {
    [P in keyof TInputs]: getActionInputTypePrimitive<TInputs[P]["type"]>;
};

const getActionConfig = async <
    TInputs extends { [name: string]: ActionInput<ActionInputType> }
>(
    path: string,
) =>
    safeLoad(await readFile(join(path, "action.yml"), "utf-8")) as ActionConfig<
        TInputs
    >;

const validateInputs = <
    TInputs extends { [name: string]: ActionInput<ActionInputType> },
    TInputValues extends InputValues<TInputs>
>(
    config: ActionConfig<TInputs>,
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

            case ActionInputType.string:
                if (typeof value !== "string") {
                    throw new Error(`${name} input must be a string.`);
                }
                break;
            case ActionInputType.number:
                if (typeof value !== "number") {
                    throw new Error(`${name} input must be a number.`);
                }
                break;
            case ActionInputType.boolean:
                if (typeof value !== "boolean") {
                    throw new Error(`${name} input must be a boolean.`);
                }
                break;
            case ActionInputType.object:
                if (typeof value !== "object") {
                    throw new Error(`${name} input must be an object.`);
                }
                break;
            case ActionInputType.array:
                if (Array.isArray(value)) {
                    throw new Error(`${name} input must be an array.`);
                }
                break;
        }
    }
};

export const runAction = async <TInputValues extends InputValues<any>>(
    actionReference: string,
    context: ActionRunContext,
    inputs?: TInputValues,
) => {
    await withDir(async ({ path }) => {
        await checkoutAction(actionReference, path);
        const actionConfig = await getActionConfig<any>(path);

        validateInputs(actionConfig, inputs);

        const action: Action<TInputValues> = require(path).default;

        await action(context, inputs);
    });
};

import { readFile } from "fs-extra";
import { safeLoad } from "js-yaml";
import { join } from "path";
import { withDir } from "tmp-promise";
import { Git } from "./__lib__/git";
import { Npm } from "./__lib__/npm";
import { InputDefinitions, InputPrimitive, validateInputs } from "./index";
import { InputValues } from "./inputs";

export interface ActionRunContext {
    /**
     * Any (absolute) path.
     * Can be used to access external files.
     * E.g.: The path to the feature this action is being ran from.
     */
    path?: string;
}

export interface ActionModule<TInputs extends InputValues> {
    run: Action<TInputs>;
}

export interface Action<TInputs extends InputValues> {
    (context: ActionRunContext, inputs: TInputs): Promise<void>;
}

export interface ActionConfig<
    TInputs extends { [name: string]: InputPrimitive }
> {
    name: string;
    description: string;
    inputs: InputDefinitions<TInputs>;
}

export const getActionConfig = async <
    TInputs extends { [name: string]: InputPrimitive }
>(
    path: string,
) =>
    safeLoad(
        await readFile(
            path.endsWith(".yml") ? path : join(path, "action.yml"),
            "utf-8",
        ),
    ) as ActionConfig<TInputs>;

export const getAction = <TInputValues extends InputValues>(
    actionReference: string,
) =>
    withDir(
        async ({ path }) => {
            await checkout(actionReference, path);
            const config = await getActionConfig<InputDefinitions<any>>(path);
            const { run } = require(path) as ActionModule<TInputValues>;
            return { run, config };
        },
        { unsafeCleanup: true },
    );

export const runAction = async <TInputValues extends InputValues>(
    actionReference: string,
    context: ActionRunContext,
    inputs: TInputValues = {} as TInputValues,
) => {
    const { run, config } = await getAction<TInputValues>(actionReference);
    validateInputs(config.inputs, inputs);
    await run(context, inputs);
};

// PRIVATE

const checkout = async (actionReference: string, path: string) => {
    const [githubPath, ref] = actionReference.split("@");

    const git = Git(path);
    const npm = Npm(path);

    await git.clone(`git@github.com:${githubPath}.git`);
    await git.checkout(ref);
    await npm.ci([`--production`]);
};

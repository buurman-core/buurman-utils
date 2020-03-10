import { withDir } from "tmp-promise";
import { InputValues } from "../inputs/models/InputValues";
import { validateInputs } from "../inputs/validateInputs";
import { checkout } from "./checkout";
import { Action } from "./models/Action";
import { getActionConfig } from "./models/ActionConfig";
import { ActionRunContext } from "./models/ActionRunContext";

export const runAction = async <TInputValues extends InputValues<any>>(
    actionReference: string,
    context: ActionRunContext,
    inputs?: TInputValues,
) => {
    await withDir(
        async ({ path }) => {
            await checkout(actionReference, path);
            const actionConfig = await getActionConfig<any>(path);

            validateInputs(actionConfig, inputs);

            const action: Action<TInputValues> = require(path).default;

            await action(context, inputs);
        },
        { unsafeCleanup: true },
    );
};

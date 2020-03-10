import { applyPatch, createPatch, parsePatch } from "diff";
import {
    CompilerOptions,
    JsxEmit,
    ModuleKind,
    ModuleResolutionKind,
    NewLineKind,
    ScriptTarget,
    transpileModule,
} from "typescript";
import { removeLeadingAndTrailingWhiteSpace } from "../__lib__/transformers";

export const DEFAULT_COMPILER_OPTIONS: CompilerOptions = {
    target: ScriptTarget.ESNext,
    module: ModuleKind.ESNext,
    moduleResolution: ModuleResolutionKind.NodeJs,
    lib: ["esnext", "dom"],
    strict: true,
    resolveJsonModule: true,
    noUnusedLocals: false,
    pretty: true,
    downlevelIteration: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    removeComments: false,
    skipLibCheck: true,
    experimentalDecorators: true,
    importHelpers: false,
    noEmitHelpers: true,
    preserveConstEnums: true,
    useDefineForClassFields: true,
    skipDefaultLibCheck: true,
    newLine: NewLineKind.LineFeed,
    jsx: JsxEmit.Preserve,

    outDir: "js_templates",
    noEmit: false,
};

/**
 * Transpiles typescript to (readable/pretty) javascript.
 * @param code
 */
export const ts2js = (code: string) => {
    code = removeLeadingAndTrailingWhiteSpace(code);

    const { outputText } = transpileModule(code, {
        fileName: "file.tsx",
        compilerOptions: DEFAULT_COMPILER_OPTIONS,
    });

    const js = removeLeadingAndTrailingWhiteSpace(outputText);

    // during transpilation from typescript to javascript empty lines are removed,
    // restore them to make the generated javascript more readable.
    return restoreEmptyLines(code, js);
};

/**
 * Restores empty lines for typescript code compiled to javascript.
 * Transpilation from typescript to javascript removes empty lines.
 * @source https://github.com/microsoft/TypeScript/issues/843#issuecomment-555932858
 * @param originalCode
 * @param transpiledCode
 */
const restoreEmptyLines = (originalCode: string, transpiledCode: string) => {
    const [patch] = parsePatch(createPatch("", originalCode, transpiledCode));
    const { hunks } = patch;

    for (let i = 0; i < hunks.length; ++i) {
        const hunk = hunks[i];
        let lineOffset = 0;

        hunk.lines = hunk.lines.map(line => {
            if (line !== "-") {
                return line;
            }

            lineOffset++;

            return " ";
        });

        hunk.newLines += lineOffset;

        for (let j = i + 1; j < hunks.length; ++j) {
            hunks[j].newStart += lineOffset;
        }
    }

    return applyPatch(originalCode, patch);
};

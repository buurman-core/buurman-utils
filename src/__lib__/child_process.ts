import { exec as _exec, ExecOptions } from "child_process";
import { promisify } from "util";

export const exec = async (command: string, options: ExecOptions = {}) =>
    (await promisify(_exec)(command, options)).stdout;

import { exec } from "./child_process";

export const Npm = (cwd: string) => {
    const ci = (flags: string[] = []) =>
        exec(`npm ci ${flags.join(" ")}`, { cwd });
    return { ci };
};

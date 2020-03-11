import { join } from "path";
import rimraf from "rimraf";
import { promisify } from "util";
import { exec } from "./child_process";

const rmrf = promisify(rimraf);

export const Git = (cwd: string) => {
    const getCommitMessage = (hash: string) =>
        exec(`git log -n 1 --pretty=format:%s ${hash}`, { cwd });

    const getCommitHash = (commitN: number) =>
        exec(`git log --pretty=tformat:%H | tac | head -${commitN} | tail -1`, {
            cwd,
        });

    const reset = (hash: string, flags: string[] = []) =>
        exec(`git reset ${flags.join(" ")} ${hash}`, { cwd });

    const addAll = () => exec(`git add -A`, { cwd });

    const init = () => exec(`git init`, { cwd });

    const commit = (message: string, flags: string[] = []) =>
        exec(
            `git commit ${flags.join("")} -m '${message.replace(/'/g, "\\'")}'`,
            { cwd },
        );

    const resetToInitialCommit = async () => {
        // get hash of initial commit
        const hash = await getCommitHash(1);
        // get initial commit message using initial commit hash
        const commitMessage = await getCommitMessage(hash);

        // reset to initial commit, discard uncommitted and unstaged changes
        await reset(hash, ["--hard"]);

        // remove git
        await rmrf(join(cwd, ".git"));

        await init();
        await addAll();
        await commit(commitMessage);
    };

    const clone = (
        repo: string,
        destination: string = ".",
        flags: string[] = [],
    ) => exec(`git clone ${repo} ${destination} ${flags.join(" ")}`, { cwd });

    const checkout = (ref: string, flags: string[] = []) =>
        exec(`git checkout ${ref} ${flags.join(" ")}`, { cwd });

    return {
        getCommitMessage,
        getCommitHash,
        reset,
        addAll,
        init,
        commit,
        clone,
        checkout,
        resetToInitialCommit,
    };
};

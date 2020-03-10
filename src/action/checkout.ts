import execa from "execa";

export const checkout = async (actionReference: string, path: string) => {
    const [githubPath, ref] = actionReference.split("@");
    await execa(`git`, [`clone`, `git@github.com:${githubPath}.git`, `.`], {
        cwd: path,
    });
    await execa(`git`, [`checkout`, ref], { cwd: path });
    await execa(`npm`, [`ci`], { cwd: path });
};

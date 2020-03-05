import { join, relative, resolve } from "path";
import { ActionRunContext } from "./ActionRunContext";

export const PathUtil = ({ featurePath }: ActionRunContext) => {
    const pathUtil = {
        resolveFeaturePath: (...pathSegments: string[]) =>
            resolve(featurePath, join(...pathSegments)),
        relativeFeaturePath: (...pathSegments: string[]) =>
            relative(
                pathUtil.resolveFeaturePath(),
                pathUtil.resolveFeaturePath(...pathSegments),
            ),
    };

    return pathUtil;
};

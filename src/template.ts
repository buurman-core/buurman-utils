import template from "lodash.template";

const PATH_INTERPOLATE_REGEX = /\$([^\$]+)\$/g;
const FILE_INTERPOLATE_REGEX = /\${{([\s\S]+?)}}/g;

const tpl = <T extends object>(interpolate: RegExp, variables?: T) => (
    string: string,
) => template(string, { interpolate })(variables);

export const pathTemplate = <T extends object>(variables?: T) =>
    tpl<T>(PATH_INTERPOLATE_REGEX, variables);

export const fileTemplate = <T extends object>(variables?: T) =>
    tpl<T>(FILE_INTERPOLATE_REGEX, variables);

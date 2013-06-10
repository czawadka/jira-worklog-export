import util = module("util");

export function extend(source: any, deep?: bool, target?: any): any {

    function createCompatibleTarget(source: any, target: any): any {
        if (target) {
            return target;
        } else if (util.isArray(source)) {
            return [];
        } else {
            return {};
        }
    }

    target = createCompatibleTarget(source, target);
    for(var key in source) {
        if (deep && typeof(target[key]) === "object") {
            target[key] = createCompatibleTarget(source[key], target[key]);
            extend(source[key], deep, target[key]);
        } else if (typeof(source[key]) !== "undefined") {
            target[key] = source[key];
        }
    }
    return target;
}

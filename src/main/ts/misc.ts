export function extend(src: any, dst?: any): any {
    if (!dst) {
        dst = {};
    }
    for(var key in src) {
        dst[key] = src[key];
    }
    return dst;
}

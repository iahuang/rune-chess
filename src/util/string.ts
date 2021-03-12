import { pathToFileURL } from "url";

export function replaceAll(string: string, pattern: string, replacement: string) {
    return string.replace(
        new RegExp(pattern.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), "g"),
        replacement
    );
}

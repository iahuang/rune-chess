import { createHash } from "crypto";
import fs from "fs";

function hash(data: string) {
    return createHash("md5").update(data).digest("hex");
}

function mkdir(path: fs.PathLike) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
}

const tablePath = "_cache/table.json";

export default class AssetCache {
    isResourceCacheable(uri: string) {
        return /\w+:\/\//g.test(uri);
    }

    table: { [hash: string]: string } = {};

    constructor() {}

    cache(uri: string, data: Buffer) {
        if (!this.isResourceCacheable(uri)) {
            throw new Error("Resource is not cacheable");
        }

        this.table[uri] = hash(uri);
        fs.writeFileSync("_cache/" + hash(uri), data);
        this._saveTable();
    }

    init() {
        mkdir("_cache");
        if (fs.existsSync(tablePath)) {
            this.table = JSON.parse(fs.readFileSync(tablePath, "utf8"));
        } else {
        }
    }

    getCachedPath(uri: string) {
        let hashed = this.table[uri];
        if (hashed) {
            return "_cache/"+hashed;
        }
        return null;
    }

    containsURI(uri: string) {
        return this.getCachedPath(uri) !== null;
    }

    private _saveTable() {
        fs.writeFileSync(tablePath, JSON.stringify(this.table));
    }

    clearCache() {
        fs.rmdirSync("_cache", {recursive: true});
    }
}

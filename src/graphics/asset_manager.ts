import { Image, loadImage } from "canvas";
import AssetCache from "./asset_cache";
import fetch from "node-fetch";
import Globals from "../engine/globals";
import chalk from "chalk";

export class AssetManager {
    private _assets: { [name: string]: ImageAsset };
    cache: AssetCache;
    assetsLoaded: number;

    constructor() {
        this._assets = {};
        this.assetsLoaded = 0;
        this.cache = new AssetCache();
        this.cache.init();
    }

    register(name: string, path: string) {
        this._assets[name] = new ImageAsset(name, path);
        return this;
    }

    get size() {
        return Object.keys(this._assets).length;
    }

    async loadAll(): Promise<void> {
        // cache assets
        for (let asset of this.allAssets()) {
            if (this.cache.containsURI(asset.path)) {
                continue;
            }
            if (this.cache.isResourceCacheable(asset.path)) {
                let resp = await fetch(asset.path);
                let buffer = await resp.arrayBuffer();
                this.cache.cache(asset.path, Buffer.from(buffer));
                Globals.log.getNamespace("AssetManager").info("Caching "+chalk.cyan(asset.path));
            }
        }
        return new Promise((resolve, reject) => {
            for (let asset of this.allAssets()) {
                let cachePath = this.cache.getCachedPath(asset.path);
                let uri = asset.path;
                if (cachePath) {
                    uri = cachePath;
                }
                loadImage(uri)
                    .then((image) => {
                        asset.image = image;
                        this.assetsLoaded += 1;
                        if (uri !== asset.path) {
                            Globals.log.getNamespace("AssetManager").info(`Loaded ${chalk.cyan(asset.path)}`);
                            Globals.log.getNamespace("AssetManager").info(`(cached: ${chalk.greenBright(uri)})`);
                        } else {
                            Globals.log.getNamespace("AssetManager").info(`Loaded ${chalk.cyan(asset.path)}`);
                        }
                        
                        if (this.assetsLoaded === this.size) {
                            resolve();
                        }
                    })
                    .catch((err) => {
                        reject("asset not found");
                        throw new Error(`Asset with path "${asset.path}" could not be loaded`);
                    });
            }
        });
    }

    getAsset(name: string) {
        let asset = this._assets[name];
        if (!asset) {
            throw new Error(`Could not find asset with name "${name}"`);
        }
        return asset;
    }

    allAssets() {
        return Object.values(this._assets);
    }
}

export class ImageAsset {
    name: string;
    path: string;
    image: Image | null;

    constructor(name: string, path: string) {
        this.name = name;
        this.path = path;
        this.image = null;
    }

    get loaded() {
        return this.image != null;
    }
}

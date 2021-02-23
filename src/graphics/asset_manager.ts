import { Image, loadImage } from "canvas";

export default class AssetManager {
    private _assets: { [name: string]: ImageAsset };
    assetsLoaded: number;

    constructor() {
        this._assets = {};
        this.assetsLoaded = 0;
    }

    register(name: string, path: string) {
        this._assets[name] = new ImageAsset(name, path);
        return this;
    }

    get size() {
        return Object.keys(this._assets).length;
    }

    loadAll(): Promise<void> {
        return new Promise((resolve, reject) => {
            for (let asset of this.allAssets()) {
                loadImage(asset.path)
                    .then((image) => {
                        asset.image = image;
                        this.assetsLoaded += 1;
                        console.log(`[AssetManager] Loaded ${asset.path}`);

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

class ImageAsset {
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


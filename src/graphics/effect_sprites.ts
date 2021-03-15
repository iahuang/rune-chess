import { EffectId } from "../engine/effect";
import { AssetManager } from "./asset_manager";

export interface EffectAssetRecord {
    name: string;
    path: string;
}

export class EffectGFXRegistry {
    idTable = new Map<EffectId, EffectAssetRecord>();
    assetManager: AssetManager;

    constructor(manager: AssetManager) {
        this.assetManager = manager;
    }

    add(id: EffectId, assetName: string, path: string) {
        this.idTable.set(id, { name: assetName, path: path });
        return this;
    }

    registerToAssetManager() {
        for (let [id, record] of this.idTable.entries()) {
            this.assetManager.register(record.name, record.path);
        }
    }

    hasAssetForEffect(id: EffectId) {
        return Boolean(this.idTable.get(id));
    }

    getAssetByEffectID(id: EffectId) {
        let assetRecord = this.idTable.get(id);
        if (!assetRecord) throw new Error(`Cannot find effect asset with ID ${EffectId[id]}`);
        return this.assetManager.getAsset(assetRecord.name);
    }
}

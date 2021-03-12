import Champion from "./champion";

type ChampionConstructor = new ()=>Champion;

export class ChampionRegistry {
    _registry: {[name: string]: ChampionConstructor};

    constructor() {
        this._registry = {};
    }

    register(constructor: ChampionConstructor) {
        this._registry[(new constructor()).name] = constructor;
        return this;
    }

    getConstructor(championName: string) {
        let champion = this._registry[championName];

        if (!champion) {
            throw new Error(`Champion "${championName}" does not exist in registry`);
        }

        return champion;
    }

    allChampionNames() {
        return Object.keys(this._registry);
    }
}

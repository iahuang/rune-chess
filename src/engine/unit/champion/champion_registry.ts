import Champion from "./champion";
import stringSimilarity from "string-similarity";

export type ChampionConstructor = new () => Champion;

export class ChampionRegistry {
    _registry: { [name: string]: ChampionConstructor };

    constructor() {
        this._registry = {};
    }

    register(constructor: ChampionConstructor) {
        this._registry[new constructor().name] = constructor;
        return this;
    }

    _matchName(query: string, to: string, allowSimilar: boolean = false) {
        /*
            Returns true if the two given strings match, more or less.

            allowSimilar will use string distance algorithms
            to allow even misspellings, etc.
        */

        query = query.toLowerCase().trim();
        to = to.toLocaleLowerCase().trim();

        if (query === to) {
            return true;
        }

        if (allowSimilar) {
            // console.log([query, to, stringSimilarity.compareTwoStrings(query, to)])

            // allow similarity value of up to 0.75 (arbitrarily chosen)
            if (stringSimilarity.compareTwoStrings(query, to) > 0.75) {
                return true;
            }
        }

        return false;
    }

    championNameByQuery(query: string) {
        /*
            Given a champion name query, such as that from user input,
            return the internal champion name.

            For instance, "LeBlanc" and "lb" would both return "leblanc"
        */

        query = query.toLowerCase().trim();

        for (let internalName of this.allChampionNames()) {
            // check if the query directly matches the internal name
            if (query === internalName) {
                return internalName;
            }

            let championInstance = this.instantiateChampion(internalName);

            // match query with that champion's "nicknames"
            for (let nickname of championInstance.nicknames) {
                if (this._matchName(query, nickname)) {
                    return internalName;
                }
            }

            // match query with the champion's "display name" (allow misspellings)
            if (this._matchName(query, championInstance.displayName, true)) {
                return internalName
            }
        }

        return null;
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

    instantiateChampion(name: string) {
        return new (this.getConstructor(name))();
    }
}

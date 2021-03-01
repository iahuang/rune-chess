/*
From the Riot Games developer page:

"Data Dragon is our way of centralizing League of Legends
game data and assets, including champions, items, runes,
summoner spells, and profile icons. All of which can be
used by third-party developers."
*/

import fetch from "node-fetch";
import { AbilityIdentifier, BaseAbility } from "../engine/unit/champion/ability/base_ability";

async function loadJSON(url: string) {
    let resp = await fetch(url);
    return await resp.json();
}

export default class DataDragon {
    gameVersion: string;

    constructor() {
        // by default, use the current league patch at the time of writing,
        // you know, the one where they buffed AD katarina for some reason
        this.gameVersion = "11.4.1";
    }

    useGameVersion(path: string) {
        this.gameVersion = path;
    }

    async useLatestGameVersion() {
        let versions = await loadJSON("https://ddragon.leagueoflegends.com/api/versions.json");
        this.useGameVersion(versions[0]);
        console.log(`[DataDragon] Using game assets from League of Legends version ${this.gameVersion}`);
    }

    private getVersionedCDN() {
        return `http://ddragon.leagueoflegends.com/cdn/${this.gameVersion}/`;
    }

    championSquareLink(championName: string) {
        return this.getVersionedCDN()+"img/champion/"+championName+".png";
    }

    abilityIconURL(ability: BaseAbility) {
        let id = AbilityIdentifier[ability.identifier];
        let championName = ability.caster.name;

        return this.getVersionedCDN()+"img/spell/"+championName+id+".png";
    }
}

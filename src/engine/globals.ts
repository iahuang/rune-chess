import { AssetManager } from "../graphics/asset_manager";
import { Logger } from "./logger";
import { ChampionDiana } from "./unit/champion/champions/diana";
import { ChampionEkko } from "./unit/champion/champions/ekko";
import { ChampionLeblanc } from "./unit/champion/champions/leblanc";
import { ChampionMalzahar } from "./unit/champion/champions/malzahar";
import { ChampionSenna } from "./unit/champion/champions/senna";
import { ChampionYone } from "./unit/champion/champions/yone";
import { ChampionRegistry } from "./unit/champion/champion_registry";

const _assetManager = new AssetManager()
    .register("game.board", "assets/loc_board.png")
    .register(
        "minion.blue",
        "https://static.wikia.nocookie.net/leagueoflegends/images/f/fa/Blue_Caster_MinionSquare.png/"
    )
    .register(
        "minion.red",
        "https://static.wikia.nocookie.net/leagueoflegends/images/1/10/Red_Caster_MinionSquare.png/"
    );

/*
    A list of global constants and objects for Runechess and the engine.
*/
export default class Globals {
    static readonly boardSize = 8; // changing this from its default (8) may have unintended side-effects.
    static readonly actionPointsPerTurn = 2;

    static readonly gameVersion = "0.1 indev";

    static readonly championRegistry = new ChampionRegistry()
        .register(ChampionDiana)
        .register(ChampionSenna)
        .register(ChampionEkko)
        .register(ChampionYone)
        .register(ChampionMalzahar)
        .register(ChampionLeblanc);

    static programStartupTime = 0;

    static getAssetManager() {
        return _assetManager;
    }

    static readonly log = new Logger()
        .addNamespace("Main")
        .addNamespace("Debug")
        .addNamespace("GameRenderer")
        .addNamespace("Runechess-Discord")
        .addNamespace("AssetManager")
        .addNamespace("DataDragon");
    
    static readonly debugLog = Globals.log.getNamespace("Debug");
}

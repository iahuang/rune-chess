import Diana from "./unit/champion/champions/diana";
import { ChampionRegistry } from "./unit/champion/champion_registry";

export default class Globals {
    static readonly boardSize = 8;
    static readonly gameVersion = "0.1 indev";
    static readonly championRegistry = (new ChampionRegistry()).register("Diana", Diana);
}
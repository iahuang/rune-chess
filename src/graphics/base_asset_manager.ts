import {AssetManager} from "./asset_manager";

export default function baseAssetManager() {
    return new AssetManager()
        .register("game.board", "assets/loc_board.png")
        .register(
            "minion.blue",
            "https://static.wikia.nocookie.net/leagueoflegends/images/f/fa/Blue_Caster_MinionSquare.png/"
        )
        .register(
            "minion.red",
            "https://static.wikia.nocookie.net/leagueoflegends/images/1/10/Red_Caster_MinionSquare.png/"
        );
}

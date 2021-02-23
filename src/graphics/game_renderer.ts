import RuneChess from "../engine/game";
import AssetManager from "./asset_manager";
import Display from "./display";

export class GameRenderer {
    display: Display;
    assetManager: AssetManager;
    ready: boolean;
    constructor() {
        this.display = Display.create(1280, 720);
        this.assetManager = new AssetManager().register("game.board", "assets/loc_board.png");
        this.ready = false;
    }

    render(game: RuneChess) {
        this.ensureLoaded();
        this.display.clear();
        let board = this.assetManager.getAsset("game.board");
        this.display.context.drawImage(board.image, 0, 0);
    }

    ensureLoaded() {
        if (!this.ready) {
            throw new Error("Cannot render before initialization");
        }
    }

    async init() {
        await this.assetManager.loadAll();
        this.ready = true;
    }
}

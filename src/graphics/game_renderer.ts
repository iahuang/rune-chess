import { createContext } from "vm";
import BoardPosition from "../engine/board_position";
import GameConstants from "../engine/constants";
import RuneChess from "../engine/game";
import DataDragon from "../riot/data_dragon";
import AssetManager from "./asset_manager";
import Display from "./display";
import Vector2 from "./vector2";

function baseAssetManager() {
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

export class GameRenderer {
    display: Display;
    assetManager: AssetManager;
    ready: boolean;
    game: RuneChess;
    dataDragon: DataDragon;

    constructor(game: RuneChess) {
        this.display = Display.create(1280, 1280);
        this.assetManager = baseAssetManager();
        this.ready = false;
        this.game = game;
        this.dataDragon = new DataDragon();
    }

    render() {
        this.ensureLoaded();
        this.display.clear();
        let board = this.assetManager.getAsset("game.board");
        let image = board.image!;
        this.display.context.drawImage(image, 0, 0, this.display.width, this.display.height);

        const center = 1280 / 2;
        const cellSize = 90;
        const padding = center - cellSize * 4;
        // draw grid lines

        for (let x = 0; x < GameConstants.boardSize + 1; x++) {
            let dx = x * cellSize + padding;
            this.display.drawLine(Vector2.from(dx, padding), Vector2.from(dx, 1280 - padding), "white");
        }

        for (let y = 0; y < GameConstants.boardSize + 1; y++) {
            let dy = y * cellSize + padding;
            this.display.drawLine(Vector2.from(padding, dy), Vector2.from(1280 - padding, dy), "white");
        }

        let boardPosToScreenPos = (pos: BoardPosition) => {
            return Vector2.from(pos.x * cellSize + padding, pos.y * cellSize + padding);
        };

        // draw units

        for (let unit of this.game.board.allUnits()) {
            let pos = boardPosToScreenPos(unit.pos);
            let championIconAsset = this.iconAssetForChampion(unit.name);
            this.display.context.drawImage(championIconAsset.image, pos.x, pos.y, cellSize, cellSize);
        }
    }

    ensureLoaded() {
        if (!this.ready) {
            throw new Error("Cannot render before initialization");
        }
    }

    iconAssetForChampion(name: string) {
        this.ensureLoaded();
        return this.assetManager.getAsset(`champion.${name}.icon`);
    }

    async init() {
        await this.dataDragon.useLatestGameVersion();
        // load Riot assets
        for (let name of this.game.championRegistry.allChampionNames()) {
            let squareURL = this.dataDragon.championSquareLink(name);

            this.assetManager.register(`champion.${name}.icon`, squareURL);
        }

        await this.assetManager.loadAll();
        this.ready = true;
    }
}

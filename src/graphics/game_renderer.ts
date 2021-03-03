import BoardPosition from "../engine/board_position";
import Globals from "../engine/constants";
import RuneChess from "../engine/game";
import { TeamColor } from "../engine/team";
import Unit from "../engine/unit/unit";
import UnitType from "../engine/unit/unit_type";
import DataDragon from "../riot/data_dragon";
import {AssetManager, ImageAsset} from "./asset_manager";
import baseAssetManager from "./base_asset_manager";
import Display from "./display";
import Vector2 from "./vector2";

const center = 1280 / 2;
const cellSize = 105;
const padding = center - cellSize * 4;

function boardPosToScreenPos(pos: BoardPosition) {
    return Vector2.from(pos.x * cellSize + padding, pos.y * cellSize + padding);
}

export class GameRenderer {
    display: Display;
    assetManager: AssetManager;
    ready: boolean;
    dataDragon: DataDragon;

    constructor() {
        this.display = Display.create(1280, 1280);
        this.assetManager = baseAssetManager();
        this.ready = false;
        this.dataDragon = new DataDragon();
    }

    drawUnitIcon(unit: Unit) {
        let pos = boardPosToScreenPos(unit.pos);
        let unitIconAsset: ImageAsset;
        if (unit.unitType === UnitType.Champion) {
            unitIconAsset = this.iconAssetForChampion(unit.name);
        } else if (unit.unitType === UnitType.Minion) {
            if (unit.teamColor === TeamColor.Red) {
                unitIconAsset = this.assetManager.getAsset("minion.red")
            } else {
                unitIconAsset = this.assetManager.getAsset("minion.blue")
            }
            
        } else {
            throw new Error("Cannot draw unit of unknown type");
        }
        this.display.clipped(
            () => {
                this.display.context.beginPath();
                this.display.circlePath(pos.plus(Vector2.pair(cellSize / 2)), cellSize / 2 - 5);
            },
            () => {
                this.display.context.fillStyle = "red";
                //this.display.context.fillRect(pos.x, pos.y, cellSize, cellSize);
                this.display.context.drawImage(unitIconAsset.image, pos.x, pos.y, cellSize, cellSize);
            }
        );
        let teamColor = { [TeamColor.Blue]: "blue", [TeamColor.Red]: "red", [TeamColor.Neutral]: "white" }[
            unit.teamColor
        ];
        this.display.draw(
            () => {
                //console.log(TeamColor[unit.teamColor], JSON.stringify(unit.pos))
                this.display.circlePath(pos.plus(Vector2.pair(cellSize / 2)), cellSize / 2 - 5);
            },
            { stroke: teamColor, lineWidth: 3 }
        );
    }

    render(game: RuneChess) {
        this.ensureLoaded();
        this.display.clear();
        let board = this.assetManager.getAsset("game.board");
        let image = board.image!;
        this.display.context.drawImage(image, 0, 0, this.display.width, this.display.height);

        // draw grid lines

        for (let x = 0; x < Globals.boardSize + 1; x++) {
            let dx = x * cellSize + padding;
            this.display.drawLine(Vector2.from(dx, padding), Vector2.from(dx, 1280 - padding), "white");
        }

        for (let y = 0; y < Globals.boardSize + 1; y++) {
            let dy = y * cellSize + padding;
            this.display.drawLine(Vector2.from(padding, dy), Vector2.from(1280 - padding, dy), "white");
        }

        // draw units

        for (let unit of game.board.allUnits()) {
            this.drawUnitIcon(unit);
        }

        //console.log(game.board.allUnits());
    }

    getCanvasBuffer() {
        return this.display.getCanvasInstance().toBuffer("image/png");
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
        for (let name of Globals.championRegistry.allChampionNames()) {
            let squareURL = this.dataDragon.championSquareLink(name);

            this.assetManager.register(`champion.${name}.icon`, squareURL);
        }

        await this.assetManager.loadAll();
        this.ready = true;
    }
}

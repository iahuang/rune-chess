import BoardPosition from "../engine/board_position";
import Globals from "../engine/globals";
import { RuneChess } from "../engine/game";
import { TeamColor } from "../engine/team";
import Unit from "../engine/unit/unit";
import UnitType from "../engine/unit/unit_type";
import DataDragon from "../riot/data_dragon";
import { AssetManager, ImageAsset } from "./asset_manager";
import { Display, TextStyle } from "./display";
import Vector2 from "./vector2";
import fs from "fs";
import { Effect, EffectId } from "../engine/effect";
import { EffectGFXRegistry } from "./effect_sprites";
import Champion from "../engine/unit/champion/champion";
import { timeStamp } from "node:console";

const CONFIG_PATH = "gfx_config.json";

interface GraphicsConfig {
    imageSize: number;
    font: string | null;
}

interface BoardMetrics {
    center: number;
    cellSize: number;
    padding: number;
}

function makeEffectRegistry(renderer: GameRenderer) {
    return new EffectGFXRegistry(renderer.assetManager).add(
        EffectId.EkkoTimewinder,
        "effect.ekko.timewinder",
        "assets/timewinder.png"
    );
}

export class GameRenderer {
    display: Display;
    assetManager: AssetManager;
    ready: boolean;
    dataDragon: DataDragon;
    config: GraphicsConfig;
    metrics: BoardMetrics;
    effectRegistry: EffectGFXRegistry;

    constructor() {
        this.assetManager = Globals.getAssetManager();

        this.ready = false;
        this.dataDragon = new DataDragon();

        this.config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
        console.log(`[GameRenderer] Config loaded from ${CONFIG_PATH}`);

        this.display = Display.create(this.config.imageSize, this.config.imageSize);

        let imageSize = this.config.imageSize;
        this.metrics = {
            center: imageSize / 2,
            cellSize: imageSize * 0.082,
            padding: 0,
        };
        this.metrics.padding = this.metrics.center - this.metrics.cellSize * 4;

        if (this.config.font) this.display.setDefaultFont(this.config.font);

        this.effectRegistry = makeEffectRegistry(this);
        this.effectRegistry.registerToAssetManager();
    }

    boardPosToScreenPos(pos: BoardPosition) {
        return Vector2.from(
            pos.x * this.metrics.cellSize + this.metrics.padding,
            pos.y * this.metrics.cellSize + this.metrics.padding
        );
    }

    drawUnitIcon(unit: Unit) {
        let pos = this.boardPosToScreenPos(unit.pos);
        let unitIconAsset: ImageAsset;

        if (unit.unitType === UnitType.Champion) {
            unitIconAsset = this.iconAssetForChampion(unit.name);
        } else if (unit.unitType === UnitType.Minion) {
            if (unit.teamColor === TeamColor.Red) {
                unitIconAsset = this.assetManager.getAsset("minion.red");
            } else {
                unitIconAsset = this.assetManager.getAsset("minion.blue");
            }
        } else {
            throw new Error("Cannot draw unit of unknown type");
        }
        this.display.clipped(
            () => {
                this.display.context.beginPath();
                this.display.circlePath(
                    pos.plus(Vector2.pair(this.metrics.cellSize / 2)),
                    this.metrics.cellSize / 2 - 5
                );
            },
            () => {
                this.display.context.fillStyle = "red";
                //this.display.context.fillRect(pos.x, pos.y, cellSize, cellSize);
                this.display.context.drawImage(
                    unitIconAsset.image,
                    pos.x,
                    pos.y,
                    this.metrics.cellSize,
                    this.metrics.cellSize
                );
            }
        );
        let teamColor = { [TeamColor.Blue]: "blue", [TeamColor.Red]: "red", [TeamColor.Neutral]: "white" }[
            unit.teamColor
        ];
        this.display.draw(
            () => {
                //console.log(TeamColor[unit.teamColor], JSON.stringify(unit.pos))
                this.display.circlePath(
                    pos.plus(Vector2.pair(this.metrics.cellSize / 2)),
                    this.metrics.cellSize / 2 - 5
                );
            },
            { stroke: teamColor, lineWidth: 1 }
        );

        // draw voice line

        // if (unit.isChampion) {
        //     let champ = unit as Champion;
        //     let voiceLine = champ.getCurrentVoiceLine();
        //     let cellSize = this.metrics.cellSize;

        //     if (voiceLine) {
        //         let textPos = pos.plus(new Vector2(cellSize * 0.75, -cellSize * 0.2));
        //         this.display.drawText(voiceLine, textPos, {
        //             fill: "red",
        //             size: cellSize * 0.3,
        //             align: "left",
        //             baseline: "top",
        //         });
        //     }
        // }
    }

    drawHealthBar(unit: Unit) {
        // COLORS
        const clr_outline = "#3f444a";
        const clr_bg = "#000000";
        const clr_red = "#ff697a";
        const clr_blue = "#8fb4ff";

        let hpBarColor = unit.teamColor === TeamColor.Red ? clr_red : clr_blue;

        let pos = this.boardPosToScreenPos(unit.pos);

        // metrics
        let centerX = pos.x + this.metrics.cellSize / 2;
        let width = this.metrics.cellSize * 0.85;
        let height = this.metrics.cellSize * 0.15;
        let top = pos.y + this.metrics.cellSize - height;

        this.display.draw(
            () => {
                this.display.rectPath(new Vector2(centerX - width / 2, top), new Vector2(width, height));
            },
            { fill: clr_bg, stroke: clr_outline, lineWidth: 1 }
        );
        this.display.draw(
            () => {
                this.display.rectPath(
                    new Vector2(centerX - width / 2, top),
                    new Vector2((width * unit.hp) / unit.calculateMaxHP(), height)
                );
            },
            { fill: hpBarColor }
        );
    }

    drawEffect(effect: Effect) {
        let asset = this.effectRegistry.getAssetByEffectID(effect.id);
        let pos = this.boardPosToScreenPos(effect.pos);
        let size = this.metrics.cellSize;
        this.display.context.drawImage(asset.image, pos.x, pos.y, size, size);
    }

    drawGrid() {
        let gridRuleStyle: TextStyle = {
            size: this.metrics.cellSize * 0.6,
            fill: "white",
        };

        for (let x = 0; x < Globals.boardSize + 1; x++) {
            let dx = x * this.metrics.cellSize + this.metrics.padding;

            this.display.drawLine(
                Vector2.from(dx, this.metrics.padding),
                Vector2.from(dx, this.config.imageSize - this.metrics.padding),
                "white",
                0.5
            );

            if (x === Globals.boardSize) {
                break;
            }

            this.display.drawText(
                "ABCDEFGHIJKLM"[x],
                new Vector2(dx + this.metrics.cellSize / 2, this.metrics.padding - this.metrics.cellSize),
                {
                    ...gridRuleStyle,
                    baseline: "top",
                    align: "center",
                }
            );
        }

        for (let y = 0; y < Globals.boardSize + 1; y++) {
            let dy = y * this.metrics.cellSize + this.metrics.padding;
            this.display.drawLine(
                Vector2.from(this.metrics.padding, dy),
                Vector2.from(this.config.imageSize - this.metrics.padding, dy),
                "white",
                0.5
            );

            if (y === Globals.boardSize) {
                break;
            }

            this.display.drawText(
                (y + 1).toString(),
                new Vector2(this.metrics.padding - this.metrics.cellSize, dy + this.metrics.cellSize / 2),
                {
                    ...gridRuleStyle,
                    baseline: "middle",
                    align: "left",
                }
            );
        }
    }

    render(game: RuneChess) {
        this.ensureLoaded();
        this.display.clear();

        let board = this.assetManager.getAsset("game.board");
        let image = board.image!;
        this.display.context.drawImage(image, 0, 0, this.display.width, this.display.height);

        // draw grid lines

        this.drawGrid();

        // draw units

        for (let unit of game.board.allUnits()) {
            //console.log("Drawing unit",unit.name,TeamColor[unit.teamColor],unit.pos)
            this.drawUnitIcon(unit);
            this.drawHealthBar(unit);
        }

        // draw effects

        for (let effect of game.board.effects) {
            this.drawEffect(effect);
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
        return this.assetManager.getAsset(`champion.${name.toLowerCase()}.icon`);
    }

    async init() {
        await this.dataDragon.useLatestGameVersion();
        // load Riot assets
        for (let name of Globals.championRegistry.allChampionNames()) {
            let champion = new (Globals.championRegistry.getConstructor(name))();
            let squareURL = this.dataDragon.championSquareURL(champion.name);
            this.assetManager.register(`champion.${name}.icon`, squareURL);
        }

        await this.assetManager.loadAll();
        this.ready = true;
        console.log("[GameRenderer] Initialized successfully");
    }
}

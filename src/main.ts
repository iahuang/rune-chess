import { fstat } from "fs";
import BoardPosition from "./engine/board_position";
import RuneChess from "./engine/game";
import Diana from "./engine/unit/champion/champions/diana";
import Unit from "./engine/unit/unit";
import AssetManager from "./graphics/asset_manager";
import { GameRenderer } from "./graphics/game_renderer";
import fs from "fs";

let chess = new RuneChess();
chess.board.placeUnit(Diana(), BoardPosition.at(0, 0));

let gameRenderer = new GameRenderer(chess);
gameRenderer.init().then(() => {
    gameRenderer.render();
    gameRenderer.display.saveImageData("test.png");
});

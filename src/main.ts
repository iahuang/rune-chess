import BoardPosition from "./engine/board_position";
import RuneChess from "./engine/game";
import Diana from "./engine/unit/champion/champions/diana";
import Unit from "./engine/unit/unit";

let chess = new RuneChess();
chess.board.placeUnit(Diana(), BoardPosition.at(0,0));
console.log(chess.debugRenderer.renderBoard(chess.board));
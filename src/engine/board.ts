import BoardPosition from "./board_position";
import Globals from "./constants";
import RuneChess from "./game";
import Unit from "./unit/unit";

export default class Board {
    private _board: (Unit | null)[]; // flattened 2d array, row-first
    private _game?: RuneChess;

    constructor() {
        this._board = [];

        // initialize board
        for (let i = 0; i < Globals.boardSize * Globals.boardSize; i++) {
            this._board.push(null);
        }
    }

    get gameInstance() {
        if (!this._game) {
            throw new Error("Board has not been initialized into a game instance");
        }

        return this._game;
    }

    private _boardDataIndex(pos: BoardPosition) {
        return pos.y * Globals.boardSize + pos.x;
    }

    placeUnit(unit: Unit, pos: BoardPosition) {
        unit.linkBoard(this);
        unit.pos = pos;
        if (this.getUnitAt(pos)) {
            throw new Error("There is already a piece here");
        }
        this._board[this._boardDataIndex(pos)] = unit;
    }

    popUnit(pos: BoardPosition) {
        /* "pop" a unit at a position off the board and returns it. retains the 
            reference to this board.
        */

        if (!this.getUnitAt(pos)) {
            throw new Error("There is no unit here");
        }

        let unit = this.getUnitAt(pos);
        this._board[this._boardDataIndex(pos)] = null;
        return unit;
    }

    moveUnit(unit: Unit, to: BoardPosition) {
        // ensure this unit is linked to this board
        if (unit.board !== this) {
            throw new Error("Cannot move a unit not linked to this board");
        }

        this.popUnit(unit.pos);
        this.placeUnit(unit, to);
    }

    getUnitAt(pos: BoardPosition) {
        return this._board[this._boardDataIndex(pos)];
    }

    allUnits() {
        return this._board.filter(u=>u!==null) as Unit[];
    }

    
}

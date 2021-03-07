import BoardPosition from "./board_position";
import Globals from "./globals";
import { Effect } from "./effect";
import RuneChess from "./game";
import { TeamColor } from "./team";
import Unit from "./unit/unit";

export default class Board {
    private _units: (Unit | null)[]; // flattened 2d array, row-first
    private _game?: RuneChess;
    effects: Effect[];

    constructor() {
        this._units = [];
        this.effects = [];

        // initialize board
        for (let i = 0; i < Globals.boardSize * Globals.boardSize; i++) {
            this._units.push(null);
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
        this._units[this._boardDataIndex(pos)] = unit;
    }

    popUnit(pos: BoardPosition) {
        /* "pop" a unit at a position off the board and returns it. retains the 
            reference to this board.
        */

        if (!this.getUnitAt(pos)) {
            throw new Error("There is no unit here");
        }

        let unit = this.getUnitAt(pos);
        this._units[this._boardDataIndex(pos)] = null;
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
        return this._units[this._boardDataIndex(pos)];
    }

    allUnits() {
        return this._units.filter((u) => u !== null) as Unit[];
    }

    createEffect(E: new () => Effect, at: BoardPosition, team = TeamColor.Neutral) {
        let effect = new E();
        effect.pos = at;
        effect.team = team;

        this.effects.push(effect);

        effect.onPlace();
    }

    removeEffect(effect: Effect) {
        effect.onRemove();
        this.effects = this.effects.filter(e=>e!==effect);
    }

    _moveEffect(effect: Effect, to: BoardPosition) {
        effect.pos = to.copy();
    }
}

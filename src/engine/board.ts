import BoardPosition from "./board_position";
import RuneChess from "./game";
import Unit from "./unit/unit";

export default class Board {
    units: Unit[];
    private _game?: RuneChess;

    constructor() {
        this.units = [];
    }

    get gameInstance() {
        if (!this._game) {
            throw new Error("Board has not been initialized into a game instance");
        }

        return this._game;
    }

    placeUnit(unit: Unit, pos: BoardPosition) {
        unit._board = this;
        unit.pos = pos;
        this.units.push(unit);
    }

    getUnitAt(pos: BoardPosition) {
        for (let unit of this.units) {
            if (unit.pos.isEqual(pos)) {
                return unit;
            }
        }
        return null;
    }
}
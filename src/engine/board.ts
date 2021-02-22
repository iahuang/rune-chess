import BoardPosition from "./board_position";
import Unit from "./unit/unit";

export default class Board {
    units: Unit[];

    constructor() {
        this.units = [];
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
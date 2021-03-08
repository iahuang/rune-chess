import BoardPosition from "../../../board_position";
import Unit from "../../unit";

export default class AbilityTarget {
    unit: Unit | null = null;
    _location: BoardPosition | null = null;

    static atUnit(unit: Unit) {
        let target = new AbilityTarget();
        target.unit = unit;
    }

    static atLocation(pos: BoardPosition) {
        let target = new AbilityTarget();
        target._location = pos;
    }

    static noTarget() {
        return new AbilityTarget();
    }

    get hasNoTarget() {
        return !(this.unit || this._location);
    }

    get targetType() {
        if (this.unit) {
            return "unit";
        }
        if (this._location) {
            return "location";
        }
        return "none";
    }

    get location() {
        if (this._location) return this._location;
        if (this.unit) return this.unit.pos;
        return null;
    }
}
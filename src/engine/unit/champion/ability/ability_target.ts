import BoardPosition from "../../../board_position";
import Unit from "../../unit";

export default class AbilityTarget {
    unit: Unit | null = null;
    location: BoardPosition | null = null;

    static atUnit(unit: Unit) {
        let target = new AbilityTarget();
        target.unit = unit;
    }

    static atLocation(pos: BoardPosition) {
        let target = new AbilityTarget();
        target.location = pos;
    }

    static noTarget() {
        return new AbilityTarget();
    }

    get hasNoTarget() {
        return !(this.unit || this.location);
    }

    get targetType() {
        if (this.unit) {
            return "unit";
        }
        if (this.location) {
            return "location";
        }
        return "none";
    }
}
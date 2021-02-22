import Board from "../../../board";
import BoardPosition from "../../../board_position";
import Unit from "../../unit";
import { AbilityIdentifier } from "../ability/base_ability";
import { LocationTargetedAbility } from "../ability/location_target_ability";
import Champion from "../champion";

class DianaQ extends LocationTargetedAbility {
    name = "Scorn of the Moon";
    identifier = AbilityIdentifier.Q;

    isLocationValid(caster: Unit, target: BoardPosition, board: Board) {
        let dx = caster.pos.x - target.x;
        let dy = caster.pos.y - target.y;

        dx = Math.abs(dx);
        dy = Math.abs(dy);

        return (dx === 3 && dy === 2) || (dx === 3 && dy === 2);
    }
}

export default function Diana() {
    let diana = new Champion({
        maxHP: 945,
        armor: 45,
        magicResistance: 37,
        abilityPower: 60,
        attackDamage: 70,
    });

    diana.name = "Diana";

    diana.abilityQ = new DianaQ();
    return diana;
}

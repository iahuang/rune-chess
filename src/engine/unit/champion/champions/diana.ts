import Board from "../../../board";
import BoardPosition from "../../../board_position";
import { DamageType } from "../../../damage";
import Unit from "../../unit";
import { AbilityEffectMask, AbilityIdentifier } from "../ability/base_ability";
import { LocationTargetedAbility } from "../ability/location_target_ability";
import Champion from "../champion";

class DianaQ extends LocationTargetedAbility {
    name = "Scorn of the Moon";
    identifier = AbilityIdentifier.Q;
    collidesWith = new AbilityEffectMask()
        .allowEnemyChampionTarget()
        .allowEnemyMinionTarget();

    isLocationValid(target: BoardPosition) {
        let dx = this.caster.pos.x - target.x;
        let dy = this.caster.pos.y - target.y;

        dx = Math.abs(dx);
        dy = Math.abs(dy);

        return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
    }

    onHitUnit(unit: Unit) {
        unit.takeDamage(90, this.caster, DamageType.Magic);
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

    diana.abilityQ = new DianaQ(diana);
    return diana;
}

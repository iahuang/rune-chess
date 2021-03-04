import BoardPosition from "../../../board_position";
import { DamageType } from "../../../damage";
import Unit from "../../unit";
import AbilityTarget from "../ability/ability_target";
import { AbilityEffectMask, AbilityIdentifier } from "../ability/base_ability";
import { UnitTargetedAbility } from "../ability/unit_targeted_ability";
import Champion from "../champion";

class SennaQ extends UnitTargetedAbility {
    name = "Piercing Darkness";
    identifier = AbilityIdentifier.Q;
    validTargets = new AbilityEffectMask().allowAll();
    maxRange = 1;
    damageAmount = 100;
    healAmount = 100;

    unitFilter(unit: Unit) {
        // Senna's Q can only target units along the four cardinal directions
        return unit.pos.x === this.caster.pos.x || unit.pos.y === this.caster.pos.y;
    }

    onCast(target: AbilityTarget) {
        let targetPos = target.location!;
        let dx = targetPos.x - this.caster.pos.x;
        let dy = targetPos.y - this.caster.pos.y;

        for (let i=0; i<3; i++) {
            let effectPos = new BoardPosition(dx*i, dy*i).offsetBy(this.caster.pos);
            if (!effectPos.inBounds) {
                continue;
            }
            let affectedUnit = this.caster.board.getUnitAt(effectPos);
            if (affectedUnit) {
                if (affectedUnit.alliedTo(this.caster)) {
                    affectedUnit.heal(this.healAmount);
                } else {
                    affectedUnit.takeDamage(this.damageAmount, this.caster, DamageType.Physical);
                }
            }
        }
    }
}

export class ChampionSenna extends Champion {
    constructor() {
        super({
            maxHP: 816,
            armor: 41,
            magicResistance: 31,
            abilityPower: 0,
            attackDamage: 50,
            attackRange: 2,
            ranged: true,
        });

        this.name = "Senna";
        this.championTitle = "The Redeemer"
        this.abilityQ = new SennaQ(this);
    }
}

export default function Senna() {
    return new ChampionSenna();
}
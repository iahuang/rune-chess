import BoardPosition from "../../../board_position";
import { DamageType } from "../../../damage";
import Unit from "../../unit";
import AbilityTarget from "../ability/ability_target";
import { AbilityEffectMask, AbilityIdentifier, AbilityMetric, AbilityMetricType } from "../ability/base_ability";
import { UnitTargetedAbility } from "../ability/unit_targeted_ability";
import Champion from "../champion";

class SennaQ extends UnitTargetedAbility {
    name = "Piercing Darkness";
    description =
        "Senna casts a beam of light through a directly adjacent unit and the one behind it, dealing [DAMAGE] physical damage to the unit if it is an enemy, and healing for [HEALING] health if it is an ally";
    identifier = AbilityIdentifier.Q;
    validTargets = new AbilityEffectMask()
        .allowAllyChampionTarget()
        .allowAllyMinionTarget()
        .allowEnemyChampionTarget()
        .allowEnemyMinionTarget();
    maxRange = 1;

    unitFilter(unit: Unit) {
        // Senna's Q can only target units along the four cardinal directions
        return unit.pos.x === this.caster.pos.x || unit.pos.y === this.caster.pos.y;
    }

    setMetrics() {
        this.addMetric(
            AbilityMetricType.Damage,
            AbilityMetric.withBaseAmount(100).setADScaling(0.35).setAPScaling(0.4)
        );
        this.addMetric(
            AbilityMetricType.Healing,
            AbilityMetric.withBaseAmount(100).setADScaling(0.3).setAPScaling(0.4)
        );
    }

    onCast(target: AbilityTarget) {
        let targetPos = target.getUnit().pos;
        let dx = targetPos.x - this.caster.pos.x;
        let dy = targetPos.y - this.caster.pos.y;

        for (let i = 0; i < 3; i++) {
            let effectPos = new BoardPosition(dx * i, dy * i).offsetByPos(this.caster.pos);
            if (!effectPos.inBounds) {
                continue;
            }
            let affectedUnit = this.caster.board.getUnitAt(effectPos);
            if (affectedUnit) {
                if (affectedUnit.alliedTo(this.caster)) {
                    affectedUnit.heal(this.computeMetric(AbilityMetricType.Healing));
                } else {
                    this.dealDamage(this.computeMetric(AbilityMetricType.Damage), affectedUnit, DamageType.Physical);
                }
            }
        }
    }
}

export class ChampionSenna extends Champion {
    name = "senna";
    displayName = "Senna";
    championTitle = "The Redeemer";
    displayedQuote = "No one fights alone in the Mist.";
    
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

        this.abilityQ = new SennaQ(this);
    }
}

export default function Senna() {
    return new ChampionSenna();
}

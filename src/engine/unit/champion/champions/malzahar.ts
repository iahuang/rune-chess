import BoardPosition from "../../../board_position";
import { DamageType } from "../../../damage";
import { Debuff } from "../../../status_effect";
import { UnitChannel } from "../../channeling";
import Unit from "../../unit";
import AbilityTarget from "../ability/ability_target";
import { AbilityEffectMask, AbilityIdentifier, AbilityMetric, AbilityMetricType } from "../ability/base_ability";
import { LocationTargetedAbility } from "../ability/location_target_ability";
import { UnitTargetedAbility } from "../ability/unit_targeted_ability";
import Champion from "../champion";

export class MaleficVisions extends Debuff {
    name = "Malefic Visions";
    description = "This unit is taking damage over time";
    damagePerTurn: number = 0;

    onAnyTurnEnd() {
        this.source.dealDamage(this.damagePerTurn, this.holder, DamageType.Physical);
        if (this.holder.dead) {
            for (let unit of this.holder.board.allUnits()) {
                if (this.holder.pos.directlyAdjacentTo(unit.pos)) {
                    let effect = this.source.applyStatusEffectTo(MaleficVisions, unit, 4);
                    effect.damagePerTurn = this.damagePerTurn;
                }
            }
        }
    }
}

class MalzaharE extends UnitTargetedAbility {
    name = "Malefic Visions";
    description =
        "Malzahar infects a target, dealing [DAMAGE] over the next four turns. If the target dies while infected, the effect is passed onto all directly adjacent enemies";
    maxRange = 2;
    identifier = AbilityIdentifier.E;
    validTargets = AbilityEffectMask.allEnemyUnits();
    isLocationValid(pos: BoardPosition) {
        return false;
    }
    onCast(target: AbilityTarget) {
        let unit = target.getUnit();
        let effect = this.caster.applyStatusEffectTo(MaleficVisions, unit, 4);
        effect.damagePerTurn = this.computeMetric(AbilityMetricType.Damage) / 4;
    }

    setMetrics() {
        this.addMetric(AbilityMetricType.Damage, AbilityMetric.withBaseAmount(80).setAPScaling(0.8));
    }
}

class UltChannel extends UnitChannel {
    dpt: number;
    target: Unit;
    constructor(damagePerTurn: number, target: Unit) {
        super();
        this.dpt = damagePerTurn;
        this.target = target;
    }
    onTurnEnd() {
        this.unit.dealDamage(this.dpt, this.target, DamageType.Magic);
        let mv = this.target.getStatusEffect(MaleficVisions);
        if (mv) mv.refreshEffect();
    }
}

class MalzaharR extends UnitTargetedAbility {
    name = "Nether Grasp";
    description =
        "Malzahar *channels* and suppresses an enemy champion for the next four turns, dealing [DAMAGE] magic damage over time. This effect will also refresh any instances of Malefic Visions on that unit.";
    identifier = AbilityIdentifier.R;
    setMetrics() {
        this.addMetric(AbilityMetricType.Damage, AbilityMetric.withBaseAmount(125).setAPScaling(0.8));
    }
    onCast(target: AbilityTarget) {
        const duration = 4;
        let damagePerTurn = this.computeMetric(AbilityMetricType.Damage) / duration;
        this.caster.beginChannelling(new UltChannel(damagePerTurn, target.getUnit()), duration);
    }
    validTargets = new AbilityEffectMask().allowEnemyChampionTarget();
}

export class ChampionMalzahar extends Champion {
    name = "malzahar";
    displayName = "Malzahar";
    championTitle = "Prophet of the Void";
    displayedQuote = "Icathia beckons.";

    constructor() {
        super({
            maxHP: 880,
            armor: 32,
            magicResistance: 31,
            abilityPower: 60,
            attackDamage: 66,
            attackRange: 2,
            ranged: true,
        });

        this.nicknames = ["malz"];
        this.abilityE = new MalzaharE(this);
        this.abilityR = new MalzaharR(this);
    }
}

import BoardPosition from "../../../board_position";
import { DamageType } from "../../../damage";
import { EffectType, StatusEffect } from "../../../status_effect";
import EffectAirborne from "../../../status_effects_common/airborne";
import AbilityTarget from "../ability/ability_target";
import { AbilityIdentifier, AbilityMetric, AbilityMetricType, PassiveAbility } from "../ability/base_ability";
import { LocationTargetedAbility } from "../ability/location_target_ability";
import Champion from "../champion";

class YonePassive extends PassiveAbility {
    name = "Way of the Hunter";
    description =
        "Yone's critical strike chance is multiplied by 2.5x from all sources, but his critical strikes deal only [DAMAGE] bonus physical damage. Additionally, every 1% critical strike chance in excess of 100% is converted into **0.4 bonus AD**";

    setMetrics() {
        this.addMetric(AbilityMetricType.Damage, AbilityMetric.withBaseAmount(0).setADScaling(0.6));
    }
}

class GatheringStorm extends StatusEffect {
    name = "Gathering Storm";
    description = "At two stacks, Yone's next Q is empowered";
    type = EffectType.Buff;
}

class YoneQ extends LocationTargetedAbility {
    name = "Mortal Steel";
    description =
        "Yone strikes in one of the four cardinal directions, dealing [DAMAGE] physical damage to the unit there, gaining a stack of *Gathering Storm*. At two stacks, Yone airbornes the target and the one behind it as well, dealing damage to both";
    identifier = AbilityIdentifier.Q;

    setMetrics() {
        this.addMetric(AbilityMetricType.Damage, AbilityMetric.withBaseAmount(20).setADScaling(1.0));
    }

    isLocationValid(loc: BoardPosition) {
        return loc.directlyAdjacentTo(this.caster.pos);
    }

    onCast(target: AbilityTarget) {
        let unit = this.caster.board.getUnitAt(target.location!);
        let qEffect = this.caster.getStatusEffect(GatheringStorm)!;
        if (unit) unit.takeDamage(this.computeMetric(AbilityMetricType.Damage), this.caster, DamageType.Physical);

        if (qEffect.stacks() < 2) {
            if (unit) qEffect.addStack(); // stacks are only gained if Yone hits something
            this.caster.sayRandom(["Piercing winds!", "Storm of blades!", "Steel gale!"]);
        } else {
            // get space behind the targeted pos
            let p = target.location!;
            let dx = p.x - this.caster.pos.x;
            let dy = p.y - this.caster.pos.y;
            let unitBehind = this.caster.board.getUnitAt(this.caster.pos.offsetBy(new BoardPosition(dx * 2, dy * 2)));

            if (unitBehind) {
                unitBehind.takeDamage(this.computeMetric(AbilityMetricType.Damage), this.caster, DamageType.Physical);
            }

            for (let toAirborne of [unit, unitBehind]) {
                if (toAirborne) this.caster.applyStatusEffectTo(EffectAirborne, toAirborne, 2);
            }

            qEffect.resetStacks();
            this.caster.sayRandom(["O'sai!", "Kou'an!", "Kase'ton!"]);
        }
    }
}

export class ChampionYone extends Champion {
    constructor() {
        super({
            maxHP: 885,
            armor: 41,
            magicResistance: 36,
            abilityPower: 0,
            attackDamage: 67,
            attackRange: 1,
            ranged: false,
        });

        this.name = "Yone";
        this.championTitle = "The Unforgotten";
        this.passive = new YonePassive(this);
        this.abilityQ = new YoneQ(this);

        this.applySelfStatusEffect(GatheringStorm, null);
    }

    calculateCritChance() {
        return super.calculateCritChance() * 2.5;
    }

    calculateAD() {
        let excessCrit = Math.max(1 - this.calculateCritChance(), 0);
        return super.calculateAD() + 0.4 * excessCrit * 100;
    }
}

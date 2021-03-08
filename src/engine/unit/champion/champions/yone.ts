import { AbilityIdentifier, AbilityMetric, AbilityMetricType, BaseAbility, PassiveAbility } from "../ability/base_ability";
import Champion from "../champion";

class YonePassive extends PassiveAbility {
    name = "Way of the Hunter";
    description =
        "Yone's critical strike chance is multiplied by 2.5x from all sources, but his critical strikes deal only [DAMAGE] bonus physical damage. Additionally, every 1% critical strike chance in excess of 100% is converted into **0.4 bonus AD**";
    
    setMetrics() {
        this.addMetric(AbilityMetricType.Damage, AbilityMetric.withBaseAmount(0).setADScaling(0.6));
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
    }

    calculateCritChance() {
        return super.calculateCritChance() * 2.5;
    }

    calculateAD() {
        let excessCrit = Math.max(1 - this.calculateCritChance(), 0);
        return super.calculateAD() + 0.4*excessCrit*100;
    }
}

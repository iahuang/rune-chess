import { EffectEkkoTimewinder } from "../../../effects/ekko";
import AbilityTarget from "../ability/ability_target";
import { AbilityIdentifier, AbilityMetric, AbilityMetricType } from "../ability/base_ability";
import { LocationTargetedAbility } from "../ability/location_target_ability";
import { SelfTargetedAbility } from "../ability/self_targeted_ability";
import Champion from "../champion";

class EkkoQ extends LocationTargetedAbility {
    name = "Timewinder";
    description =
        "Ekko places a temporal grenade two squares from him, immediately dealing [DAMAGE] magic damage, and on the next turn returning to the square from which it was casted, dealing [SECONDARY_DAMAGE] magic damage along the way.";
    identifier = AbilityIdentifier.Q;

    setMetrics() {
        this.addMetric(AbilityMetricType.Damage, AbilityMetric.withBaseAmount(60).setAPScaling(0.3));
        this.addMetric(AbilityMetricType.SecondaryDamage, AbilityMetric.withBaseAmount(40).setAPScaling(0.6));
    }

    onCast(target: AbilityTarget) {
        this.createAlliedEffect(EffectEkkoTimewinder, target.location!);
    }
}

class EkkoR extends SelfTargetedAbility {
    name = "Chronobreak";
    description =
        "Ekko travels back in time, returning to where he was four turns ago, *displacing* any units where he lands, dealing [DAMAGE] magic damage and healing for [HEALING] HP";
    identifier = AbilityIdentifier.R;

    setMetrics() {
        this.addMetric(AbilityMetricType.Damage, AbilityMetric.withBaseAmount(150).setAPScaling(1.5));
        this.addMetric(AbilityMetricType.Healing, AbilityMetric.withBaseAmount(100).setAPScaling(0.6));
    }

    onCast() {

    }
}

export class ChampionEkko extends Champion {
    constructor() {
        super({
            maxHP: 920,
            armor: 43,
            magicResistance: 36,
            abilityPower: 60,
            attackDamage: 70,
            attackRange: 1,
            ranged: false,
        });
        this.name = "Ekko";
        this.championTitle = "The Boy who Shattered Time";
        this.abilityQ = new EkkoQ(this);
        this.abilityR = new EkkoR(this);
    }
}

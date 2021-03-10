import BoardPosition from "../../../board_position";
import { DamageType } from "../../../damage";
import { Buff, EffectType } from "../../../status_effect";
import EffectAirborne from "../../../status_effects_common/airborne";
import Unit from "../../unit";
import AbilityTarget from "../ability/ability_target";
import {
    AbilityEffectMask,
    AbilityIdentifier,
    AbilityMetric,
    AbilityMetricType,
    PassiveAbility,
} from "../ability/base_ability";
import { LocationTargetedAbility } from "../ability/location_target_ability";
import { SelfTargetedAbility } from "../ability/self_targeted_ability";
import Champion from "../champion";

class YonePassive extends PassiveAbility {
    name = "Way of the Hunter";
    description =
        "Yone's critical strike chance is multiplied by 2.5x from all sources, but his critical strikes deal only [DAMAGE] bonus physical damage. Additionally, every 1% critical strike chance in excess of 100% is converted into **0.4 bonus AD**";

    setMetrics() {
        this.addMetric(AbilityMetricType.Damage, AbilityMetric.withBaseAmount(0).setADScaling(0.6));
    }
}

class GatheringStorm extends Buff {
    name = "Gathering Storm";
    description = "At two stacks, Yone's next Q is empowered";
}

class SoulUnbound extends Buff {
    name = "Soul Unbound";
    description = "Yone is in Spirit Form";

    onExpire() {
        if (!(this.user instanceof ChampionYone)) {
            throw new Error("Cannot return champion to body - champion is not Yone");
        }
        let yone = this.user as ChampionYone;
        (yone.abilityE! as YoneE).soulUnboundShouldEnd();
    }
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
        let unit = this.caster.board.getUnitAt(target.getLocation());
        let qEffect = this.caster.getStatusEffect(GatheringStorm)!;
        if (unit) this.dealDamageToEnemyUnits(this.computeMetric(AbilityMetricType.Damage), unit, DamageType.Physical);

        if (qEffect.stacks() < 2) {
            if (unit) qEffect.addStack(); // stacks are only gained if Yone hits something
            this.caster.sayRandom(["Piercing winds!", "Storm of blades!", "Steel gale!"]);
        } else {
            // get space behind the targeted pos
            let p = target.getLocation();
            let dx = p.x - this.caster.pos.x;
            let dy = p.y - this.caster.pos.y;
            let unitBehind = this.caster.board.getUnitAt(this.caster.pos.offsetBy(new BoardPosition(dx * 2, dy * 2)));

            if (unitBehind) {
                this.dealDamageToEnemyUnits(this.computeMetric(AbilityMetricType.Damage), unitBehind, DamageType.Physical);
            }

            for (let toAirborne of [unit, unitBehind]) {
                if (toAirborne) this.caster.applyStatusEffectTo(EffectAirborne, toAirborne, 2);
            }

            qEffect.resetStacks();
            this.caster.sayRandom(["O'sai!", "Kou'an!", "Kase'ton!"]);
        }
    }
}

interface YoneEAffectedTarget {
    unit: Unit;
    damagePostMitigation: number;
}

class YoneE extends LocationTargetedAbility {
    name = "Soul Unbound";
    description =
        "Yone dashes to one of eight adjacent empty squares, leaving behind a clone. After two active turns, Yone returns to his body, repeating 25% of damage dealt while in Spirit Form.";
    identifier = AbilityIdentifier.E;

    damageListener: number = -1;

    affectedTargets: YoneEAffectedTarget[] = [];

    setMetrics() {}

    isLocationValid(loc: BoardPosition) {
        return BoardPosition.withinSquare(this.caster.pos, loc, 1) && this.board.getUnitAt(loc) === null;
    }

    onCast(target: AbilityTarget) {
        let to = target.getLocation();
        this.caster.moveTo(to!);

        this.caster.applySelfStatusEffect(SoulUnbound, 4);
        this.disableCasting();
        this.affectedTargets = [];
        this.damageListener = this.board.gameInstance.events.damageTaken.addEventListener((event) => {
            if (event.from === this.caster) {
                for (let alreadyAffected of this.affectedTargets) {
                    if (alreadyAffected.unit === event.to) {
                        alreadyAffected.damagePostMitigation += event.postMitigationDamage;
                        return;
                    }
                }
                this.affectedTargets.push({
                    unit: event.to,
                    damagePostMitigation: event.postMitigationDamage,
                });
            }
        });

        this.caster.sayRandom(["Nowhere to hide!", "Spirit unmoored!", "Cross the veil!"]);
    }

    soulUnboundShouldEnd() {
        this.enableCasting();
        this.board.gameInstance.events.damageTaken.removeEventListener(this.damageListener);
        for (let affectedTarget of this.affectedTargets) {
            this.dealDamage(affectedTarget.damagePostMitigation * 0.25, affectedTarget.unit, DamageType.True);
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
        this.abilityE = new YoneE(this);
        this.displayedQuote = "Without a banquet of sorrow, an azakana starves.";

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

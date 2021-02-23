import Board from "../../../board";
import BoardPosition from "../../../board_position";
import { DamageType } from "../../../damage";
import { EffectType, StatusEffect } from "../../../status_effect";
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

    onHitUnit(hit: Unit) {
        hit.takeDamage(90, this.caster, DamageType.Magic);
        hit.applyStatusEffect(MoonlightDebuff.effectConstructor, hit);
    }
}

class MoonlightDebuff extends StatusEffect {
    name = "Moonlight";
    description = "Doesn't do anything at the moment";
    type = EffectType.Debuff;
    effectDuration = 1;
}

export default function Diana() {
    let diana = new Champion({
        maxHP: 945,
        armor: 45,
        magicResistance: 37,
        abilityPower: 60,
        attackDamage: 70,
        attackRange: 1,
        ranged: false
    });

    diana.name = "Diana";

    diana.abilityQ = new DianaQ(diana);

    return diana;
}

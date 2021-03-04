import Board from "../../../board";
import BoardPosition from "../../../board_position";
import { applyAOEDamage, DamageType } from "../../../damage";
import { EffectType, StatusEffect } from "../../../status_effect";
import Unit from "../../unit";
import { AbilityEffectMask, AbilityIdentifier } from "../ability/base_ability";
import { LocationTargetedAbility } from "../ability/location_target_ability";
import { SelfTargetedAbility } from "../ability/self_targeted_ability";
import Champion from "../champion";

class DianaQ extends LocationTargetedAbility {
    name = "Crescent Strike";
    description =
        "Diana creates a bolt of lunar energy that strikes at a position at an L shape relative to Diana, similar to a Knight moving in chess, dealing [DAMAGE] magic damage to enemies hit and afflicting them with *Moonlight* for 1 active turn";
    identifier = AbilityIdentifier.Q;
    collidesWith = new AbilityEffectMask().allowEnemyChampionTarget().allowEnemyMinionTarget();

    isLocationValid(target: BoardPosition) {
        let dx = this.caster.pos.x - target.x;
        let dy = this.caster.pos.y - target.y;

        dx = Math.abs(dx);
        dy = Math.abs(dy);

        return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
    }

    onHitUnit(hit: Unit) {
        hit.takeDamage(90, this.caster, DamageType.Magic);
        hit.applyStatusEffect(MoonlightDebuff, 1);
    }
}

class DianaUlt extends SelfTargetedAbility {
    name = "Moonfall";
    description = "Diana smites the area within 1 square around her with lunar energy, dealing [DAMAGE] magic damage"
    identifier = AbilityIdentifier.R;

    onCast() {
        applyAOEDamage({
            sourceAbility: this,
            origin: this.caster.pos,
            squareRadius: 1,
            amount: 200,
            type: DamageType.Magic,
            mask: new AbilityEffectMask().allowEnemyChampionTarget().allowEnemyMinionTarget(),
        });
    }
}

class MoonlightDebuff extends StatusEffect {
    name = "Moonlight";
    description = "Doesn't do anything at the moment";
    type = EffectType.Debuff;
    effectDuration = 1;
}

export class ChampionDiana extends Champion {
    constructor() {
        super({
            maxHP: 945,
            armor: 45,
            magicResistance: 37,
            abilityPower: 60,
            attackDamage: 70,
            attackRange: 1,
            ranged: false,
        });
        this.name = "Diana";
        this.championTitle = "Scorn of the Moon";
        this.abilityQ = new DianaQ(this);
        this.abilityR = new DianaUlt(this);
    }
}

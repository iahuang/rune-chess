import BoardPosition from "./board_position";
import { AbilityEffectMask, BaseAbility } from "./unit/champion/ability/base_ability";
import Unit from "./unit/unit";

export enum DamageType {
    Physical,
    Magic,
    True,
}

export function calculateDamageMultiplier(resistance: number) {
    if (resistance >= 0) {
        return 100 / (100 + resistance);
    } else {
        return 2 - 100 / (100 - resistance);
    }
}

export function calculateDamageTaken(amount: number, resistance: number) {
    return calculateDamageMultiplier(resistance) * amount;
}

export interface AOEDamage {
    sourceAbility: BaseAbility;
    origin: BoardPosition;
    squareRadius: number;
    amount: number;
    type: DamageType;
    mask: AbilityEffectMask;
}

export function applyAOEDamage(effect: AOEDamage) {
    let at = effect.origin;
    let radius = effect.squareRadius;
    let board = effect.sourceAbility.caster.board;

    for (let x = at.x - radius; x <= at.x + radius; x++) {
        for (let y = at.y - radius; y <= at.y + radius; y++) {
            let pos = BoardPosition.at(x, y);
            if (!pos.inBounds) {
                continue;
            }

            let unit = board.getUnitAt(pos);

            if (unit) {
                if (effect.sourceAbility.canAffect(unit, effect.mask)) {
                    unit.dealDamage(effect.amount, unit, effect.type);
                }
            }
        }
    }
}

import { EffectType, StatusEffect } from "../status_effect";

export default class EffectGreviousWounds extends StatusEffect {
    name = "Grevious Wounds";
    description = "Healing is reduced on this Unit";
    type = EffectType.Debuff;

    healingReduction = 0.5;
} 
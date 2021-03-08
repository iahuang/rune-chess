import { EffectType, StatusEffect } from "../status_effect";

export default class EffectAirborne extends StatusEffect {
    name = "Airborne";
    description = "This unit is airborne";
    type = EffectType.Debuff;
} 
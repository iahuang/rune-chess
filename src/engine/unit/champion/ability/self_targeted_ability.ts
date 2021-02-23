import { AbilityEffectMask } from "./base_ability";
import { UnitTargetedAbility } from "./unit_targeted_ability";

export abstract class SelfTargetedAbility extends UnitTargetedAbility {
    validTargets = new AbilityEffectMask().allowSelfTarget();
}

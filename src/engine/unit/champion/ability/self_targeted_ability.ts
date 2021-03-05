import { AbilityEffectMask, BaseAbility, TargetType } from "./base_ability";
import { UnitTargetedAbility } from "./unit_targeted_ability";

export abstract class SelfTargetedAbility extends BaseAbility {
    targetType = TargetType.Self;
}

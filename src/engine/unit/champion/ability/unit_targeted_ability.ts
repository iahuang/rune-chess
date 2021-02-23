import { AbilityEffectMask, BaseAbility, TargetType } from "./base_ability";



export abstract class UnitTargetedAbility extends BaseAbility {
    abstract validTargets: AbilityEffectMask;
    targetType = TargetType.Unit;
    abstract onUse(): void;
    _onCast () {
        this.onUse();
    }
}
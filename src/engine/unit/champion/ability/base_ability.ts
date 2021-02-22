export enum AbilityIdentifier { Q, W, E, R, None }

export enum TargetType {
    None,       // passive or other
    Self,       // self-targeted
    Unit,       // targets a unit
    Location    // targets a specific point on the board
}

export abstract class BaseAbility {
    abstract identifier: AbilityIdentifier;
    abstract name: string;
    abstract targetType: TargetType;

    get isUltimate() {
        return this.identifier === AbilityIdentifier.R;
    }
}


class _NoAbility extends BaseAbility {
    name = "None";
    identifier = AbilityIdentifier.None;
    targetType = TargetType.None
}

export function NoAbility() {
    return new _NoAbility();
}

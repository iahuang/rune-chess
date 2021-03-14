import { Debuff } from "../status_effect";

export class CCRooted extends Debuff {
    name = "Rooted";
    description = "This unit is rooted and cannot move or use mobility abilities";
    onApply() {
        this.holder.addImmobilizingEffect();
    }
    onExpire() {
        this.holder.releaseImmobilizingEffect();
    }
}

export class CCStunned extends Debuff {
    name = "Stunned";
    description = "This unit is stunned and cannot move or perform abilities";
    onApply() {
        this.holder.addImmobilizingEffect();
        this.holder.addSilencingEffect();
    }
    onExpire() {
        this.holder.releaseImmobilizingEffect();
        this.holder.releaseSilencingEffect();
    }
}

export class CCSuppressed extends Debuff {
    name = "Suppressed";
    description = "This unit is suppressed and cannot move or perform abilities";
    onApply() {
        this.holder.addImmobilizingEffect();
        this.holder.addSilencingEffect();
    }
    onExpire() {
        this.holder.releaseImmobilizingEffect();
        this.holder.releaseSilencingEffect();
    }
}
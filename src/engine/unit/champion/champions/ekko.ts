import Vector2 from "../../../../util/vector2";
import BoardPosition from "../../../board_position";
import { DamageType } from "../../../damage";
import { Effect, EffectId, EffectRectangularHitbox } from "../../../effect";
import AbilityTarget from "../ability/ability_target";
import { AbilityIdentifier, AbilityMetric, AbilityMetricType } from "../ability/base_ability";
import { LocationTargetedAbility } from "../ability/location_target_ability";
import { SelfTargetedAbility } from "../ability/self_targeted_ability";
import Champion from "../champion";

export class EffectEkkoShadow extends Effect {
    id = EffectId.EkkoShadow;
}

export class EffectEkkoTimewinder extends Effect {
    id = EffectId.EkkoTimewinder;
    hitbox = EffectRectangularHitbox.square(1);
    castedFrom: BoardPosition = BoardPosition.origin();
}

class EkkoQ extends LocationTargetedAbility {
    name = "Timewinder";
    description =
        "Ekko places a temporal grenade, immediately dealing [DAMAGE] magic damage, and on the next turn returning to the square from which it was casted, dealing [SECONDARY_DAMAGE] magic damage along the way.";
    identifier = AbilityIdentifier.Q;
    maxRange = 2;

    setMetrics() {
        this.addMetric(AbilityMetricType.Damage, AbilityMetric.withBaseAmount(60).setAPScaling(0.3));
        this.addMetric(AbilityMetricType.SecondaryDamage, AbilityMetric.withBaseAmount(40).setAPScaling(0.6));
    }

    onCast(target: AbilityTarget) {
        let effect = this.createAlliedEffect(EffectEkkoTimewinder, target.getLocation());

        let castedFrom = this.caster.pos.copy();
        effect.onInactiveTurnEnd = () => {
            // return effect to the place it was casted from

            // we set the collision event here so that the secondary damage
            // only procs when the effect is set to return
            effect.onCollision = (unit) => {
                if (unit.alliedTo(this.caster)) return;
                this.dealDamage(this.computeMetric(AbilityMetricType.SecondaryDamage), unit, DamageType.Magic);
            };

            // move the effect towards castedFrom
            while (!effect.pos.equals(castedFrom)) {
                let dx = effect.pos.x - castedFrom.x;
                let dy = effect.pos.y - castedFrom.y;

                // normalize vector
                let dir = new Vector2(dx, dy).normalized();

                // make sure we don't have any decimals
                dir.x = Math.ceil(dir.x);
                dir.y = Math.ceil(dir.y);

                let newPos = effect.pos.offsetBy(-dir.x, -dir.y);
                // "drag" the effect back to the origin, colliding along the way
                effect.moveTo(newPos);
            }

            effect.remove();
        };
    }
}

class EkkoR extends SelfTargetedAbility {
    name = "Chronobreak";
    description =
        "Ekko travels back in time, returning to where he was four turns ago, *displacing* any units where he lands, dealing [DAMAGE] magic damage and healing for [HEALING] HP";
    identifier = AbilityIdentifier.R;
    requiresMobility = true;
    _shadowEffect: Effect | null = null;
    moveHistory: BoardPosition[] = [];
    numTurnsRewind = 4;

    setMetrics() {
        this.addMetric(AbilityMetricType.Damage, AbilityMetric.withBaseAmount(150).setAPScaling(1.5));
        this.addMetric(AbilityMetricType.Healing, AbilityMetric.withBaseAmount(100).setAPScaling(0.6));
    }

    getLandLocation() {
        let loc = this.moveHistory[0];
        if (!loc) throw new Error("Cannot call getLandLocation when Ekko has not been placed on board!");
        return loc;
    }

    _createShadow() {
        if (!this._shadowEffect) {
            this._shadowEffect = this.createAlliedEffect(EffectEkkoShadow, this.getLandLocation());
        }
    }

    getShadowEffect() {
        let s = this._shadowEffect;
        if (!s) throw new Error("Ekko shadow effect has not been created!");
        return s;
    }

    onCast() {
        let landing = this.getLandLocation();
        let unitThere = this.board.getUnitAt(landing);
        if (unitThere) this.board.displace(unitThere);
        this.caster.moveTo(landing);
        // deal damage where Ekko lands
        for (let adj of landing.directlyAdjacentSquares()) {
            let unit = this.board.getUnitAt(adj);
            let splashDamage = this.computeMetric(AbilityMetricType.Damage);
            if (unit) {
                this.dealDamageToEnemyUnit(splashDamage, unit, DamageType.Magic);
            }
        }
        // heal
        let healingAmt = this.computeMetric(AbilityMetricType.Healing);
        this.caster.heal(healingAmt);
    }

    onUnitPlaced() {
        this.moveHistory.push(this.caster.pos.copy());
        this._createShadow();
    }

    passivelyOnActiveTurnEnd() {
        this.moveHistory.push(this.caster.pos.copy());
        if (this.moveHistory.length > this.numTurnsRewind) {
            this.moveHistory.pop();
        }
        let eff = this.getShadowEffect();
        eff.moveTo(this.getLandLocation());
    }
}

export class ChampionEkko extends Champion {
    name = "ekko";
    displayName = "Ekko";
    championTitle = "The Boy who Shattered Time";
    displayedQuote = "I'd rather make mistakes than make nothing at all.";
    constructor() {
        super({
            maxHP: 920,
            armor: 43,
            magicResistance: 36,
            abilityPower: 60,
            attackDamage: 70,
            attackRange: 1,
            ranged: false,
        });

        this.abilityQ = new EkkoQ(this);
        this.abilityR = new EkkoR(this);
    }
}

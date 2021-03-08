import BoardPosition from "../board_position";
import { Effect, EffectId, EffectRectangularHitbox } from "../effect";

export class EffectEkkoShadow extends Effect {
    id = EffectId.EkkoShadow;
}

export class EffectEkkoTimewinder extends Effect {
    id = EffectId.EkkoTimewinder;
    hitbox = EffectRectangularHitbox.square(1);
    castedFrom: BoardPosition = BoardPosition.origin();
}
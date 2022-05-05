import { z } from 'zod';

import { IVec2, Vec2 } from './vec2';

export const IRect = z.object({
  topLeft: IVec2,
  bottomRight: IVec2,
});

export type IRect = z.output<typeof IRect>;

export class Rect {
  topLeft: Vec2;
  bottomRight: Vec2;

  constructor(topLeft?: Vec2 | IRect, bottomRight?: Vec2) {
    if (topLeft instanceof Vec2) {
      this.topLeft = new Vec2(topLeft);
      this.bottomRight = new Vec2(bottomRight ?? topLeft);
    } else {
      this.topLeft = new Vec2(topLeft?.topLeft);
      this.bottomRight = new Vec2(topLeft?.bottomRight);
    }
  }

  get size(): Vec2 {
    return this.bottomRight.sub(this.topLeft);
  }
  set size(value: Vec2) {
    this.bottomRight = this.topLeft.add(value);
  }

  get center(): Vec2 {
    return this.topLeft.lerp(this.bottomRight, 0.5);
  }

  grow(amount: number) {
    return new Rect(
      this.topLeft.subScalar(amount),
      this.bottomRight.addScalar(amount)
    );
  }

  inside(rect: Rect) {
    return (
      this.topLeft.x >= rect.topLeft.x &&
      this.topLeft.y >= rect.topLeft.y &&
      this.bottomRight.x <= rect.bottomRight.x &&
      this.bottomRight.y <= rect.bottomRight.y
    );
  }
}

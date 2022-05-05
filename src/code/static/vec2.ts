import { z } from 'zod';
import { lerp } from './math';

export const IVec2 = z.object({
  x: z.number(),
  y: z.number(),
});

export type IVec2 = z.output<typeof IVec2>;

export class Vec2 {
  x: number;
  y: number;

  constructor(x?: number | IVec2, y?: number) {
    if (typeof x === 'number') {
      this.x = x;
      this.y = y ?? x;
    } else if (typeof x === 'object') {
      this.x = x.x;
      this.y = x.y;
    } else {
      this.x = 0;
      this.y = 0;
    }
  }

  add(vec: Vec2): Vec2 {
    return new Vec2(this.x + vec.x, this.y + vec.y);
  }
  sub(vec: Vec2): Vec2 {
    return new Vec2(this.x - vec.x, this.y - vec.y);
  }
  mul(vec: Vec2): Vec2 {
    return new Vec2(this.x * vec.x, this.y * vec.y);
  }
  div(vec: Vec2): Vec2 {
    return new Vec2(this.x / vec.x, this.y / vec.y);
  }

  addScalar(scalar: number): Vec2 {
    return new Vec2(this.x + scalar, this.y + scalar);
  }
  subScalar(scalar: number): Vec2 {
    return new Vec2(this.x - scalar, this.y - scalar);
  }
  mulScalar(scalar: number): Vec2 {
    return new Vec2(this.x * scalar, this.y * scalar);
  }
  divScalar(scalar: number): Vec2 {
    return new Vec2(this.x / scalar, this.y / scalar);
  }

  dot(vec: Vec2): number {
    return this.x * vec.x + this.y * vec.y;
  }
  cross(vec: Vec2): number {
    return this.x * vec.y - this.y * vec.x;
  }

  length(): number {
    return Math.sqrt(this.dot(this));
  }
  normalize(): Vec2 {
    return this.divScalar(this.length());
  }
  distance(vec: Vec2): number {
    return this.sub(vec).length();
  }

  angle(vec: Vec2): number {
    return Math.atan2(this.cross(vec), this.dot(vec));
  }
  rotate(angle: number): Vec2 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vec2(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
  }

  pow(power: number): Vec2 {
    return new Vec2(Math.pow(this.x, power), Math.pow(this.y, power));
  }
  sqrt(): Vec2 {
    return new Vec2(Math.sqrt(this.x), Math.sqrt(this.y));
  }

  lerp(vec: Vec2, t: number): Vec2 {
    return this.add(vec.sub(this).mulScalar(t));
  }
  vecLerp(vec: Vec2, t: Vec2): Vec2 {
    return new Vec2(lerp(this.x, vec.x, t.x), lerp(this.y, vec.y, t.y));
  }
}

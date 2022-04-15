import { Vec2 } from 'src/boot/static/vec2';
import { PagePos } from '../space/pos';
import { PageCamera } from './camera';

export class AppPanning {
  camera: PageCamera;
  pos: PagePos;

  currentPos: Vec2 = new Vec2();

  constructor(camera: PageCamera, pos: PagePos) {
    this.camera = camera;
    this.pos = pos;
  }

  start(event: PointerEvent) {
    if (this.camera.react.lockPos) return;

    this.currentPos = this.pos.clientFromEvent(event);
  }
}

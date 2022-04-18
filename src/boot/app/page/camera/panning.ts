import { Vec2 } from 'src/boot/static/vec2';
import { AppPage } from '../page';

export class PagePanning {
  readonly page: AppPage;

  currentPos: Vec2 = new Vec2();

  constructor(page: AppPage) {
    this.page = page;
  }

  start(event: PointerEvent) {
    if (this.page.camera.react.lockPos) {
      return;
    }

    this.currentPos = this.page.pos.eventToClient(event);
  }
}

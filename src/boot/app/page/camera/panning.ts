import { Vec2 } from 'src/boot/static/vec2';
import { Page } from '../page';

export class PagePanning {
  page: Page;

  currentPos: Vec2 = new Vec2();

  constructor(page: Page) {
    this.page = page;
  }

  start(event: PointerEvent) {
    if (this.page.camera.react.lockPos) return;

    this.currentPos = this.page.pos.clientFromEvent(event);
  }
}

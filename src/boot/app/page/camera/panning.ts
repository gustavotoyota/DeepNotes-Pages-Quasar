import { listenPointerEvents } from 'src/boot/static/dom';
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

    listenPointerEvents(event, {
      move: this._update,
    });
  }

  private _update = function (this: PagePanning, event: PointerEvent) {
    // if (this.page.pinching.active)
    //   return

    const clientPos = this.page.pos.eventToClient(event);

    this.page.camera.react.pos.x -=
      (clientPos.x - this.currentPos.x) / this.page.camera.react.zoom;
    this.page.camera.react.pos.y -=
      (clientPos.y - this.currentPos.y) / this.page.camera.react.zoom;

    this.currentPos = new Vec2(clientPos);
  }.bind(this);

  cancel = function (this: PagePanning) {
    document.removeEventListener('pointermove', this._update);
  }.bind(this);
}

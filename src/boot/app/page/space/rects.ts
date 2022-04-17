import { Rect } from 'src/boot/static/rect';
import { Vec2 } from 'src/boot/static/vec2';
import { AppPage } from '../page';

export class PageRects {
  page: AppPage;

  get pos() {
    return this.page.pos;
  }

  constructor(page: AppPage) {
    this.page = page;
  }

  fromDisplay() {
    const node = document.querySelector('.display.active');

    if (node == null) throw 'No active display';

    const domClientRect = node.getBoundingClientRect();

    return this.fromDOM(domClientRect);
  }
  fromDOM(domRect: DOMRect) {
    return new Rect(
      new Vec2(domRect.left, domRect.top),
      new Vec2(domRect.right, domRect.bottom)
    );
  }

  clientToWorld(clientRect: Rect): Rect {
    return new Rect(
      this.pos.clientToWorld(clientRect.topLeft),
      this.pos.clientToWorld(clientRect.bottomRight)
    );
  }
  worldToClient(clientRect: Rect): Rect {
    return new Rect(
      this.pos.worldToClient(clientRect.topLeft),
      this.pos.worldToClient(clientRect.bottomRight)
    );
  }

  displayToWorld(displayRect: Rect): Rect {
    return new Rect(
      this.pos.displayToWorld(displayRect.topLeft),
      this.pos.displayToWorld(displayRect.bottomRight)
    );
  }
  worldToDisplay(displayRect: Rect): Rect {
    return new Rect(
      this.pos.worldToDisplay(displayRect.topLeft),
      this.pos.worldToDisplay(displayRect.bottomRight)
    );
  }

  displayToClient(displayRect: Rect): Rect {
    return new Rect(
      this.pos.displayToClient(displayRect.topLeft),
      this.pos.displayToClient(displayRect.bottomRight)
    );
  }
  clientToDisplay(displayRect: Rect): Rect {
    return new Rect(
      this.pos.clientToDisplay(displayRect.topLeft),
      this.pos.clientToDisplay(displayRect.bottomRight)
    );
  }
}

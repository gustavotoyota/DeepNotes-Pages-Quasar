import { listenPointerEvents } from 'src/boot/static/dom';
import { Rect } from 'src/boot/static/rect';
import { Vec2 } from 'src/boot/static/vec2';
import { refProp } from 'src/boot/static/vue';
import { UnwrapRef } from 'vue';
import { AppPage } from '../page';

export interface IPageBoxSelectionReact {
  active: boolean;

  displayStart: Vec2;
  displayEnd: Vec2;
}

export class PageBoxSelection {
  static readonly MIN_DISTANCE = 5;

  readonly page: AppPage;

  react: UnwrapRef<IPageBoxSelectionReact>;

  downEvent!: PointerEvent;

  constructor(page: AppPage) {
    this.page = page;

    this.react = refProp<IPageBoxSelectionReact>(this, 'react', {
      active: false,

      displayStart: new Vec2(),
      displayEnd: new Vec2(),
    });
  }

  start(event: PointerEvent) {
    const displayPos = this.page.pos.eventToDisplay(event);

    this.react = {
      active: false,

      displayStart: new Vec2(displayPos),
      displayEnd: new Vec2(displayPos),
    };

    this.downEvent = event;

    listenPointerEvents(event, {
      move: this._pointerMove,
      up: this._pointerUp,
    });
  }

  private _pointerMove = function (
    this: PageBoxSelection,
    event: PointerEvent
  ) {
    const displayPos = this.page.pos.eventToDisplay(event);

    if (!this.react.active) {
      const dist = displayPos.sub(this.react.displayStart).length();

      this.react.active = dist >= PageBoxSelection.MIN_DISTANCE;

      if (!this.react.active) {
        return;
      }
    }

    this.react.displayEnd = new Vec2(displayPos);
  }.bind(this);

  private _pointerUp = function (this: PageBoxSelection, event: PointerEvent) {
    this.react.active = false;

    const clientStart = this.page.pos.displayToClient(this.react.displayStart);
    const clientEnd = this.page.pos.displayToClient(this.react.displayEnd);

    const clientTopLeft = new Vec2(
      Math.min(clientStart.x, clientEnd.x),
      Math.min(clientStart.y, clientEnd.y)
    );
    const clientBottomRight = new Vec2(
      Math.max(clientStart.x, clientEnd.x),
      Math.max(clientStart.y, clientEnd.y)
    );

    const clientRect = new Rect(clientTopLeft, clientBottomRight);

    for (const note of this.page.react.notes) {
      if (!note.react.clientRect.inside(clientRect)) {
        continue;
      }

      if (note.react.selected && !event.shiftKey) {
        this.page.selection.remove(note);
      } else {
        this.page.selection.add(note);
      }
    }

    // for (const arrow of this.page.react.arrows) {
    //   const clientRect = arrow.getClientRect()

    //   if (clientRect.topLeft.x < topLeft.x || clientRect.topLeft.y < topLeft.y
    //   || clientRect.bottomRight.x > bottomRight.x || clientRect.bottomRight.y > bottomRight.y)
    //     continue

    //   if (arrow.selected && !event.shiftKey)
    //     this.page.selection.remove(arrow)
    //   else
    //     this.page.selection.add(arrow)
    // }
  }.bind(this);
}

import { listenPointerEvents } from 'src/boot/static/dom';
import { Vec2 } from 'src/boot/static/vec2';
import { refProp } from 'src/boot/static/vue';
import { UnwrapNestedRefs } from 'vue';
import { AppPage } from '../page';

export interface IPageBoxSelectionReact {
  active: boolean;

  startPos: Vec2;
  endPos: Vec2;
}

export class PageBoxSelection {
  static readonly MIN_DISTANCE = 5;

  readonly page: AppPage;

  react!: UnwrapNestedRefs<IPageBoxSelectionReact>;

  downEvent!: PointerEvent;

  constructor(page: AppPage) {
    this.page = page;

    refProp<IPageBoxSelectionReact>(this, 'react', {
      active: false,

      startPos: new Vec2(),
      endPos: new Vec2(),
    });
  }

  start(event: PointerEvent) {
    const displayPos = this.page.pos.eventToDisplay(event);

    this.react = {
      active: true,

      startPos: new Vec2(displayPos),
      endPos: new Vec2(displayPos),
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
      const dist = displayPos.sub(this.react.startPos).length();

      this.react.active = dist >= PageBoxSelection.MIN_DISTANCE;

      if (!this.react.active) return;
    }

    this.react.endPos = new Vec2(displayPos);
  }.bind(this);

  private _pointerUp = function (this: PageBoxSelection, event: PointerEvent) {
    this.react.active = false;

    // TO DO
  }.bind(this);
}

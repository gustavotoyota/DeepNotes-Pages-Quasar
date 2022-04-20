import { listenPointerEvents } from 'src/boot/static/dom';
import { Vec2 } from 'src/boot/static/vec2';
import { refProp } from 'src/boot/static/vue';
import { UnwrapRef } from 'vue';
import { AppPage } from '../page';
import { PageNote } from './note';

export interface IDraggingReact {
  active: boolean;

  startPos: Vec2;
  currentPos: Vec2;

  dropRegionId?: string | null;
  dropIndex?: number | null;
}

export class PageDragging {
  static readonly MIN_DISTANCE = 5;

  page: AppPage;

  react: UnwrapRef<IDraggingReact>;

  constructor(page: AppPage) {
    this.page = page;

    this.react = refProp<IDraggingReact>(this, 'react', {
      active: false,

      startPos: new Vec2(),
      currentPos: new Vec2(),
    });
  }

  start(event: PointerEvent) {
    // Prevent dragging unmovable notes

    if (
      this.page.activeElem.react.elem instanceof PageNote &&
      !this.page.activeElem.react.elem.collab.movable
    )
      return;

    this.react = {
      active: false,

      startPos: this.page.pos.eventToClient(event),
      currentPos: this.page.pos.eventToClient(event),
    };

    listenPointerEvents(event, {
      move: this._update,
      up: this._finish,
    });
  }

  private _update = function (this: PageDragging, event: PointerEvent) {
    const clientPos = this.page.pos.eventToClient(event);
    //const worldPos = this.page.pos.clientToWorld(clientPos);

    if (!this.react.active) {
      const dist = clientPos.sub(this.react.startPos).length();

      this.react.active = dist >= PageDragging.MIN_DISTANCE;

      if (!this.react.active) {
        return;
      }

      // Update dragging states

      for (const selectedNote of this.page.selection.react.notes) {
        selectedNote.react.dragging = true;
      }
    }

    // Calculate delta

    const delta = clientPos
      .sub(this.react.currentPos)
      .divScalar(this.page.camera.react.zoom);

    // Move selected notes

    this.page.collab.doc.transact(() => {
      for (const note of this.page.selection.react.notes) {
        if (!note.collab.movable) continue;

        note.collab.pos.x += delta.x;
        note.collab.pos.y += delta.y;
      }
    });

    this.react.currentPos = clientPos;
  }.bind(this);

  private _finish = function (this: PageDragging) {
    this.react.active = false;

    for (const selectedNote of this.page.selection.react.notes) {
      selectedNote.react.dragging = false;
    }

    //this.page.undoRedo.resetCapturing()
  }.bind(this);

  cancel = () => {
    this._finish();

    document.removeEventListener('pointermove', this._update);
    document.removeEventListener('pointerup', this._finish);
  };
}

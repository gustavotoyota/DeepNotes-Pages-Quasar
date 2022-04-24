import { getYjsValue, Y } from '@syncedstore/core';
import { Factory } from 'src/boot/static/composition-root';
import { listenPointerEvents } from 'src/boot/static/dom';
import { Rect } from 'src/boot/static/rect';
import { Vec2 } from 'src/boot/static/vec2';
import { refProp } from 'src/boot/static/vue';
import {
  nextTick,
  reactive,
  shallowReactive,
  ShallowReactive,
  UnwrapRef,
} from 'vue';
import { AppPage } from '../page';
import { INoteCollab, NoteSide, NoteSection, PageNote } from './note';

export interface IResizingReact {
  active: boolean;

  ghosts: ShallowReactive<PageNote[]>;
}

export class PageResizing {
  factory: Factory;

  page: AppPage;

  react: UnwrapRef<IResizingReact>;

  side!: NoteSide;
  section!: NoteSection | null;
  activeGhost!: PageNote;

  constructor(factory: Factory, page: AppPage) {
    this.factory = factory;

    this.page = page;

    this.react = refProp<IResizingReact>(this, 'react', {
      active: false,

      ghosts: shallowReactive([]),
    });
  }

  start(
    event: PointerEvent,
    note: PageNote,
    side: NoteSide,
    section?: NoteSection | null
  ) {
    this.react = {
      active: true,

      ghosts: [],
    };

    this.page.activeElem.set(note);

    this.side = side;
    this.section = section ?? null;

    let nextZIndex = this.page.react.collab.nextZIndex;

    for (const note of this.page.selection.react.notes) {
      note.react.resizing = true;

      const collab = (
        getYjsValue(note.collab) as Y.Map<any>
      ).toJSON() as INoteCollab;

      collab.head.value = note.collab.head.value.toDelta();
      collab.body.value = note.collab.body.value.toDelta();

      collab.anchor = new Vec2();

      const frameRect = note.getWorldRect('note-frame');

      collab.pos = frameRect.topLeft;

      collab.width[note.react.sizeProp] = `${frameRect.size.x}px`;

      if (section != null && collab[section].enabled) {
        const sectionRect = note.getWorldRect(`note-${section}-section`);

        collab[section].height[note.react.sizeProp] = `${sectionRect.size.y}px`;
      }

      collab.zIndex = nextZIndex++;

      const ghost = this.factory.makeNote(
        this.page,
        note.id,
        null,
        reactive(collab)
      );

      ghost.react.selected = true;
      ghost.react.ghost = true;

      if (this.page.activeElem.is(note.id)) {
        this.activeGhost = ghost;

        ghost.react.active = true;
      }

      this.react.ghosts.push(ghost);
    }

    this.activeGhost.collab.zIndex = nextZIndex++;

    nextTick(() => {
      listenPointerEvents(event, {
        move: this._update,
        up: this._finish,
      });
    });
  }

  private _update = function (this: PageResizing, event: PointerEvent) {
    const worldPos = this.page.pos.eventToWorld(event);

    const oldWorldRect = this._getWorldRect(this.activeGhost);

    const newWorldRect = new Rect(oldWorldRect);

    if (this.side.includes('w')) {
      if (event.shiftKey) {
        newWorldRect.bottomRight.x =
          oldWorldRect.center.x + oldWorldRect.center.x - worldPos.x;
      }

      newWorldRect.topLeft.x = worldPos.x;
    }
    if (this.side.includes('n')) {
      if (event.shiftKey) {
        newWorldRect.bottomRight.y =
          oldWorldRect.center.y + oldWorldRect.center.y - worldPos.y;
      }

      newWorldRect.topLeft.y = worldPos.y;
    }
    if (this.side.includes('e')) {
      if (event.shiftKey) {
        newWorldRect.topLeft.x =
          oldWorldRect.center.x + oldWorldRect.center.x - worldPos.x;
      }

      newWorldRect.bottomRight.x = worldPos.x;
    }
    if (this.side.includes('s')) {
      if (event.shiftKey) {
        newWorldRect.topLeft.y =
          oldWorldRect.center.y + oldWorldRect.center.y - worldPos.y;
      }

      newWorldRect.bottomRight.y = worldPos.y;
    }

    const posDelta = newWorldRect.topLeft.sub(oldWorldRect.topLeft);

    for (const ghost of this.react.ghosts) {
      const note = this.page.notes.fromId(ghost.id);

      if (note == null) {
        continue;
      }

      const worldRect = this._getWorldRect(note);

      if (newWorldRect.size.x !== oldWorldRect.size.x) {
        ghost.collab.width[ghost.react.sizeProp] = `${newWorldRect.size.x}px`;
      }

      if (this.section != null && newWorldRect.size.y !== oldWorldRect.size.y) {
        ghost.collab[this.section].height[
          ghost.react.sizeProp
        ] = `${newWorldRect.size.y}px`;
      }

      ghost.collab.pos.x = worldRect.topLeft.x + posDelta.x;

      if (this.section === ghost.react.topSection) {
        ghost.collab.pos.y = worldRect.topLeft.y + posDelta.y;
      }
    }
  }.bind(this);

  private _finish = function (this: PageResizing) {
    for (const ghost of this.react.ghosts) {
      const note = this.page.notes.fromId(ghost.id);

      if (note == null) {
        continue;
      }

      note.collab.width[note.react.sizeProp] =
        ghost.collab.width[ghost.react.sizeProp];

      if (this.section != null) {
        note.collab[this.section].height[note.react.sizeProp] =
          ghost.collab[this.section].height[ghost.react.sizeProp];
      }

      const worldRect = ghost.react.worldRect;

      note.collab.pos = worldRect.topLeft.vecLerp(
        worldRect.bottomRight,
        new Vec2(note.collab.anchor)
      );

      note.react.resizing = false;
    }

    this.react.active = false;
  }.bind(this);

  private _getWorldRect(note: PageNote) {
    const noteFrame = note.getWorldRect('note-frame');

    let verticalRect;
    if (this.section != null && note.collab[this.section].enabled) {
      verticalRect = note.getWorldRect(`note-${this.section}-section`);
    } else {
      verticalRect = noteFrame;
    }

    return new Rect(
      new Vec2(noteFrame.topLeft.x, verticalRect.topLeft.y),
      new Vec2(noteFrame.bottomRight.x, verticalRect.bottomRight.y)
    );
  }
}

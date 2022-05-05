import { getYjsValue, Y } from '@syncedstore/core';
import { Factory } from 'src/code/static/composition-root';
import { listenPointerEvents } from 'src/code/static/dom';
import { Rect } from 'src/code/static/rect';
import { Vec2 } from 'src/code/static/vec2';
import { refProp } from 'src/code/static/vue';
import {
  nextTick,
  reactive,
  shallowReactive,
  ShallowReactive,
  UnwrapRef,
} from 'vue';
import { z } from 'zod';
import { AppPage } from '../page';
import { NoteSide, NoteSection, PageNote, INoteCollab } from './note';

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
      ).toJSON() as z.output<typeof INoteCollab>;

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
    if (!(this.page.activeElem.react.elem instanceof PageNote)) {
      return;
    }

    const worldPos = this.page.pos.eventToWorld(event);

    const oldSectionRect = this._getSectionRect(
      this.page.activeElem.react.elem
    );

    const newSectionRect = new Rect(oldSectionRect);

    if (this.side.includes('w')) {
      newSectionRect.topLeft.x = worldPos.x;
    }
    if (this.side.includes('n')) {
      newSectionRect.topLeft.y = worldPos.y;
    }
    if (this.side.includes('e')) {
      newSectionRect.bottomRight.x = worldPos.x;
    }
    if (this.side.includes('s')) {
      newSectionRect.bottomRight.y = worldPos.y;
    }

    if (event.ctrlKey) {
      if (this.side.includes('w')) {
        newSectionRect.bottomRight.x =
          oldSectionRect.center.x + oldSectionRect.center.x - worldPos.x;
      }
      if (this.side.includes('n')) {
        newSectionRect.bottomRight.y =
          oldSectionRect.center.y + oldSectionRect.center.y - worldPos.y;
      }
      if (this.side.includes('e')) {
        newSectionRect.topLeft.x =
          oldSectionRect.center.x + oldSectionRect.center.x - worldPos.x;
      }
      if (this.side.includes('s')) {
        newSectionRect.topLeft.y =
          oldSectionRect.center.y + oldSectionRect.center.y - worldPos.y;
      }
    }

    const posDelta = newSectionRect.topLeft.sub(oldSectionRect.topLeft);

    for (const ghost of this.react.ghosts) {
      const note = this.page.notes.fromId(ghost.id);

      if (note == null) {
        continue;
      }

      ghost.collab.width[ghost.react.sizeProp] = `${newSectionRect.size.x}px`;

      if (this.section != null) {
        ghost.collab[this.section].height[
          ghost.react.sizeProp
        ] = `${newSectionRect.size.y}px`;
      }

      const frameRect = note.getWorldRect('note-frame');

      ghost.collab.pos.x = frameRect.topLeft.x + posDelta.x;
      ghost.collab.pos.y = frameRect.topLeft.y + posDelta.y;
    }
  }.bind(this);

  private _finish = function (this: PageResizing) {
    for (const ghost of this.react.ghosts) {
      const note = this.page.notes.fromId(ghost.id);

      if (note == null) {
        continue;
      }

      if (this.side.includes('w') || this.side.includes('e')) {
        note.collab.width[note.react.sizeProp] =
          ghost.collab.width[ghost.react.sizeProp];
      }

      if (
        this.section != null &&
        (this.side.includes('n') || this.side.includes('s'))
      ) {
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

  private _getSectionRect(note: PageNote) {
    const frameRect = note.getWorldRect('note-frame');

    let verticalRect;
    if (this.section != null && note.collab[this.section].enabled) {
      verticalRect = note.getWorldRect(`note-${this.section}-section`);
    } else {
      verticalRect = frameRect;
    }

    return new Rect(
      new Vec2(frameRect.topLeft.x, verticalRect.topLeft.y),
      new Vec2(frameRect.bottomRight.x, verticalRect.bottomRight.y)
    );
  }
}

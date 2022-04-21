import { Rect } from 'src/boot/static/rect';
import { Vec2 } from 'src/boot/static/vec2';
import { AppPage } from '../page';
import { IRegionCollab } from './region';

export class PageRegions {
  page: AppPage;

  constructor(page: AppPage) {
    this.page = page;
  }

  getWorldRect(collab: IRegionCollab) {
    const worldRect = new Rect(
      new Vec2(Infinity, Infinity),
      new Vec2(-Infinity, -Infinity)
    );

    for (const noteId of collab.noteIds) {
      const note = this.page.notes.fromId(noteId);

      if (note == null) {
        continue;
      }

      worldRect.topLeft.x = Math.min(
        worldRect.topLeft.x,
        note.react.worldRect.topLeft.x
      );
      worldRect.topLeft.y = Math.min(
        worldRect.topLeft.y,
        note.react.worldRect.topLeft.y
      );

      worldRect.bottomRight.x = Math.max(
        worldRect.bottomRight.x,
        note.react.worldRect.bottomRight.x
      );
      worldRect.bottomRight.y = Math.max(
        worldRect.bottomRight.y,
        note.react.worldRect.bottomRight.y
      );
    }

    return worldRect;
  }
}
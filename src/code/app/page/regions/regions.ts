import { Rect } from 'src/code/static/rect';
import { Vec2 } from 'src/code/static/vec2';
import { z } from 'zod';

import { AppPage } from '../page';
import { IRegionCollab } from './region';

export class PageRegions {
  page: AppPage;

  constructor(page: AppPage) {
    this.page = page;
  }

  getWorldRect(collab: z.output<typeof IRegionCollab>) {
    const worldRect = new Rect(
      new Vec2(Infinity, Infinity),
      new Vec2(-Infinity, -Infinity)
    );

    const notes = this.page.notes.fromIds(collab.noteIds);

    if (notes.length === 0) {
      return new Rect(this.page.camera.react.pos, this.page.camera.react.pos);
    }

    for (const note of notes) {
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

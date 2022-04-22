import { Vec2 } from 'src/boot/static/vec2';
import { refProp } from 'src/boot/static/vue';
import { computed, UnwrapRef, watchEffect, WritableComputedRef } from 'vue';
import { AppPage } from '../page';
import { IRegionCollab } from '../regions/region';

export interface ICameraReact {
  pos: Vec2;

  _zoom: number;
  zoom: WritableComputedRef<number>;

  lockPos: boolean;
  lockZoom: boolean;
}

export class PageCamera {
  readonly page: AppPage;

  react: UnwrapRef<ICameraReact>;

  constructor(page: AppPage) {
    this.page = page;

    this.react = refProp<ICameraReact>(this, 'react', {
      pos: new Vec2(),

      _zoom: 1,
      zoom: computed({
        get: () => this.react._zoom,
        set: (value) => {
          if (this.react.lockZoom) return;

          this.react._zoom = value;
        },
      }),

      lockPos: false,
      lockZoom: false,
    });

    watchEffect(() => {
      if (!(this.page.id in __DEEP_NOTES__.pages)) {
        __DEEP_NOTES__.pages[this.page.id] = {};
      }

      __DEEP_NOTES__.pages[this.page.id].zoom = this.react.zoom;
    });
  }

  resetZoom() {
    this.react.zoom = 1;
  }

  fitToScreen() {
    let regionCollab: IRegionCollab;

    if (this.page.selection.react.notes.length > 0) {
      regionCollab = this.page.selection.react;
    } else {
      regionCollab = this.page.react;
    }

    if (regionCollab.noteIds.length === 0) {
      this.react.pos = new Vec2();
      this.resetZoom();
      return;
    }

    const worldRect = this.page.regions.getWorldRect(regionCollab);

    if (!this.react.lockPos) {
      this.react.pos = worldRect.center;
    }

    const displayRect = this.page.rects.fromDisplay();

    this.react.zoom = Math.min(
      (Math.min(70, displayRect.size.x / 4) - displayRect.size.x / 2) /
        (worldRect.topLeft.x - this.react.pos.x),
      (Math.min(35, displayRect.size.y / 4) - displayRect.size.y / 2) /
        (worldRect.topLeft.y - this.react.pos.y)
    );

    this.react.zoom = Math.min(this.react.zoom, 1);
  }
}

import { IVec2, Vec2 } from 'src/boot/static/vec2';
import { refProp } from 'src/boot/static/vue';
import { computed, UnwrapRef, watchEffect, WritableComputedRef } from 'vue';
import { AppPage } from '../page';

export interface IPageCameraReact {
  pos: IVec2;

  _zoom: number;
  zoom: WritableComputedRef<number>;

  lockPos: boolean;
  lockZoom: boolean;
}

export class PageCamera {
  readonly page: AppPage;

  react: UnwrapRef<IPageCameraReact>;

  constructor(page: AppPage) {
    this.page = page;

    this.react = refProp<IPageCameraReact>(this, 'react', {
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
    this.react._zoom = 1;
  }

  fitToScreen() {
    //
  }
}

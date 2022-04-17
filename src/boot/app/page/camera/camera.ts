import { IVec2, Vec2 } from 'src/boot/static/vec2';
import { computed, reactive } from 'vue';
import { AppPage } from '../page';

export class PageCamera {
  page: AppPage;

  react: {
    pos: IVec2;

    _zoom: number;
    zoom: number;

    lockPos: boolean;
    lockZoom: boolean;
  };

  constructor(page: AppPage) {
    this.page = page;

    this.react = reactive({
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
  }

  resetZoom() {
    this.react._zoom = 1;
  }
}

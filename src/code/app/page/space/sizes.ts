import { Vec2 } from 'src/code/static/vec2';

import { AppPage } from '../page';

export class PageSizes {
  readonly page: AppPage;

  get camera() {
    return this.page.camera;
  }

  constructor(page: AppPage) {
    this.page = page;
  }

  screenToWorld1D(screenSize: number): number {
    return screenSize / this.camera.react.zoom;
  }
  worldToScreen1D(worldSize: number): number {
    return worldSize * this.camera.react.zoom;
  }

  screenToWorld2D(screenSize: Vec2): Vec2 {
    return new Vec2(
      this.screenToWorld1D(screenSize.x),
      this.screenToWorld1D(screenSize.y)
    );
  }
  worldToScreen2D(worldSize: Vec2): Vec2 {
    return new Vec2(
      this.worldToScreen1D(worldSize.x),
      this.worldToScreen1D(worldSize.y)
    );
  }
}

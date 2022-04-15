import { Vec2 } from 'src/boot/static/vec2';
import { PageCamera } from '../camera/camera';

export class PageSizes {
  camera: PageCamera;

  constructor(camera: PageCamera) {
    this.camera = camera;
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

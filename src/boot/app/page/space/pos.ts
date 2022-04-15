import { Vec2 } from 'src/boot/static/vec2';
import { PageCamera } from '../camera/camera';
import { PageRects } from './rects';

export class PagePos {
  rects: PageRects;
  camera: PageCamera;

  constructor(rects: PageRects, camera: PageCamera) {
    this.rects = rects;
    this.camera = camera;
  }

  clientFromEvent(event: MouseEvent): Vec2 {
    return new Vec2(event.x, event.y);
  }

  clientToDisplay(clientPos: Vec2): Vec2 {
    const displayRect = this.rects.fromDisplay();

    return clientPos.sub(displayRect.topLeft);
  }
  displayToClient(displayPos: Vec2): Vec2 {
    const displayRect = this.rects.fromDisplay();

    return displayPos.add(displayRect.topLeft);
  }

  displayToWorld(displayPos: Vec2): Vec2 {
    const displayRect = this.rects.fromDisplay();

    return new Vec2(
      this.camera.react.pos.x +
        (displayPos.x - displayRect.size.x / 2) / this.camera.react.zoom,
      this.camera.react.pos.y +
        (displayPos.y - displayRect.size.y / 2) / this.camera.react.zoom
    );
  }
  worldToDisplay(worldPos: Vec2): Vec2 {
    const displayRect = this.rects.fromDisplay();

    return new Vec2(
      displayRect.size.x / 2 +
        (worldPos.x - this.camera.react.pos.x) * this.camera.react.zoom,
      displayRect.size.y / 2 +
        (worldPos.y - this.camera.react.pos.y) * this.camera.react.zoom
    );
  }

  clientToWorld(clientPos: Vec2): Vec2 {
    return this.displayToWorld(this.clientToDisplay(clientPos));
  }
  worldToClient(worldPos: Vec2): Vec2 {
    return this.displayToClient(this.worldToDisplay(worldPos));
  }
}
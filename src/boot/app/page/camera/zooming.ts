import { hasVertScrollbar } from 'src/boot/static/dom';
import { AppPage } from '../page';

export class PageZooming {
  readonly page: AppPage;

  constructor(page: AppPage) {
    this.page = page;
  }

  perform(event: WheelEvent) {
    // Skip if already handled by a scrollbar

    if (event.altKey) event.preventDefault();
    else {
      let node = event.target as Node | null;

      while (node != null) {
        if (hasVertScrollbar(node as HTMLElement)) return;

        node = node.parentNode;
      }
    }

    // Apply zoom

    const multiplier = event.deltaY > 0 ? 1 / 1.2 : 1.2;

    this.page.camera.react.zoom = this.page.camera.react.zoom * multiplier;
  }
}

import { AxiosInstance } from 'axios';
import { Container } from '../static/simple-di';
import { App } from './app';
import { PageArrows } from './page/arrows/arrows';
import { PageCamera } from './page/camera/camera';
import { PagePanning } from './page/camera/panning';
import { PageElems } from './page/elems/elems';
import { PageNotes } from './page/notes/notes';
import { Page } from './page/page';
import { PageActiveElem } from './page/selection/active-elem';
import { PageActiveRegion } from './page/selection/active-region';
import { PageSelection } from './page/selection/selection';
import { PagePos } from './page/space/pos';
import { PageRects } from './page/space/rects';
import { PageSizes } from './page/space/sizes';

export const container = new Container({
  app: () => () => new App(),

  page: (factory: any) => (id: string, axios: AxiosInstance) =>
    new Page(factory, id, axios),

  camera: () => (page: Page) => new PageCamera(page),
  panning: () => (page: Page) => new PagePanning(page),

  elems: () => (notes: PageNotes, arrows: PageArrows) =>
    new PageElems(notes, arrows),
  notes: () => () => new PageNotes(),
  arrows: () => () => new PageArrows(),

  activeElem: () => () => new PageActiveElem(),
  activeRegion: () => (page: Page) => new PageActiveRegion(page),
  selection: () => (elems: PageElems) => new PageSelection(elems),

  pos: () => (rects: PageRects, camera: PageCamera) => {
    return new PagePos(rects, camera);
  },
  rects: () => (pos: PagePos) => new PageRects(pos),
  sizes: () => (camera: PageCamera) => new PageSizes(camera),
});

export const factory = container.factory;
export type Factory = typeof factory;

export const dependencies = container.dependencies;
export type Dependencies = typeof dependencies;

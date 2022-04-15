import { AxiosInstance } from 'axios';
import { Container } from '../static/simple-di';
import { App } from './app';
import { PageArrows } from './page/arrows/arrows';
import { PageCamera } from './page/camera/camera';
import { PageElems } from './page/elems/elems';
import { PageNotes } from './page/notes/notes';
import { Page } from './page/page';
import { PageActiveElem } from './page/selection/active-elem';
import { PageSelection } from './page/selection/selection';
import { PagePos } from './page/space/pos';
import { PageRects } from './page/space/rects';
import { PageSizes } from './page/space/sizes';

export const container = new Container({
  app: () => () => new App(),

  page: (factory: any) => (params: { id: string; axios: AxiosInstance }) =>
    new Page(factory, params),

  camera: () => (axios: AxiosInstance) => new PageCamera(axios),

  elems: (factory: any) => () => new PageElems(factory),
  notes: () => () => new PageNotes(),
  arrows: () => () => new PageArrows(),

  activeElem: () => () => new PageActiveElem(),
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

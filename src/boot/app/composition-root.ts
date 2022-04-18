import { Container } from '../static/simple-di';
import { DeepNotesApp } from './app';
import { PageArrows } from './page/arrows/arrows';
import { PageCamera } from './page/camera/camera';
import { PagePanning } from './page/camera/panning';
import { PageZooming } from './page/camera/zooming';
import { PageElems } from './page/elems/elems';
import { INoteCollab, PageNote } from './page/notes/note';
import { PageNotes } from './page/notes/notes';
import { AppPage } from './page/page';
import { PageActiveElem } from './page/selection/active-elem';
import { PageActiveRegion } from './page/selection/active-region';
import { PageBoxSelection } from './page/selection/box-selection';
import { PageSelection } from './page/selection/selection';
import { PagePos } from './page/space/pos';
import { PageRects } from './page/space/rects';
import { PageSizes } from './page/space/sizes';
import { AppSerialization } from './serialization';

export const container = new Container({
  app: (factory: any) => () => new DeepNotesApp(factory),

  serialization: () => (app: DeepNotesApp) => new AppSerialization(app),

  page: (factory: any) => (app: DeepNotesApp, id: string) =>
    new AppPage(factory, app, id),

  camera: () => (page: AppPage) => new PageCamera(page),
  panning: () => (page: AppPage) => new PagePanning(page),
  zooming: () => (page: AppPage) => new PageZooming(page),

  notes: () => () => new PageNotes(),
  note:
    () =>
    (page: AppPage, id: string, parentId: string | null, collab: INoteCollab) =>
      new PageNote(page, id, parentId, collab),

  arrows: () => () => new PageArrows(),
  elems: () => (page: AppPage) => new PageElems(page),

  selection: () => (page: AppPage) => new PageSelection(page),
  activeElem: () => (page: AppPage) => new PageActiveElem(page),
  activeRegion: () => (page: AppPage) => new PageActiveRegion(page),
  boxSelection: () => (page: AppPage) => new PageBoxSelection(page),

  pos: () => (page: AppPage) => new PagePos(page),
  rects: () => (page: AppPage) => new PageRects(page),
  sizes: () => (page: AppPage) => new PageSizes(page),
});

export const factory = container.factory;
export type Factory = typeof factory;

export const dependencies = container.dependencies;
export type Dependencies = typeof dependencies;

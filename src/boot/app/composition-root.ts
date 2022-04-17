import { Container } from '../static/simple-di';
import { DeepNotesApp } from './app';
import { PageArrows } from './page/arrows/arrows';
import { PageCamera } from './page/camera/camera';
import { PagePanning } from './page/camera/panning';
import { PageElems } from './page/elems/elems';
import { INoteCollab, PageNote } from './page/notes/note';
import { PageNotes } from './page/notes/notes';
import { Page } from './page/page';
import { PageActiveElem } from './page/selection/active-elem';
import { PageActiveRegion } from './page/selection/active-region';
import { PageSelection } from './page/selection/selection';
import { PagePos } from './page/space/pos';
import { PageRects } from './page/space/rects';
import { PageSizes } from './page/space/sizes';
import { AppSerialization } from './serialization';

export const container = new Container({
  app: (factory: any) => () => new DeepNotesApp(factory),

  serialization: () => (app: DeepNotesApp) => new AppSerialization(app),

  page: (factory: any) => (app: DeepNotesApp, id: string) =>
    new Page(factory, app, id),

  camera: () => (page: Page) => new PageCamera(page),
  panning: () => (page: Page) => new PagePanning(page),

  notes: () => () => new PageNotes(),
  note:
    () =>
    (page: Page, id: string, parent: PageNote | null, collab: INoteCollab) =>
      new PageNote(page, id, parent, collab),

  arrows: () => () => new PageArrows(),
  elems: () => (page: Page) => new PageElems(page),

  activeElem: () => (page: Page) => new PageActiveElem(page),
  activeRegion: () => (page: Page) => new PageActiveRegion(page),
  selection: () => (page: Page) => new PageSelection(page),

  pos: () => (page: Page) => new PagePos(page),
  rects: () => (page: Page) => new PageRects(page),
  sizes: () => (page: Page) => new PageSizes(page),
});

export const factory = container.factory;
export type Factory = typeof factory;

export const dependencies = container.dependencies;
export type Dependencies = typeof dependencies;

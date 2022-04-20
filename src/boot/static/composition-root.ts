import { Container } from './simple-di';
import { DeepNotesApp } from '../app/app';
import { PageArrows } from '../app/page/arrows/arrows';
import { PageCamera } from '../app/page/camera/camera';
import { PagePanning } from '../app/page/camera/panning';
import { PageZooming } from '../app/page/camera/zooming';
import { PageElems } from '../app/page/elems/elems';
import { INoteCollab, PageNote } from '../app/page/notes/note';
import { PageNotes } from '../app/page/notes/notes';
import { AppPage } from '../app/page/page';
import { PageActiveElem } from '../app/page/selection/active-elem';
import { PageActiveRegion } from '../app/page/selection/active-region';
import { PageBoxSelection } from '../app/page/selection/box-selection';
import { PageSelection } from '../app/page/selection/selection';
import { PagePos } from '../app/page/space/pos';
import { PageRects } from '../app/page/space/rects';
import { PageSizes } from '../app/page/space/sizes';
import { AppSerialization } from '../app/serialization';
import { PageCollab } from '../app/page/collab';
import { IArrowCollab, PageArrow } from '../app/page/arrows/arrow';
import { PageEditing } from '../app/page/notes/editing';
import { PageClickSelection } from '../app/page/selection/click-selection';

export const container = new Container({
  app: (factory: any) => () => new DeepNotesApp(factory),

  serialization: () => (app: DeepNotesApp) => new AppSerialization(app),

  page: (factory: any) => (app: DeepNotesApp, id: string) =>
    new AppPage(factory, app, id),

  collab: () => (page: AppPage) => new PageCollab(page),

  camera: () => (page: AppPage) => new PageCamera(page),
  panning: () => (page: AppPage) => new PagePanning(page),
  zooming: () => (page: AppPage) => new PageZooming(page),

  elems: () => (page: AppPage) => new PageElems(page),

  notes: (factory: any) => (page: AppPage) => new PageNotes(factory, page),
  note:
    () =>
    (page: AppPage, id: string, parentId: string | null, collab: INoteCollab) =>
      new PageNote(page, id, parentId, collab),
  editing: () => (page: AppPage) => new PageEditing(page),

  arrows: (factory: any) => (page: AppPage) => new PageArrows(factory, page),
  arrow:
    () =>
    (
      page: AppPage,
      id: string,
      parentId: string | null,
      collab: IArrowCollab
    ) =>
      new PageArrow(page, id, parentId, collab),

  selection: () => (page: AppPage) => new PageSelection(page),
  activeElem: () => (page: AppPage) => new PageActiveElem(page),
  activeRegion: () => (page: AppPage) => new PageActiveRegion(page),
  clickSelection: () => (page: AppPage) => new PageClickSelection(page),
  boxSelection: () => (page: AppPage) => new PageBoxSelection(page),

  pos: () => (page: AppPage) => new PagePos(page),
  rects: () => (page: AppPage) => new PageRects(page),
  sizes: () => (page: AppPage) => new PageSizes(page),
});

export const factory = container.factory;
export type Factory = typeof factory;

export const dependencies = container.dependencies;
export type Dependencies = typeof dependencies;

import { IVec2 } from 'src/code/static/vec2';
import { z } from 'zod';
import { ElemType, PageElem } from '../elems/elem';
import { AppPage } from '../page';

export const IArrowEndpoint = z.object({
  noteId: z.string().nullable().default(null),
  pos: IVec2.default({ x: 0, y: 0 }),
});
export type IArrowEndpoint = z.output<typeof IArrowEndpoint>;

export const IArrowCollab = z.object({
  start: IArrowEndpoint,
  end: IArrowEndpoint,
});
export type IArrowCollab = z.output<typeof IArrowCollab>;

export class PageArrow extends PageElem {
  collab: IArrowCollab;

  constructor(
    page: AppPage,
    id: string,
    parentId: string | null,
    collab: IArrowCollab
  ) {
    super(page, id, ElemType.ARROW, parentId);

    this.collab = collab;
  }
}

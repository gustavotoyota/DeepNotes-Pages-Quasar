import { IVec2 } from 'src/boot/static/vec2';
import { z } from 'zod';
import { ElemType, PageElem } from '../elems/elem';
import { AppPage } from '../page';

export const IArrowEndpoint = z.object({
  noteId: z.string().optional(),
  pos: IVec2.optional(),
});
export type IArrowEndpoint = z.infer<typeof IArrowEndpoint>;

export const IArrowCollab = z.object({
  start: IArrowEndpoint,
  end: IArrowEndpoint,
});
export type IArrowCollab = z.infer<typeof IArrowCollab>;

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

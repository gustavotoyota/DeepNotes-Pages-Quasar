import { IVec2 } from 'src/boot/static/vec2';
import { z } from 'zod';
import { ElemType, PageElem } from '../elems/elems';
import { AppPage } from '../page';

export const IArrowEndpoint = z.object({
  arrowId: z.string().nullable().default(null),
  pos: IVec2.default({ x: 0, y: 0 }),
});
export type IArrowEndpoint = z.infer<typeof IArrowEndpoint>;

export const IArrowCollab = z.object({
  start: IArrowEndpoint.default({}),
  end: IArrowEndpoint.default({}),
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

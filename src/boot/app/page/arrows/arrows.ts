import { IVec2 } from 'src/boot/static/vec2';
import { refProp } from 'src/boot/static/vue';
import { UnwrapNestedRefs } from 'vue';
import { z } from 'zod';
import { ElemType, PageElem } from '../elems/elems';
import { AppPage } from '../page';

export const IArrowEndpoint = z.object({
  noteId: z.string().nullable().default(null),
  pos: IVec2.default({ x: 0, y: 0 }),
});
export type IArrowEndpoint = z.infer<typeof IArrowEndpoint>;

export const IArrowCollab = z.object({
  start: IArrowEndpoint.default({}),
  end: IArrowEndpoint.default({}),
});
export type IArrowCollab = z.infer<typeof IArrowCollab>;

export interface IPageArrowsReact {
  map: Record<string, PageArrow>;
}

export class PageArrows {
  react!: UnwrapNestedRefs<IPageArrowsReact>;

  constructor() {
    refProp<IPageArrowsReact>(this, 'react', {
      map: {},
    });
  }
}

export class PageArrow extends PageElem {
  constructor(page: AppPage, id: string, parentId: string | null) {
    super(page, id, ElemType.ARROW, parentId);
  }
}

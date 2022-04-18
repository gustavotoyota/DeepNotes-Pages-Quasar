import { ComputedRef, UnwrapRef } from 'vue';
import { z } from 'zod';
import { PageArrow } from '../arrows/arrow';
import { IElemReact, PageElem } from '../elems/elems';
import { PageNote } from '../notes/note';

export const IRegionCollab = z.object({
  noteIds: z.string().array().optional(),
  arrowIds: z.string().array().optional(),
});
export type IRegionCollab = z.infer<typeof IRegionCollab>;

export interface IRegionReact extends IElemReact {
  noteIds: ComputedRef<string[]>;
  arrowIds: ComputedRef<string[]>;

  notes: ComputedRef<PageNote[]>;
  arrows: ComputedRef<PageArrow[]>;
}

export class PageRegion extends PageElem {
  declare react: UnwrapRef<IRegionReact>;
}

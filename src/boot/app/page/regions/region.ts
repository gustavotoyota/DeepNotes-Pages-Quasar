import { ComputedRef, UnwrapRef } from 'vue';
import { z } from 'zod';
import { PageArrow } from '../arrows/arrow';
import { IElemReact, PageElem } from '../elems/elem';
import { PageNote } from '../notes/note';

export const IRegionCollab = z.object({
  noteIds: z.string().array().default([]),
  arrowIds: z.string().array().default([]),
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

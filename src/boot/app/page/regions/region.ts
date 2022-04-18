import { ComputedRef } from 'vue';
import { z } from 'zod';
import { PageArrow } from '../arrows/arrow';
import { PageNote } from '../notes/note';

export const IRegionCollab = z.object({
  noteIds: z.string().array().optional(),
  arrowIds: z.string().array().optional(),
});
export type IRegionCollab = z.infer<typeof IRegionCollab>;

export interface IRegionReact {
  noteIds: ComputedRef<string[]>;
  arrowIds: ComputedRef<string[]>;

  notes: ComputedRef<PageNote[]>;
  arrows: ComputedRef<PageArrow[]>;
}

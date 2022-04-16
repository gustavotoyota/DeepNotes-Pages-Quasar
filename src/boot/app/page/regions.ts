import { z } from 'zod';

export const IRegionCollab = z.object({
  noteIds: z.string().array().optional(),
  arrowIds: z.string().array().optional(),
});
export type IRegionCollab = z.infer<typeof IRegionCollab>;

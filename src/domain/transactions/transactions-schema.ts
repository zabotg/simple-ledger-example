import { z } from 'zod';

import { directionSchema } from '../accounts/accounts-schema';

const entrySchema = z.object({
  id: z.string().uuid().optional(),
  direction: directionSchema,
  amount: z.number().positive(),
  account_id: z.string().uuid()
});

export const createTransactionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  entries: z.array(entrySchema).min(2, 'At least two entries are required.')
});

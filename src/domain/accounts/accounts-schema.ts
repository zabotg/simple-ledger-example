import { z } from 'zod';

import { toCents } from '../../shared/utils/money';

export const directionSchema = z.enum(['debit', 'credit']);

export const createAccountSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  balance: z.number().nonnegative().optional().default(0).transform(toCents),
  direction: directionSchema,
});

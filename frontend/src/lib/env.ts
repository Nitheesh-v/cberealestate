import { z } from 'zod';
/** Validates public settings at the application boundary; secrets never belong here. */
const schema = z.object({
  apiUrl: z.union([z.url({ protocol: /^https?$/ }), z.literal('/api')]),
  appUrl: z.url({ protocol: /^https?$/ }),
  appName: z.string().trim().min(1),
});
export const publicEnv = schema.parse({
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
  appName: process.env.NEXT_PUBLIC_APP_NAME,
});

import z from 'zod';

const apiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

export function isApiError(error: unknown): error is ApiError {
  return apiErrorSchema.safeParse(error as ApiError).success;
}

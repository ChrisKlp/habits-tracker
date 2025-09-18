import z from 'zod';

const apiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
});

export type TApiError = z.infer<typeof apiErrorSchema>;

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError || apiErrorSchema.safeParse(error as TApiError).success;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly error: string;

  constructor(error: TApiError) {
    super(error.message);
    this.statusCode = error.statusCode;
    this.error = error.error;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

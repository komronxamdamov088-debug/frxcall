/**
 * `code` — frontend shu kod bo'yicha xabarni uz/ru tilida ko'rsatadi.
 */
export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message?: string
  ) {
    super(message ?? code);
  }
}

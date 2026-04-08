declare namespace Express {
  interface Request {
    userId?: string;
    params: Record<string, string>;
  }
}

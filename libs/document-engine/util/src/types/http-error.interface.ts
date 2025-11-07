export interface IHttpError {
  error: string;
  errorCode: string | null;
  statusCode: number;
  message: string;
  remark?: string | null;
}

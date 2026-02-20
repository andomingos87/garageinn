export type ActionErrorCode =
  | "forbidden"
  | "conflict"
  | "not_found"
  | "validation";

export interface ActionResult {
  error?: string;
  code?: ActionErrorCode;
  success?: boolean;
}

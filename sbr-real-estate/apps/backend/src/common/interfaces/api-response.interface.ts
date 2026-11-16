export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
export interface ResponseMeta {
  timestamp: string;
  pagination?: PaginationMeta;
}
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta: ResponseMeta;
}
export interface RequestUser {
  id: string;
  email?: string;
  roles: string[];
}

export type PaginationParams = {
  page?: number
  pageSize?: number
}

export type SortParams = {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export type SearchParams = {
  search?: string
}

export type QueryParams = PaginationParams & SortParams & SearchParams & {
  [key: string]: string | number | undefined
}

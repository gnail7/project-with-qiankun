/**
 * 博客公开数据接口（对应后端 /api/blog/public/*，无需登录）
 */
export interface Post {
  postId: number
  title: string
  slug?: string | null
  summary?: string
  content?: string
  cover?: string
  categoryId?: number | null
  categoryName?: string
  tagIds?: number[]
  status: string
  isTop: number
  viewCount: number
  wordCount: number
  publishedTime?: string | null
}

export interface PostPage {
  records: Post[]
  total: number
  pageNum: number
  pageSize: number
}

export interface Category {
  categoryId: number
  categoryName: string
}

export interface Tag {
  tagId: number
  tagName: string
}

interface Result<T> {
  code: number
  message: string
  data: T
}

export interface BlogPostQuery {
  pageNum?: number
  pageSize?: number
  categoryId?: number
  tagId?: number
  keyword?: string
}

export function useBlogApi() {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const unwrap = <T>(res: Result<T>): T => res?.data ?? (res as unknown as T)

  return {
    getPosts: (params: BlogPostQuery = {}) =>
      $fetch<Result<PostPage>>(`${base}/api/blog/public/posts`, { params }).then(unwrap),
    getPost: (id: number | string) =>
      $fetch<Result<Post>>(`${base}/api/blog/public/posts/${id}`).then(unwrap),
    getCategories: () =>
      $fetch<Result<Category[]>>(`${base}/api/blog/public/categories`).then(unwrap),
    getTags: () => $fetch<Result<Tag[]>>(`${base}/api/blog/public/tags`).then(unwrap),
  }
}

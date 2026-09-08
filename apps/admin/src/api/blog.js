import request from './request'

/* ---------- 分类 ---------- */
export function getBlogCategoryList() {
  return request.get('/blog/category/list')
}
export function createBlogCategory(data) {
  return request.post('/blog/category', data)
}
export function updateBlogCategory(id, data) {
  return request.put(`/blog/category/${id}`, data)
}
export function deleteBlogCategory(id) {
  return request.delete(`/blog/category/${id}`)
}

/* ---------- 标签 ---------- */
export function getBlogTagList() {
  return request.get('/blog/tag/list')
}
export function createBlogTag(data) {
  return request.post('/blog/tag', data)
}
export function updateBlogTag(id, data) {
  return request.put(`/blog/tag/${id}`, data)
}
export function deleteBlogTag(id) {
  return request.delete(`/blog/tag/${id}`)
}

/* ---------- 文章 ---------- */
export function getBlogPostPage(params) {
  return request.get('/blog/post/page', { params })
}
export function getBlogPost(id) {
  return request.get(`/blog/post/${id}`)
}
export function createBlogPost(data) {
  return request.post('/blog/post', data)
}
export function updateBlogPost(id, data) {
  return request.put(`/blog/post/${id}`, data)
}
export function deleteBlogPost(id) {
  return request.delete(`/blog/post/${id}`)
}

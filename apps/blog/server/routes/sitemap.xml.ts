export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase
  const site = config.public.siteUrl || 'http://localhost:3000'

  const [postsRes, catsRes] = await Promise.all([
    $fetch(`${base}/api/blog/public/posts`, { params: { pageNum: 1, pageSize: 500 } }),
    $fetch(`${base}/api/blog/public/categories`),
  ])

  const posts = postsRes?.data?.records || []
  const cats = catsRes?.data || []

  const urls = [
    `<url><loc>${site}/</loc></url>`,
    ...cats.map(c => `<url><loc>${site}/category/${c.categoryId}</loc></url>`),
    ...posts.map(
      p =>
        `<url><loc>${site}/posts/${p.postId}</loc>${p.publishedTime ? `<lastmod>${p.publishedTime}</lastmod>` : ''}</url>`,
    ),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return xml
})

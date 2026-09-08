export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase
  const site = config.public.siteUrl || 'http://localhost:3000'

  const res = await $fetch(`${base}/api/blog/public/posts`, {
    params: { pageNum: 1, pageSize: 50 },
  })
  const posts = res?.data?.records || []

  const items = posts
    .map(p => {
      const link = `${site}/posts/${p.postId}`
      const pubDate = p.publishedTime ? new Date(p.publishedTime).toUTCString() : ''
      return `
      <item>
        <title><![CDATA[${p.title || ''}]]></title>
        <link>${link}</link>
        <guid isPermaLink="true">${link}</guid>
        <pubDate>${pubDate}</pubDate>
        <description><![CDATA[${p.summary || ''}]]></description>
      </item>`.trim()
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Ziven Blog</title>
    <link>${site}</link>
    <description>一个简洁有设计感的个人博客</description>
    <language>zh-cn</language>
    ${items}
  </channel>
</rss>`

  setHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')
  return xml
})

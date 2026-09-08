import { d as defineEventHandler, s as setHeader, u as useRuntimeConfig } from '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const feed_xml = defineEventHandler(async (event) => {
  var _a;
  const config = useRuntimeConfig();
  const base = config.public.apiBase;
  const site = config.public.siteUrl || "http://localhost:3000";
  const res = await $fetch(`${base}/api/blog/public/posts`, { params: { pageNum: 1, pageSize: 50 } });
  const posts = ((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.records) || [];
  const items = posts.map((p) => {
    const link = `${site}/posts/${p.postId}`;
    const pubDate = p.publishedTime ? new Date(p.publishedTime).toUTCString() : "";
    return `
      <item>
        <title><![CDATA[${p.title || ""}]]></title>
        <link>${link}</link>
        <guid isPermaLink="true">${link}</guid>
        <pubDate>${pubDate}</pubDate>
        <description><![CDATA[${p.summary || ""}]]></description>
      </item>`.trim();
  }).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Ziven Blog</title>
    <link>${site}</link>
    <description>\u4E00\u4E2A\u7B80\u6D01\u6709\u8BBE\u8BA1\u611F\u7684\u4E2A\u4EBA\u535A\u5BA2</description>
    <language>zh-cn</language>
    ${items}
  </channel>
</rss>`;
  setHeader(event, "content-type", "application/rss+xml; charset=utf-8");
  return xml;
});

export { feed_xml as default };
//# sourceMappingURL=feed.xml.mjs.map

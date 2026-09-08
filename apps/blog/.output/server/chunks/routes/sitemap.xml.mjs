import { d as defineEventHandler, s as setHeader, u as useRuntimeConfig } from '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const sitemap_xml = defineEventHandler(async (event) => {
  var _a;
  const config = useRuntimeConfig();
  const base = config.public.apiBase;
  const site = config.public.siteUrl || "http://localhost:3000";
  const [postsRes, catsRes] = await Promise.all([
    $fetch(`${base}/api/blog/public/posts`, { params: { pageNum: 1, pageSize: 500 } }),
    $fetch(`${base}/api/blog/public/categories`)
  ]);
  const posts = ((_a = postsRes == null ? void 0 : postsRes.data) == null ? void 0 : _a.records) || [];
  const cats = (catsRes == null ? void 0 : catsRes.data) || [];
  const urls = [
    `<url><loc>${site}/</loc></url>`,
    ...cats.map((c) => `<url><loc>${site}/category/${c.categoryId}</loc></url>`),
    ...posts.map((p) => `<url><loc>${site}/posts/${p.postId}</loc>${p.publishedTime ? `<lastmod>${p.publishedTime}</lastmod>` : ""}</url>`)
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`;
  setHeader(event, "content-type", "application/xml; charset=utf-8");
  return xml;
});

export { sitemap_xml as default };
//# sourceMappingURL=sitemap.xml.mjs.map

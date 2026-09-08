import { defineComponent, withAsyncContext, computed, unref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { marked } from 'marked';
import { u as useBlogApi, a as useAsyncData, f as formatDate } from './asyncData-kuKqMtVd.mjs';
import { u as useRoute } from './server.mjs';
import { u as useHead } from './v3-FW648NJB.mjs';
import 'perfect-debounce';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const api = useBlogApi();
    const route = useRoute();
    const { data: postData } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("post", () => api.getPost(Number(route.params.id)), {
      watch: [() => route.params.id]
    })), __temp = await __temp, __restore(), __temp);
    const { data: tagsData } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("blog-tags", () => api.getTags())), __temp = await __temp, __restore(), __temp);
    const post = computed(() => postData.value || null);
    const html = computed(() => post.value ? marked.parse(post.value.content || "") : "");
    const tags = computed(() => tagsData.value || []);
    const tagMap = computed(() => new Map(tags.value.map((t) => [t.tagId, t.tagName])));
    const notFound = computed(() => !post.value);
    useHead(() => ({ title: post.value ? `${post.value.title} \xB7 Ziven Blog` : "Ziven Blog" }));
    function tagName(id) {
      return id != null ? tagMap.value.get(id) || "" : "";
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      if (unref(post)) {
        _push(`<article${ssrRenderAttrs(mergeProps({ class: "post-detail" }, _attrs))}><div class="post-detail__meta">`);
        if (unref(post).categoryName) {
          _push(`<span class="tag">${ssrInterpolate(unref(post).categoryName)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<span>${ssrInterpolate(unref(formatDate)(unref(post).publishedTime))}</span><span>${ssrInterpolate(unref(post).viewCount)} \u6B21\u9605\u8BFB</span></div><h1>${ssrInterpolate(unref(post).title)}</h1><div class="post-detail__tags"><!--[-->`);
        ssrRenderList(unref(post).tagIds, (tid) => {
          _push(`<span class="tag">#${ssrInterpolate(tagName(tid))}</span>`);
        });
        _push(`<!--]--></div><div class="post-content">${(_a = unref(html)) != null ? _a : ""}</div></article>`);
      } else if (unref(notFound)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "empty" }, _attrs))}>\u6587\u7AE0\u4E0D\u5B58\u5728\u6216\u5C1A\u672A\u53D1\u5E03</div>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "empty" }, _attrs))}>\u52A0\u8F7D\u4E2D\u2026</div>`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/posts/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-K4SkAk4R.mjs.map

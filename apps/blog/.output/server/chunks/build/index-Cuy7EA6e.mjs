import { u as useRoute, _ as __nuxt_component_0 } from './server.mjs';
import { _ as _sfc_main$1 } from './PostCard-CZ3RkIME.mjs';
import { defineComponent, ref, computed, withAsyncContext, watch, withCtx, createTextVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderAttr, ssrRenderClass, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as useBlogApi, a as useAsyncData } from './asyncData-kuKqMtVd.mjs';
import { u as useHead } from './v3-FW648NJB.mjs';
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
import 'perfect-debounce';

const pageSize = 8;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const api = useBlogApi();
    const route = useRoute();
    const page = ref(1);
    const keyword = ref(String(route.query.q || ""));
    const activeTag = computed(() => route.query.tag ? Number(route.query.tag) : void 0);
    const { data: postsData, refresh } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "blog-posts",
      () => api.getPosts({
        pageNum: page.value,
        pageSize,
        tagId: activeTag.value,
        keyword: keyword.value.trim() || void 0
      })
    )), __temp = await __temp, __restore(), __temp);
    const { data: categoriesData } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("blog-categories", () => api.getCategories())), __temp = await __temp, __restore(), __temp);
    const { data: tagsData } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("blog-tags", () => api.getTags())), __temp = await __temp, __restore(), __temp);
    const posts = computed(() => {
      var _a;
      return ((_a = postsData.value) == null ? void 0 : _a.records) || [];
    });
    const total = computed(() => {
      var _a;
      return ((_a = postsData.value) == null ? void 0 : _a.total) || 0;
    });
    const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));
    const categories = computed(() => categoriesData.value || []);
    const tags = computed(() => tagsData.value || []);
    const tagMap = computed(() => new Map(tags.value.map((t) => [t.tagId, t.tagName])));
    watch(
      () => route.query,
      () => {
        page.value = 1;
        keyword.value = String(route.query.q || "");
        refresh();
      },
      { deep: true }
    );
    function tagName(id) {
      return id != null ? tagMap.value.get(id) || "" : "";
    }
    useHead({ title: "Ziven Blog" });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_PostCard = _sfc_main$1;
      _push(`<!--[--><section class="hero"><h1>\u5199\u4E0B\u601D\u8003\uFF0C\u5206\u4EAB\u70ED\u7231</h1><p>\u4E00\u4E2A\u4E13\u6CE8\u4E8E\u524D\u7AEF\u3001\u540E\u7AEF\u4E0E\u5DE5\u7A0B\u5316\u7684\u4E2A\u4EBA\u535A\u5BA2\u3002</p></section><div class="filters">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: ["chip", { "is-active": true }]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u5168\u90E8`);
          } else {
            return [
              createTextVNode("\u5168\u90E8")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--[-->`);
      ssrRenderList(unref(categories), (c) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: c.categoryId,
          to: `/category/${c.categoryId}`,
          class: "chip"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(c.categoryName)}`);
            } else {
              return [
                createTextVNode(toDisplayString(c.categoryName), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--><div class="search"><input${ssrRenderAttr("value", unref(keyword))} placeholder="\u641C\u7D22\u6587\u7AE0..."><button class="chip is-active" type="button">\u641C\u7D22</button></div></div>`);
      if (unref(tags).length) {
        _push(`<div class="filters"><!--[-->`);
        ssrRenderList(unref(tags), (t) => {
          _push(`<button class="${ssrRenderClass([{ "is-active": unref(activeTag) === t.tagId }, "chip"])}"> #${ssrInterpolate(t.tagName)}</button>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(posts).length) {
        _push(`<div class="post-grid"><!--[-->`);
        ssrRenderList(unref(posts), (p) => {
          _push(ssrRenderComponent(_component_PostCard, {
            key: p.postId,
            post: p,
            "tag-name": tagName
          }, null, _parent));
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="empty">\u6682\u65E0\u6587\u7AE0</div>`);
      }
      if (unref(total) > pageSize) {
        _push(`<div class="pagination"><button type="button"${ssrIncludeBooleanAttr(unref(page) <= 1) ? " disabled" : ""}>\u4E0A\u4E00\u9875</button><span>${ssrInterpolate(unref(page))} / ${ssrInterpolate(unref(totalPages))}</span><button type="button"${ssrIncludeBooleanAttr(unref(page) >= unref(totalPages)) ? " disabled" : ""}>\u4E0B\u4E00\u9875</button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Cuy7EA6e.mjs.map

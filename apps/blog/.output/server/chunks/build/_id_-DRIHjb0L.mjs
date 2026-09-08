import { _ as _sfc_main$1 } from './PostCard-CZ3RkIME.mjs';
import { defineComponent, computed, withAsyncContext, unref, useSSRContext } from 'vue';
import { ssrInterpolate, ssrRenderList, ssrRenderComponent } from 'vue/server-renderer';
import { u as useBlogApi, a as useAsyncData } from './asyncData-kuKqMtVd.mjs';
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
    const catId = computed(() => Number(route.params.id));
    const { data: catsData } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("cats", () => api.getCategories())), __temp = await __temp, __restore(), __temp);
    const { data: tagsData } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("blog-tags", () => api.getTags())), __temp = await __temp, __restore(), __temp);
    const { data: postsData } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "cat-posts",
      () => api.getPosts({ categoryId: catId.value, pageNum: 1, pageSize: 50 }),
      { watch: [catId] }
    )), __temp = await __temp, __restore(), __temp);
    const category = computed(
      () => (catsData.value || []).find((c) => c.categoryId === catId.value)
    );
    const categoryName = computed(() => {
      var _a;
      return ((_a = category.value) == null ? void 0 : _a.categoryName) || "\u5206\u7C7B";
    });
    const posts = computed(() => {
      var _a;
      return ((_a = postsData.value) == null ? void 0 : _a.records) || [];
    });
    const tags = computed(() => tagsData.value || []);
    const tagMap = computed(() => new Map(tags.value.map((t) => [t.tagId, t.tagName])));
    function tagName(id) {
      return id != null ? tagMap.value.get(id) || "" : "";
    }
    useHead(() => ({ title: `${categoryName.value} \xB7 Ziven Blog` }));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_PostCard = _sfc_main$1;
      _push(`<!--[--><section class="hero"><h1>${ssrInterpolate(unref(categoryName))}</h1><p>\u5171 ${ssrInterpolate(unref(posts).length)} \u7BC7\u6587\u7AE0</p></section>`);
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
        _push(`<div class="empty">\u8BE5\u5206\u7C7B\u6682\u65E0\u6587\u7AE0</div>`);
      }
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/category/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-DRIHjb0L.mjs.map

import { _ as __nuxt_component_0 } from './server.mjs';
import { defineComponent, mergeProps, withCtx, unref, createVNode, openBlock, createBlock, toDisplayString, createCommentVNode, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { f as formatDate } from './asyncData-kuKqMtVd.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PostCard",
  __ssrInlineRender: true,
  props: {
    post: {},
    tagName: { type: Function, default: () => "" }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(ssrRenderComponent(_component_NuxtLink, mergeProps({
        to: `/posts/${__props.post.postId}`,
        class: "post-card"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="post-card__meta"${_scopeId}>`);
            if (__props.post.categoryName) {
              _push2(`<span class="tag"${_scopeId}>${ssrInterpolate(__props.post.categoryName)}</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<span${_scopeId}>${ssrInterpolate(unref(formatDate)(__props.post.publishedTime))}</span></div><h3 class="post-card__title"${_scopeId}>${ssrInterpolate(__props.post.title)}</h3><p class="post-card__summary"${_scopeId}>${ssrInterpolate(__props.post.summary)}</p><div class="post-card__tags"${_scopeId}><!--[-->`);
            ssrRenderList(__props.post.tagIds, (tid) => {
              _push2(`<span class="tag"${_scopeId}>#${ssrInterpolate(__props.tagName(tid))}</span>`);
            });
            _push2(`<!--]--></div>`);
          } else {
            return [
              createVNode("div", { class: "post-card__meta" }, [
                __props.post.categoryName ? (openBlock(), createBlock("span", {
                  key: 0,
                  class: "tag"
                }, toDisplayString(__props.post.categoryName), 1)) : createCommentVNode("", true),
                createVNode("span", null, toDisplayString(unref(formatDate)(__props.post.publishedTime)), 1)
              ]),
              createVNode("h3", { class: "post-card__title" }, toDisplayString(__props.post.title), 1),
              createVNode("p", { class: "post-card__summary" }, toDisplayString(__props.post.summary), 1),
              createVNode("div", { class: "post-card__tags" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(__props.post.tagIds, (tid) => {
                  return openBlock(), createBlock("span", {
                    key: tid,
                    class: "tag"
                  }, "#" + toDisplayString(__props.tagName(tid)), 1);
                }), 128))
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PostCard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=PostCard-CZ3RkIME.mjs.map

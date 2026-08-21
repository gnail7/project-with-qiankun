<script setup>
import { watch, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { useAppStore } from "@/stores/app";
import i18n, { updateDocumentTitle } from "@/i18n";
import { microActions } from "@/qiankun/actions";

const appStore = useAppStore();
const route = useRoute();

watchEffect(() => {
  document.documentElement.classList.toggle("dark", appStore.theme === "dark");
});

// 语言变化时同步 document.lang 和页面标题
watch(
  () => i18n.global.locale.value,
  () => {
    document.documentElement.lang =
      i18n.global.locale.value === "zh-CN" ? "zh-CN" : "en";
    updateDocumentTitle(route);
  }
);

// 接收主应用下发的语言切换（qiankun 全局状态）
microActions.onGlobalStateChange((state) => {
  if (state.language && state.language !== appStore.locale) {
    appStore.setLocale(state.language);
  }
});
</script>

<template>
  <div class="w-screen h-screen" style="height: 100vh">
    <a-config-provider>
      <router-view />
    </a-config-provider>
  </div>
</template>

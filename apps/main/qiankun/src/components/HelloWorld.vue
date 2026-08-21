<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const count = ref(0)
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-10 text-center bg-gray-50 dark:bg-zinc-950">
    <!-- Logo -->
    <div class="w-[72px] h-[72px] rounded-[18px] bg-linear-to-br from-indigo-500 to-indigo-400 flex items-center justify-center text-white text-[32px] font-extrabold shadow-lg shadow-indigo-500/20 mb-6">
      Q
    </div>

    <!-- 标题 -->
    <h1 class="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight">
      {{ t("app.mfeTitle") }}
    </h1>
    <p class="text-base text-zinc-500 dark:text-zinc-400 mb-10 max-w-[400px] leading-relaxed">
      {{ t("hello.desc") }}
    </p>

    <!-- 计数器卡片 -->
    <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-9 px-12 shadow-md mb-8">
      <div class="text-[64px] font-extrabold text-zinc-900 dark:text-zinc-100 leading-none mb-5 tabular-nums">
        {{ count }}
      </div>
      <div class="flex gap-2.5 justify-center flex-wrap">
        <button
          class="text-[15px] font-semibold py-2.5 px-6 rounded-lg border border-zinc-200 dark:border-zinc-800 cursor-pointer transition-all bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-500 hover:text-indigo-500"
          @click="count--"
        >
          − {{ t("hello.decrement") }}
        </button>
        <button
          class="text-[15px] font-semibold py-2.5 px-6 rounded-lg border border-indigo-500 cursor-pointer transition-all bg-indigo-500 text-white hover:bg-indigo-400"
          @click="count++"
        >
          + {{ t("hello.increment") }}
        </button>
        <button
          class="text-[15px] font-semibold py-2.5 px-6 rounded-lg border border-zinc-200 dark:border-zinc-800 cursor-pointer transition-all bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-500 hover:text-indigo-500"
          @click="count = 0"
        >
          {{ t("hello.reset") }}
        </button>
      </div>
    </div>

    <!-- 标签 -->
    <div class="flex gap-2.5 flex-wrap justify-center">
      <span class="text-[13px] py-1.5 px-4 rounded-full bg-indigo-500/10 text-indigo-500 font-semibold border border-indigo-500/20">
        {{ t("hello.techIndependent") }}
      </span>
      <span class="text-[13px] py-1.5 px-4 rounded-full bg-indigo-500/10 text-indigo-500 font-semibold border border-indigo-500/20">
        {{ t("hello.independentDeploy") }}
      </span>
      <span class="text-[13px] py-1.5 px-4 rounded-full bg-indigo-500/10 text-indigo-500 font-semibold border border-indigo-500/20">
        {{ t("hello.styleIsolation") }}
      </span>
      <span class="text-[13px] py-1.5 px-4 rounded-full bg-indigo-500/10 text-indigo-500 font-semibold border border-indigo-500/20">
        {{ t("hello.onDemandLoad") }}
      </span>
    </div>
  </div>
</template>

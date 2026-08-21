<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div
    class="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white md:flex md:flex-col"
  >
    <!-- 装饰光斑 -->
    <div
      class="pointer-events-none absolute -left-20 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl"
    />
    <div
      class="pointer-events-none absolute -bottom-28 -right-16 h-96 w-96 rounded-full bg-fuchsia-300/20 blur-3xl"
    />
    <div
      class="pointer-events-none absolute left-1/4 top-1/2 h-52 w-52 rounded-full bg-sky-200/10 blur-2xl"
    />

    <!-- 顶部 Logo 区 -->
    <div class="relative flex items-center gap-3 p-8 lg:p-10">
      <div class="text-xl font-bold tracking-wide">
        {{ t('login.brandTitle') }}
      </div>
    </div>

    <!-- 中央宣传区域 -->
    <div class="relative flex flex-1 flex-col items-center justify-center px-8 pb-16 text-center">
      <!-- 产品插画：玻璃拟态数据卡片 -->
      <div class="relative mb-12 w-full max-w-sm">
        <div
          class="absolute -left-4 -top-5 rounded-xl bg-white/20 px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur"
        >
          +12.5%
        </div>
        <div class="rounded-2xl bg-white/15 p-5 ring-1 ring-white/20 backdrop-blur">
          <div class="mb-4 flex items-center justify-between">
            <span class="text-sm text-white/80">数据概览</span>
            <span class="rounded-full bg-white/20 px-2 py-0.5 text-xs text-white"> 实时 </span>
          </div>
          <div class="flex h-28 items-end gap-2">
            <div class="w-6 flex-1 rounded-t bg-white/60" style="height: 30%" />
            <div class="w-6 flex-1 rounded-t bg-white/70" style="height: 48%" />
            <div class="w-6 flex-1 rounded-t bg-white/50" style="height: 36%" />
            <div class="w-6 flex-1 rounded-t bg-white/80" style="height: 62%" />
            <div class="w-6 flex-1 rounded-t bg-white/90" style="height: 54%" />
            <div class="w-6 flex-1 rounded-t bg-white/60" style="height: 76%" />
            <div class="w-6 flex-1 rounded-t bg-white/70" style="height: 90%" />
          </div>
          <div class="mt-3 flex justify-between text-xs text-white/50">
            <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span
            ><span>六</span><span>日</span>
          </div>
        </div>
        <div
          class="absolute -bottom-5 -right-3 flex items-center gap-2 rounded-xl bg-white/20 px-3 py-2 text-sm text-white ring-1 ring-white/30 backdrop-blur"
        >
          <span>👥</span>
          <span>1,286</span>
        </div>
      </div>

      <!-- 主标题 + 副标题 -->
      <h1 class="text-3xl font-extrabold leading-snug lg:text-4xl">
        {{ t('login.brandSlogan') }}
      </h1>
      <p class="mt-3 text-sm text-white/70 lg:text-base">
        {{ t('login.brandSub') }}
      </p>
    </div>
  </div>
</template>

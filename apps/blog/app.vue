<script setup lang="ts">
import { useBlogTheme } from './composables/useBlogTheme'

const { isDark, toggle } = useBlogTheme()
</script>

<template>
  <div>
    <header class="site-header">
      <div class="container site-header__inner">
        <NuxtLink to="/" class="brand">
          <span class="brand__mark">Z</span>
          <span>Ziven Blog</span>
        </NuxtLink>
        <nav class="site-nav">
          <NuxtLink to="/" class="site-nav__link">首页</NuxtLink>
          <button
            class="theme-btn"
            type="button"
            :title="isDark ? '切换亮色' : '切换暗色'"
            @click="toggle"
          >
            {{ isDark ? '☀️' : '🌙' }}
          </button>
        </nav>
      </div>
    </header>

    <main class="container">
      <NuxtPage />
    </main>

    <footer class="site-footer">
      <div class="container">© {{ new Date().getFullYear() }} Ziven Blog · 用 Nuxt 驱动</div>
    </footer>
  </div>
</template>

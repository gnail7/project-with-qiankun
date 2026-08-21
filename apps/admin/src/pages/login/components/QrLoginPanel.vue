<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emit = defineEmits(['back'])

// 演示二维码（伪随机生成，固定种子保证稳定）
function makeQrCells() {
  const cells = new Set()
  const finder = (ox, oy) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        const on =
          i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)
        if (on) cells.add(`${ox + j},${oy + i}`)
      }
    }
  }
  finder(0, 0)
  finder(14, 0)
  finder(0, 14)
  let seed = 42
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
  for (let y = 0; y < 21; y++) {
    for (let x = 0; x < 21; x++) {
      if (cells.has(`${x},${y}`)) continue
      if (x >= 7 && x <= 13 && y >= 7 && y <= 13) continue
      if (rand() < 0.42) cells.add(`${x},${y}`)
    }
  }
  return Array.from(cells).map(c => {
    const [x, y] = c.split(',').map(Number)
    return { key: c, x, y }
  })
}

const qrCells = makeQrCells()
</script>

<template>
  <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
    {{ t('login.quickQr') }}
  </h2>

  <div class="mt-6 flex flex-col items-center justify-center py-4">
    <div class="relative rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100">
      <svg viewBox="0 0 21 21" shape-rendering="crispEdges" class="h-44 w-44 text-gray-900">
        <rect
          v-for="cell in qrCells"
          :key="cell.key"
          :x="cell.x"
          :y="cell.y"
          width="1"
          height="1"
          fill="currentColor"
        />
      </svg>
      <div
        class="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg bg-indigo-500 text-xl text-white shadow"
      >
        🐌
      </div>
    </div>
    <p class="mt-5 text-sm text-gray-600 dark:text-zinc-300">
      {{ t('login.qrDesc') }}
    </p>
    <p class="mt-1 text-xs text-gray-400 dark:text-zinc-500">
      {{ t('login.qrPlaceholder') }}
    </p>
    <a-button type="link" class="mt-3" @click="emit('back')">
      {{ t('login.backToAccount') }}
    </a-button>
  </div>
</template>

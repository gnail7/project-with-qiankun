<script setup lang="ts">
import { ref } from 'vue'
import { SettingOutlined, CheckOutlined } from '@ant-design/icons-vue'
import { PRIMARY_COLORS, useTheme } from '../../theme'
import { usePreferences, type LayoutMode } from '../../preferences'

withDefaults(defineProps<{ title?: string }>(), { title: '偏好设置' })

const { theme, primaryColor, setTheme, setPrimaryColor } = useTheme()
const { layout, setLayout } = usePreferences()

const open = ref(false)

function toggleOpen() {
  open.value = !open.value
}

function pickLayout(value: LayoutMode) {
  setLayout(value)
}
</script>

<template>
  <button type="button" class="z-prefs__trigger" title="偏好设置" @click="toggleOpen">
    <SettingOutlined />
  </button>

  <Teleport to="body">
    <Transition name="z-prefs-fade">
      <div v-if="open" class="z-prefs__overlay" @click.self="open = false">
        <Transition name="z-prefs-slide" appear>
          <aside class="z-prefs__panel">
            <header class="z-prefs__header">
              <span class="z-prefs__title">{{ title }}</span>
              <button type="button" class="z-prefs__close" @click="open = false">×</button>
            </header>

            <div class="z-prefs__body">
              <section class="z-prefs__section">
                <h4 class="z-prefs__label">主题模式</h4>
                <div class="z-prefs__seg">
                  <button
                    type="button"
                    class="z-prefs__seg-item"
                    :class="{ 'is-active': theme === 'light' }"
                    @click="setTheme('light')"
                  >
                    亮色
                  </button>
                  <button
                    type="button"
                    class="z-prefs__seg-item"
                    :class="{ 'is-active': theme === 'dark' }"
                    @click="setTheme('dark')"
                  >
                    暗色
                  </button>
                </div>
              </section>

              <section class="z-prefs__section">
                <h4 class="z-prefs__label">主题色</h4>
                <div class="z-prefs__swatches">
                  <button
                    v-for="option in PRIMARY_COLORS"
                    :key="option.name"
                    type="button"
                    class="z-prefs__swatch"
                    :style="{ background: option.color }"
                    :title="option.name"
                    @click="setPrimaryColor(option.color)"
                  >
                    <CheckOutlined v-if="primaryColor === option.color" class="z-prefs__check" />
                  </button>
                </div>
              </section>

              <section class="z-prefs__section">
                <h4 class="z-prefs__label">布局模式</h4>
                <div class="z-prefs__seg">
                  <button
                    type="button"
                    class="z-prefs__seg-item"
                    :class="{ 'is-active': layout === 'sidebar' }"
                    @click="pickLayout('sidebar')"
                  >
                    侧边栏
                  </button>
                  <button
                    type="button"
                    class="z-prefs__seg-item"
                    :class="{ 'is-active': layout === 'top' }"
                    @click="pickLayout('top')"
                  >
                    顶部
                  </button>
                </div>
              </section>
            </div>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.z-prefs__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--z-text-muted);
  font-size: 16px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.z-prefs__trigger:hover {
  background: var(--z-hover);
  color: var(--z-text);
}

.z-prefs__overlay {
  position: fixed;
  inset: 0;
  z-index: 1300;
  background: rgba(0, 0, 0, 0.4);
}

.z-prefs__panel {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 300px;
  display: flex;
  flex-direction: column;
  background: var(--z-card-bg);
  border-left: 1px solid var(--z-border);
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.18);
}

.z-prefs__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--z-border);
}

.z-prefs__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--z-text);
}

.z-prefs__close {
  border: none;
  background: transparent;
  color: var(--z-text-muted);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

.z-prefs__body {
  flex: 1;
  overflow: auto;
  padding: 18px 20px;
}

.z-prefs__section + .z-prefs__section {
  margin-top: 24px;
}

.z-prefs__label {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--z-text-muted);
}

.z-prefs__seg {
  display: inline-flex;
  padding: 3px;
  gap: 2px;
  border: 1px solid var(--z-border);
  border-radius: 8px;
}

.z-prefs__seg-item {
  padding: 5px 16px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--z-text-muted);
  font-size: 13px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.z-prefs__seg-item:hover {
  color: var(--z-text);
}

.z-prefs__seg-item.is-active {
  background: var(--z-primary);
  color: #fff;
}

.z-prefs__swatches {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.z-prefs__swatch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.z-prefs__swatch:hover {
  transform: scale(1.08);
}

.z-prefs__check {
  color: #fff;
  font-size: 14px;
}

.z-prefs-fade-enter-active,
.z-prefs-fade-leave-active {
  transition: opacity 0.2s ease;
}

.z-prefs-fade-enter-from,
.z-prefs-fade-leave-to {
  opacity: 0;
}

.z-prefs-slide-enter-active,
.z-prefs-slide-leave-active {
  transition: transform 0.25s ease;
}

.z-prefs-slide-enter-from,
.z-prefs-slide-leave-to {
  transform: translateX(100%);
}
</style>

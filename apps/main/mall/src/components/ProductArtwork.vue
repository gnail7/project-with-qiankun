<script setup lang="ts">
import type { ProductArtworkProps } from './types'

withDefaults(defineProps<ProductArtworkProps>(), {
  code: 'OBJECT / 001',
  tone: 'sand',
  compact: false,
})
</script>

<template>
  <div class="product-artwork" :class="[`product-artwork--${tone}`, { 'is-compact': compact }]">
    <span class="product-artwork__code">{{ code }}</span>
    <span class="product-artwork__edition">FORME<br />STUDIO</span>
    <div class="product-artwork__sun" />
    <div class="product-artwork__object product-artwork__object--back" />
    <div class="product-artwork__object product-artwork__object--center">
      <span class="product-artwork__object-mark">F</span>
    </div>
    <div class="product-artwork__object product-artwork__object--front" />
    <span class="product-artwork__caption">{{ title }}</span>
    <span class="product-artwork__number">01 — 04</span>
  </div>
</template>

<style scoped>
.product-artwork {
  --art-bg: #eee8dd;
  --art-primary: #d7c9b5;
  --art-secondary: #f6f0e7;
  --art-shadow: #b2a28f;
  position: relative;
  display: grid;
  min-height: 430px;
  height: 100%;
  place-items: center;
  overflow: hidden;
  background: var(--art-bg);
  isolation: isolate;
}

.product-artwork--sage {
  --art-bg: #e5e9de;
  --art-primary: #aab7a0;
  --art-secondary: #f4f2e8;
  --art-shadow: #86957d;
}

.product-artwork--blue {
  --art-bg: #e4eaf0;
  --art-primary: #b7c8d3;
  --art-secondary: #f5f4ef;
  --art-shadow: #8da8ba;
}

.product-artwork--rose {
  --art-bg: #f0e3df;
  --art-primary: #d5b2a8;
  --art-secondary: #fbf2ea;
  --art-shadow: #bd8d83;
}

.product-artwork::before,
.product-artwork::after {
  position: absolute;
  z-index: -1;
  border: 1px solid rgb(255 255 255 / 40%);
  border-radius: 50%;
  content: '';
}

.product-artwork::before {
  width: 74%;
  aspect-ratio: 1;
  transform: translate(8%, 13%);
}

.product-artwork::after {
  width: 102%;
  aspect-ratio: 1;
  transform: translate(-13%, 24%);
}

.product-artwork__code,
.product-artwork__edition,
.product-artwork__caption,
.product-artwork__number {
  position: absolute;
  color: #26302d;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.product-artwork__code {
  top: 26px;
  left: 28px;
}

.product-artwork__edition {
  top: 25px;
  right: 26px;
  line-height: 1.6;
  text-align: right;
}

.product-artwork__sun {
  position: absolute;
  top: 21%;
  right: 22%;
  width: 24%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--art-secondary);
  opacity: 0.78;
}

.product-artwork__object {
  position: absolute;
  bottom: 22%;
  left: 50%;
  box-shadow: 0 24px 40px rgb(41 44 36 / 12%);
}

.product-artwork__object--back {
  width: 35%;
  height: 35%;
  border-radius: 42% 42% 18% 18%;
  background: linear-gradient(145deg, var(--art-secondary), var(--art-primary));
  transform: translate(-100%, -7%) rotate(-9deg);
}

.product-artwork__object--center {
  display: grid;
  width: 40%;
  height: 40%;
  place-items: center;
  border-radius: 48% 48% 16% 16%;
  background: linear-gradient(145deg, #fffaf2 4%, var(--art-primary) 88%);
  transform: translate(-29%, -2%) rotate(5deg);
}

.product-artwork__object--front {
  width: 30%;
  height: 22%;
  border-radius: 50% 50% 16% 16%;
  background: linear-gradient(155deg, var(--art-secondary), var(--art-shadow));
  transform: translate(-4%, 31%) rotate(11deg);
}

.product-artwork__object-mark {
  color: rgb(81 91 75 / 42%);
  font-family: Georgia, serif;
  font-size: clamp(34px, 8vw, 76px);
  font-weight: 500;
}

.product-artwork__caption {
  bottom: 28px;
  left: 28px;
  max-width: 62%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-artwork__number {
  right: 28px;
  bottom: 28px;
}

.product-artwork.is-compact {
  min-height: 245px;
}

.is-compact .product-artwork__code {
  top: 18px;
  left: 18px;
  font-size: 8px;
}

.is-compact .product-artwork__edition {
  top: 17px;
  right: 18px;
  font-size: 8px;
}

.is-compact .product-artwork__caption {
  bottom: 18px;
  left: 18px;
  font-size: 8px;
}

.is-compact .product-artwork__number {
  right: 18px;
  bottom: 18px;
  font-size: 8px;
}
</style>

---
category: Component
---

# useTemplateRefsList

Shorthand for binding refs to template elements and components inside `v-for`.

::: warning
This function only works for Vue 3
:::

## Usage

```html
<template>
  <!-- Vue begins iteration over numbers from 1 so index must be used here -->
  <div v-for="(i, index) of 5" :key="i" :ref="refs.set(index)"></div>
</template>

<script setup lang="ts">
import { onUpdated } from 'vue'
import { useTemplateRefsList } from '@vueuse/core'

const refs = useTemplateRefsList<HTMLDivElement>()

onUpdated(() => {
  console.log(refs)
})
</script>
```

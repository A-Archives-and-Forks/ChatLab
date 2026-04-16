<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ThemeCard } from '@/components/UI'
import type { SharedWord } from '@/types/languagePreference'

const { t } = useI18n()

const props = defineProps<{
  sharedWords: SharedWord[]
}>()

const emit = defineEmits<{
  wordClick: [word: string]
}>()

const displayWords = computed(() => props.sharedWords.slice(0, 20))

const WORD_COLORS = [
  '#6366f1',
  '#ec4899',
  '#f97316',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#14b8a6',
  '#f43f5e',
  '#eab308',
  '#06b6d4',
  '#a855f7',
  '#ef4444',
]
</script>

<template>
  <ThemeCard variant="section">
    <div class="px-5 py-4 sm:px-6">
      <div class="mb-4 flex items-center gap-2">
        <UIcon name="i-heroicons-link" class="h-4 w-4 text-emerald-500" />
        <span class="text-sm font-bold text-gray-900 dark:text-white">
          {{ t('quotes.languagePreference.sync.sharedTitle') }}
        </span>
      </div>

      <div v-if="displayWords.length > 0" class="flex flex-wrap justify-center gap-2">
        <span
          v-for="(w, idx) in displayWords"
          :key="w.word"
          class="cursor-pointer rounded-full px-3 py-1 text-sm font-medium text-white transition-opacity hover:opacity-80"
          :style="{ backgroundColor: WORD_COLORS[idx % WORD_COLORS.length] }"
          @click="emit('wordClick', w.word)"
        >
          {{ w.word }}
        </span>
      </div>
      <div v-else class="py-4 text-center text-sm text-gray-400">-</div>
    </div>
  </ThemeCard>
</template>

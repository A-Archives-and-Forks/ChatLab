<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ThemeCard, UITabs } from '@/components/UI'
import type { MemberLanguageProfile } from '@/types/languagePreference'

const { t } = useI18n()

const props = defineProps<{
  members: MemberLanguageProfile[]
}>()

const emit = defineEmits<{
  wordClick: [word: string]
}>()

const topN = ref(20)
const topNOptions = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '30', value: 30 },
]

const memberA = computed(() => props.members[0])
const memberB = computed(() => props.members[1])

const displayA = computed(() => memberA.value?.catchphrases.slice(0, topN.value) ?? [])
const displayB = computed(() => memberB.value?.catchphrases.slice(0, topN.value) ?? [])

const sharedPhrases = computed(() => {
  if (!memberA.value || !memberB.value) return new Set<string>()
  const setA = new Set(memberA.value.catchphrases.map((c) => c.content))
  const setB = new Set(memberB.value.catchphrases.map((c) => c.content))
  return new Set([...setA].filter((x) => setB.has(x)))
})

const rankStyles = [
  {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
    badge: 'bg-amber-100 dark:bg-amber-800/40 text-amber-600 dark:text-amber-300',
  },
  {
    bg: 'bg-slate-50 dark:bg-slate-800/40',
    text: 'text-slate-600 dark:text-slate-300',
    badge: 'bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400',
  },
  {
    bg: 'bg-orange-50 dark:bg-orange-900/15',
    text: 'text-orange-600 dark:text-orange-400',
    badge: 'bg-orange-100 dark:bg-orange-800/30 text-orange-500 dark:text-orange-300',
  },
]

function getRankStyle(index: number) {
  if (index < rankStyles.length) return rankStyles[index]
  return {
    bg: 'bg-gray-50 dark:bg-gray-800/30',
    text: 'text-gray-600 dark:text-gray-400',
    badge: 'bg-gray-100 dark:bg-gray-700/40 text-gray-500 dark:text-gray-400',
  }
}

function truncateContent(content: string, maxLength = 20): string {
  return content.length <= maxLength ? content : content.slice(0, maxLength) + '...'
}
</script>

<template>
  <ThemeCard variant="section">
    <div class="px-5 py-4 sm:px-6">
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-chat-bubble-bottom-center-text" class="h-4 w-4 text-indigo-500" />
          <span class="text-sm font-bold text-gray-900 dark:text-white">
            {{ t('quotes.languagePreference.catchphrasePK.title') }}
          </span>
          <span
            v-if="sharedPhrases.size > 0"
            class="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
          >
            {{ t('quotes.languagePreference.catchphrasePK.sharedCount', { count: sharedPhrases.size }) }}
          </span>
        </div>
        <UITabs v-model="topN" size="xs" :items="topNOptions" />
      </div>

      <div v-if="memberA && memberB" class="grid grid-cols-2 gap-6">
        <!-- Member A -->
        <div>
          <div class="mb-3 text-center">
            <span class="text-sm font-semibold text-blue-600 dark:text-blue-400">{{ memberA.name }}</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="(phrase, index) in displayA"
              :key="phrase.content"
              class="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 transition-opacity hover:opacity-75"
              :class="[
                getRankStyle(index).bg,
                sharedPhrases.has(phrase.content) ? 'ring-2 ring-pink-300 dark:ring-pink-600' : '',
              ]"
              :title="phrase.content"
              @click="emit('wordClick', phrase.content)"
            >
              <span
                v-if="index < 3"
                class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                :class="getRankStyle(index).badge"
              >
                {{ index + 1 }}
              </span>
              <span class="text-sm font-medium" :class="getRankStyle(index).text">
                {{ truncateContent(phrase.content) }}
              </span>
              <span class="text-xs opacity-50">{{ phrase.count }}</span>
            </div>
          </div>
        </div>

        <!-- Member B -->
        <div>
          <div class="mb-3 text-center">
            <span class="text-sm font-semibold text-pink-600 dark:text-pink-400">{{ memberB.name }}</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="(phrase, index) in displayB"
              :key="phrase.content"
              class="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 transition-opacity hover:opacity-75"
              :class="[
                getRankStyle(index).bg,
                sharedPhrases.has(phrase.content) ? 'ring-2 ring-pink-300 dark:ring-pink-600' : '',
              ]"
              :title="phrase.content"
              @click="emit('wordClick', phrase.content)"
            >
              <span
                v-if="index < 3"
                class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                :class="getRankStyle(index).badge"
              >
                {{ index + 1 }}
              </span>
              <span class="text-sm font-medium" :class="getRankStyle(index).text">
                {{ truncateContent(phrase.content) }}
              </span>
              <span class="text-xs opacity-50">{{ phrase.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <p class="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
        {{ t('quotes.languagePreference.catchphrasePK.hint') }}
      </p>
    </div>
  </ThemeCard>
</template>

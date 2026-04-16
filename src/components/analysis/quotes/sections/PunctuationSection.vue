<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDark } from '@vueuse/core'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { ThemeCard } from '@/components/UI'
import type { MemberLanguageProfile, PunctuationStats } from '@/types/languagePreference'

echarts.use([PieChart, TooltipComponent, CanvasRenderer])

const { t } = useI18n()
const isDark = useDark()

const props = defineProps<{
  members: MemberLanguageProfile[]
}>()

const memberA = computed(() => props.members[0])
const memberB = computed(() => props.members[1])

const PUNCT_COLORS = ['#6366f1', '#ec4899', '#f97316', '#22c55e', '#06b6d4', '#8b5cf6']

function getPersonality(p: PunctuationStats): { label: string; colorClass: string } {
  const entries: [string, number][] = [
    ['ellipsis', p.ellipsis],
    ['exclamation', p.exclamation],
    ['question', p.question],
    ['tilde', p.tilde],
    ['noPunct', p.noPunct],
    ['period', p.period],
  ]
  const max = entries.reduce((a, b) => (a[1] >= b[1] ? a : b))
  const map: Record<string, { label: string; colorClass: string }> = {
    ellipsis: {
      label: t('quotes.languagePreference.punctuation.personalityDeep'),
      colorClass: 'text-indigo-600 dark:text-indigo-400',
    },
    exclamation: {
      label: t('quotes.languagePreference.punctuation.personalityPassionate'),
      colorClass: 'text-red-600 dark:text-red-400',
    },
    question: {
      label: t('quotes.languagePreference.punctuation.personalityCurious'),
      colorClass: 'text-amber-600 dark:text-amber-400',
    },
    tilde: {
      label: t('quotes.languagePreference.punctuation.personalityCheerful'),
      colorClass: 'text-pink-600 dark:text-pink-400',
    },
    noPunct: {
      label: t('quotes.languagePreference.punctuation.personalityFreeflow'),
      colorClass: 'text-emerald-600 dark:text-emerald-400',
    },
    period: {
      label: t('quotes.languagePreference.punctuation.personalityPrecise'),
      colorClass: 'text-blue-600 dark:text-blue-400',
    },
  }
  return map[max[0]] || { label: '-', colorClass: 'text-gray-500' }
}

function buildDonutData(p: PunctuationStats) {
  return [
    { name: '...', value: p.ellipsis },
    { name: '！', value: p.exclamation },
    { name: '？', value: p.question },
    { name: '～', value: p.tilde },
    { name: '。', value: p.period },
    { name: t('quotes.languagePreference.punctuation.none'), value: p.noPunct },
  ].filter((d) => d.value > 0)
}

const chartRefA = ref<HTMLElement | null>(null)
const chartRefB = ref<HTMLElement | null>(null)
let chartA: echarts.ECharts | null = null
let chartB: echarts.ECharts | null = null

function buildDonutOption(data: Array<{ name: string; value: number }>) {
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    series: [
      {
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        padAngle: 2,
        itemStyle: { borderRadius: 4 },
        label: { show: true, fontSize: 10, color: isDark.value ? '#9ca3af' : '#6b7280', formatter: '{b}' },
        emphasis: { label: { show: true, fontWeight: 'bold' }, scaleSize: 4 },
        data: data.map((d, i) => ({ ...d, itemStyle: { color: PUNCT_COLORS[i % PUNCT_COLORS.length] } })),
      },
    ],
  }
}

function initCharts() {
  if (chartRefA.value && memberA.value) {
    chartA = echarts.init(chartRefA.value, undefined, { renderer: 'canvas' })
    chartA.setOption(buildDonutOption(buildDonutData(memberA.value.punctuation)), { notMerge: true })
  }
  if (chartRefB.value && memberB.value) {
    chartB = echarts.init(chartRefB.value, undefined, { renderer: 'canvas' })
    chartB.setOption(buildDonutOption(buildDonutData(memberB.value.punctuation)), { notMerge: true })
  }
}

function handleResize() {
  chartA?.resize()
  chartB?.resize()
}

watch(
  () => props.members,
  () => {
    if (chartA && memberA.value)
      chartA.setOption(buildDonutOption(buildDonutData(memberA.value.punctuation)), { notMerge: true })
    if (chartB && memberB.value)
      chartB.setOption(buildDonutOption(buildDonutData(memberB.value.punctuation)), { notMerge: true })
  },
  { deep: true }
)

watch(isDark, () => {
  chartA?.dispose()
  chartB?.dispose()
  initCharts()
})
onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartA?.dispose()
  chartB?.dispose()
})
</script>

<template>
  <ThemeCard variant="section">
    <div class="px-5 py-4 sm:px-6">
      <div class="mb-4 flex items-center gap-2">
        <UIcon name="i-heroicons-ellipsis-horizontal" class="h-4 w-4 text-orange-500" />
        <span class="text-sm font-bold text-gray-900 dark:text-white">
          {{ t('quotes.languagePreference.punctuation.title') }}
        </span>
      </div>

      <div v-if="memberA && memberB" class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div v-for="(m, idx) in [memberA, memberB]" :key="m.memberId" class="flex flex-col items-center">
          <div class="mb-2 flex items-center gap-2">
            <span
              class="text-sm font-semibold"
              :class="idx === 0 ? 'text-blue-600 dark:text-blue-400' : 'text-pink-600 dark:text-pink-400'"
            >
              {{ m.name }}
            </span>
            <span
              class="rounded-full px-2 py-0.5 text-[10px] font-bold"
              :class="getPersonality(m.punctuation).colorClass"
            >
              {{ getPersonality(m.punctuation).label }}
            </span>
          </div>
          <div
            v-if="m.punctuation.total > 0"
            :ref="
              (el) => {
                if (idx === 0) chartRefA = el as HTMLElement
                else chartRefB = el as HTMLElement
              }
            "
            style="width: 100%; height: 200px"
          />
          <div v-else class="flex h-[200px] items-center justify-center text-sm text-gray-400">
            {{ t('quotes.languagePreference.punctuation.empty') }}
          </div>
        </div>
      </div>
    </div>
  </ThemeCard>
</template>

<template>
  <textarea
    @input="resize"
    v-bind="$attrs"
    ref="refResize"
    class="min-h-32"
    :class="{ 'rounded-b-lg': !clear }"
    style="min-height: 80px"
    v-model="input"
    @copy="doCopy"
  ></textarea>
  <button
    v-if="clear"
    @click="input = ''"
    class="bg-gray-800 -mt-3 text-right p-2 justify-end flex mb-4 w-full border border-t-0 border-gray-600 rounded-b"
  >
    <icon-sweep width="20px" fill="#eee" />
  </button>
</template>

<script setup lang="ts">
import { computed, nextTick, onActivated, onMounted, ref, watch } from 'vue'
import IconSweep from '@/components/IconSweep.vue'

const refResize = ref()

function doCopy() {
  const selection = document.getSelection().toString() || input.value
  emit('doCopy', selection)
}

const emit = defineEmits(['update:modelValue', 'doCopy'])
const props = defineProps({
  modelValue: String,
  clear: {
    type: Boolean,
    default: true,
  },
})

onMounted(() => {
  nextTick(() => {
    resizeElement(refResize.value)
  })
})
onActivated(() => {
  nextTick(() => {
    resizeElement(refResize.value)
  })
})

const input = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

watch(
  () => input,
  () => {
    nextTick(() => {
      resizeElement(refResize.value)
    })
  },
)
watch(
  () => props.modelValue,
  () => {
    nextTick(() => {
      resizeElement(refResize.value)
    })
  },
)

function resize(e: any) {
  resizeElement(e?.target)
}

function resizeElement(e: any) {
  if (!e) {
    return
  }
  e.style.height = '18px'
  const height = Math.min(e.scrollHeight + 5, 500)
  e.style.height = height + 'px'
}
</script>

<style scoped></style>

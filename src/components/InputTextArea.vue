<template>
  <textarea
    @input="resize"
    v-bind="$attrs"
    ref="refResize"
    class="min-h-32"
    :class="{ 'rounded-b-lg': !clear }"
    style="min-height: 80px"
    v-model="input"
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
import { computed, nextTick, onActivated, onMounted, ref } from 'vue'
import IconSweep from '@/components/IconSweep.vue'

const refResize = ref()

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: String,
  clear: {
    type: Boolean,
    default: true
  }
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
  set: (value) => emit('update:modelValue', value)
})

function resize(e: any) {
  resizeElement(e?.target)
}

function resizeElement(e: any) {
  if (!e) {
    return
  }
  e.style.height = '18px'
  e.style.height = e.scrollHeight + 5 + 'px'
}
</script>

<style scoped></style>

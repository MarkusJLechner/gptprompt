<template>
  <div class="relative">
    <input
      v-bind="$attrs"
      class="w-full py-2 pl-3 pr-3 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 leading-tight border rounded-md shadow-sm"
      type="text"
      ref="refInput"
      v-model="input"
      @blur="onBlur()"
      @focus="isFocusedInput = true"
      @keydown.enter="blur()"
    />
    <div class="absolute inset-y-0 h-10 pt-1 right-0 flex items-center">
      <button
        type="button"
        class="text-gray-400 hover:text-gray-600 px-3 py-3 focus:outline-none focus:text-gray-600"
        @click="input = ''"
      >
        <svg class="h-6 w-6 fill-current" viewBox="0 0 25 25">
          <path
            d="M6.526 5.464a1 1 0 0 1 1.415 0L10 8.586l2.06-2.122a1 1 0 1 1 1.415 1.415L11.415 10l2.06 2.122a1 1 0 0 1-1.415 1.415L10 11.414l-2.06 2.122a1 1 0 0 1-1.415-1.415L8.585 10 6.526 7.878a1 1 0 0 1 0-1.414z"
            clip-rule="evenodd"
            fill-rule="evenodd"
          ></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: String,
})

const refInput = ref(null)

const input = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

function focus() {
  setTimeout(() => {
    refInput.value.focus()
    refInput.value.select()
  }, 30)
}

let isFocusedInput = ref(false)
function onBlur() {
  setTimeout(() => {
    isFocusedInput.value = false
  }, 200)
}

function isFocused() {
  return isFocusedInput.value
}

function blur() {
  setTimeout(() => {
    refInput.value.blur()
  }, 30)
}

defineExpose({
  focus,
  isFocused,
})
</script>

<style scoped></style>

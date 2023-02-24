<template>
  <div class="relative">
    <input
      v-bind="$attrs"
      class="w-full py-2 pl-3 pr-3 text-black leading-tight border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      type="text"
      v-model="input"
    />
    <div class="absolute inset-y-0 h-10 right-0 flex items-center">
      <button
        type="button"
        class="text-gray-400 hover:text-gray-600 px-3 focus:outline-none focus:text-gray-600"
        @click="input = ''"
      >
        <svg class="h-4 w-4 fill-current" viewBox="0 0 20 20">
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
import { computed } from 'vue'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: String
})

const input = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<style scoped></style>

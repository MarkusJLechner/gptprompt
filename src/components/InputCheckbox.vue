<template>
  <div class="flex items-center">
    <input
      :id="'checkbox-' + uid"
      type="checkbox"
      v-model="input"
      class="w-8 h-8 min-h-8 min-w-8 checkbox rounded-lg text-blue-600 accent-blue-500 bg-gray-700 border-gray-600"
    />
    <label
      :for="'checkbox-' + uid"
      class="ml-2 w-full text-sm font-medium text-gray-200 dark:text-gray-300"
      ><slot
    /></label>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'

const uid = getCurrentInstance()?.uid

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: Boolean,
})

const input = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

<style scoped></style>

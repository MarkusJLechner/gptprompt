<template>
  <div class="bg-gray-800 text-white p-3 min-h-full">
    <header class="flex w-full gap-3">
      <input-clear v-model="inputSearch" placeholder="Search" class="flex-1" />
      <button class="button" @click="addPrompt">add</button>
    </header>

    <ul ref="refList" class="mt-3 max-h-52 overflow-y-auto">
      <li
        :key="prompt.id"
        v-for="prompt in filteredStore"
        :ref="
          (el) => {
            if (refLi) {
              refLi[prompt.id] = el
            }
          }
        "
      >
        <button
          :class="{
            'bg-gray-400 border-b-2': selectedPrompt === prompt.id,
            'bg-gray-600': selectedPrompt !== prompt.id
          }"
          @click="selectPrompt(prompt.id)"
          class="flex-1 button"
        >
          {{ prompt.name }}</button
        ><button class="button" @click="deletePrompt(prompt.id)">x</button>
      </li>
    </ul>

    <hr />

    <div v-if="currentPrompt">
      <header class="my-2">Prompt:</header>

      <input class="input" type="text" v-model="currentPrompt.name" placeholder="name" />
      <input-clear v-model="currentPrompt.reuseChat" placeholder="reuse id" class="flex-1 mb-2" />

      <textarea
        @input="resize"
        ref="refResizer"
        v-model="currentPrompt.prompt"
        placeholder="prompt text"
        style="min-height: 80px"
      ></textarea>

      <div class="flex gap-4">
        <button class="button flex-1" @click="copy">copy</button>
        <button class="button flex-1" @click="goto">goto</button>
      </div>

      <hr />

      <div :key="variable.id" v-for="(variable, index) in currentPrompt.variables">
        <div class="flex w-full gap-3 items-baseline">
          <span class="flex-1">Variable ${{ index }}</span
          ><button class="button" @click="deleteVariable(variable.id)">x</button>
        </div>
        <textarea
          @input="resize"
          ref="refResize"
          class="min-h-32"
          placeholder="variable"
          style="min-height: 80px"
          v-model="variable.text"
        ></textarea>

        <textarea
          @input="resize"
          ref="refResize"
          class="min-h-32"
          placeholder="variable text"
          style="min-height: 80px"
          v-model="variable.promptText"
        ></textarea>
      </div>

      <button class="button" @click="addVariable">add variable</button>
    </div>

    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { nanoid } from 'nanoid'
import InputClear from '@/components/InputClear.vue'

let inputSearch = ref('')

const refLi = ref<Record<string, any>>({})
const refResizer = ref<null | HTMLElement>(null)
const refResize = ref<null | HTMLElement[]>(null)
onMounted(() => {
  resizeAllElements()

  scrollToActive()
})

function resizeAllElements() {
  nextTick(() => {
    if (refResizer.value) {
      refResizer.value.style.height = '18px'
      refResizer.value.style.height = refResizer.value.scrollHeight + 'px'
    }

    if (refResize.value) {
      refResize.value.forEach((e) => {
        e.style.height = '18px'
        e.style.height = e.scrollHeight + 'px'
      })
    }
  })
}

const currentPrompt = computed(() => {
  return store.prompts.find((p: any) => p.id === selectedPrompt.value)
})

const defaultStore = {
  prompts: [
    {
      id: nanoid(),
      reuseChat: '7d1613a4-161a-421c-988e-8281ac009e00',
      name: 'Learn jap',
      prompt: 'Schreibe einen prompt mit $0',
      variables: [{ id: nanoid(), text: '', promptText: '$_' }]
    }
  ]
}
const storageStore = JSON.parse(localStorage.getItem('store') ?? JSON.stringify(defaultStore))

const store = reactive(storageStore)

watch(store, (store) => {
  localStorage.setItem('store', JSON.stringify(store))
})

const selectedPrompt = ref<string | null>(localStorage.getItem('selectPrompt') ?? null)
function selectPrompt(id: string) {
  selectedPrompt.value = id

  resizeAllElements()

  localStorage.setItem('selectPrompt', id)
}

function copy() {
  const string = parseString()
  copyToClipboard(string)
  return string
}

function goto() {
  copy()
  if (currentPrompt.value?.reuseChat) {
    window.open('https://chat.openai.com/chat/' + currentPrompt.value.reuseChat, '_blank')
  } else {
    window.open('https://chat.openai.com/chat', '_blank')
  }
}

function parseString() {
  if (!currentPrompt.value) {
    return
  }

  let string = currentPrompt.value.prompt ?? ''
  currentPrompt.value.variables.forEach((v: any, index: number) => {
    if (v.text) {
      const promptText = v.promptText.replaceAll(`$_`, v.text)
      string = string.replaceAll(`$${index}`, promptText)
    } else {
      string = string.replaceAll(`$${index}`, '')
    }
  })
  console.log({ string })

  return string
}

function copyToClipboard(str: string) {
  const el = document.createElement('textarea')
  el.value = str
  el.setAttribute('readonly', '')
  el.style.position = 'absolute'
  el.style.left = '-9999px'
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}

const filteredStore = computed(() => {
  return store.prompts.filter((p: any) => p.name.toLowerCase().includes(inputSearch.value))
})

function addPrompt() {
  const newId = nanoid()
  store.prompts.push({
    id: newId,
    reuseChat: '',
    name: '',
    prompt: '$0',
    variables: [{ id: nanoid(), text: '', promptText: '$_' }]
  })
  inputSearch.value = ''

  selectPrompt(newId)

  scrollToActive()
}

function scrollToActive() {
  nextTick(() => {
    if (refLi.value && selectedPrompt.value) {
      refLi.value[selectedPrompt.value]?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      })
    }
  })
}

function deletePrompt(index: string) {
  store.prompts = store.prompts.filter((p: any) => p.id !== index)
}

function addVariable() {
  currentPrompt.value?.variables.push({
    id: nanoid(),
    text: '',
    promptText: '$_'
  })
}
function deleteVariable(id: string) {
  if (currentPrompt.value) {
    currentPrompt.value.variables = currentPrompt.value?.variables.filter((v: any) => v.id !== id)
  }
}

function resize(e: any) {
  e.target.style.height = '18px'
  e.target.style.height = e.target.scrollHeight + 'px'
}
</script>

<template>
  <div class="text-white p-3 min-h-full min-w-full flex flex-col md:flex-row pt-5 pb-24">
    <section>
      <div class="flex w-full gap-3">
        <input-clear
          v-model="inputSearch"
          @click="clickFocus"
          placeholder="Search"
          class="flex-1 h-10"
        />
        <button class="button px-2 h-10 bg-green-800" @click="addPrompt">
          <icon-add width="25px" />
        </button>
      </div>

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
            {{ prompt.name || '-' }}
          </button>

          <button v-if="isEditMode" class="button px-2 bg-red-900" @click="deletePrompt(prompt.id)">
            <icon-delete width="25px" />
          </button>
        </li>
      </ul>
    </section>

    <hr class="md:mr-3" />

    <div v-if="currentPrompt" class="flex-1 flex" :class="{ 'flex-col': store.flexRow }">
      <section class="flex-1">
        <header class="my-2 flex justify-between">
          Prompt
          <span class="text-sm mr-2 block text-amber-400">{{ currentPrompt.name }}</span>
        </header>

        <input-clear
          v-if="isEditMode"
          v-model="currentPrompt.name"
          placeholder="Name"
          class="flex-1 mb-2"
        />

        <input-clear
          v-if="isEditMode"
          v-model="currentPrompt.reuseChat"
          placeholder="chat id"
          class="flex-1 mb-2"
        />

        <input-text-area
          placeholder="Prompt text"
          v-model="currentPrompt.prompt"
          :clear="false"
          v-if="isEditMode"
        />

        <div class="flex justify-between">
          <button class="button" @click="copy"><icon-copy width="25px" /></button>
          <button class="button" @click="goto"><icon-link width="25px" /></button>
        </div>

        <div class="mt-4 flex items-baseline">
          <input-checkbox v-model="store.render" class="flex-1"
            ><icon-eye width="25px"
          /></input-checkbox>
          <input-checkbox v-model="store.flexRow" class="mt-2 flex-1"
            ><icon-container width="25px"
          /></input-checkbox>
          <input-checkbox v-model="store.editMode" class="mt-2 flex-1"
            ><icon-edit width="25px"
          /></input-checkbox>
        </div>

        <div
          v-if="store.render"
          class="mt-3 text-sm text-gray-200 p-3 bg-gray-900 rounded shadow whitespace-pre-wrap"
        >
          {{ renderedString }}
        </div>
      </section>

      <hr class="mr-3" />

      <section class="flex-1 -mx-1">
        <header class="my-2">Variables</header>
        <div
          class="bg-gray-900 rounded-lg p-3 mb-1"
          :key="variable.id"
          v-for="(variable, index) in currentPrompt.variables"
        >
          <div class="flex w-full gap-3 h-12 items-center mb-2">
            <div class="flex w-full gap-3 h-12 items-center" v-if="isEditMode">
              <input
                class="input flex-0 mt-2"
                type="text"
                @dblclick="clickFocus"
                v-model="variable.name"
                placeholder="Name"
              />
              <span class="flex-1 block flex items-center"> ${{ index }}</span
              ><button
                class="button px-2 bg-red-900 m-0 -mt-1"
                @click="deleteVariable(variable.id)"
              >
                <icon-delete width="25px" />
              </button>
            </div>
            <div class="text-white" v-if="!isEditMode">
              {{ variable.name || '-' }}
            </div>
          </div>

          <input-text-area placeholder="variable" v-model="variable.text" />

          <input-text-area
            placeholder="variable text"
            v-model="variable.promptText"
            v-if="isEditMode"
          />
        </div>

        <button v-if="isEditMode" class="button px-2 bg-green-700 mt-4" @click="addVariable">
          <icon-add width="25px" />
        </button>

        <hr class="mt-12" />

        <section>
          <header class="my-2">Links</header>

          <div
            class="bg-gray-900 rounded-lg p-3 mb-1 flex flex-wrap items-center gap-3"
            :key="link.id"
            v-for="(link, indexLink) in currentPrompt.links"
          >
            <span>{{ link.name || 'url ' + indexLink }}:</span>
            <button
              class="button bg-gray-700 rounded-lg p-3 mb-1"
              :key="variable.id"
              v-for="(variable, index) in currentPrompt.variables"
              @click="gotoLink(link, variable)"
            >
              {{ variable.name || 'var' + index }} - ${{ index }}
            </button>
          </div>

          <hr class="mr-3" />

          <section v-if="isEditMode">
            <header class="my-3">Links edit</header>
            <div
              class="bg-gray-900 rounded-lg p-3 mb-1"
              :key="link.id"
              v-for="link in currentPrompt.links"
            >
              <div class="flex gap-3">
                <input
                  class="input"
                  type="text"
                  @dblclick="clickFocus"
                  v-model="link.name"
                  placeholder="Url Name"
                />

                <button class="button px-2 bg-red-900 h-11 m-0" @click="deleteLink(link.id)">
                  <icon-delete width="25px" />
                </button>
              </div>

              <input
                class="input"
                type="text"
                @dblclick="clickFocus"
                v-model="link.url"
                placeholder="eg: https://dic.com/?w=$$"
              />
            </div>

            <button class="button px-2 bg-green-700 mt-4" @click="addLink">
              <icon-add width="25px" />
            </button>
          </section>
        </section>

        <section class="block mt-16" v-if="isEditMode">
          <hr />

          <button class="button px-2 bg-gray-700 text-gray-400" @click="backupStore">
            Backup store
          </button>

          <div class="flex gap-3">
            <input
              class="input flex-1"
              type="text"
              @dblclick="clickFocus"
              v-model="inputSetStore"
              placeholder="Store object"
            />
            <button class="flex-1 button px-2 bg-gray-700 text-gray-400" @click="setStore">
              Set store
            </button>
          </div>
        </section>
      </section>
    </div>

    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { nanoid } from 'nanoid'
import InputClear from '@/components/InputClear.vue'
import IconAdd from '@/components/IconAdd.vue'
import IconDelete from '@/components/IconDelete.vue'
import IconCopy from '@/components/IconCopy.vue'
import IconLink from '@/components/IconLink.vue'
import InputCheckbox from '@/components/InputCheckbox.vue'
import IconContainer from '@/components/IconContainer.vue'
import IconEye from '@/components/IconEye.vue'
import IconEdit from '@/components/IconEdit.vue'
import InputTextArea from '@/components/InputTextArea.vue'

let inputSearch = ref('')

let inputSetStore = ref('')

let renderedString = ref('')

const refLi = ref<Record<string, any>>({})
const refResizer = ref<null | HTMLElement>(null)
const refResize = ref<null | HTMLElement[]>(null)
onMounted(() => {
  resizeAllElements()

  scrollToActive()

  renderedString.value = parseString()
})

function resizeAllElements() {
  nextTick(() => {
    if (refResizer.value) {
      refResizer.value.style.height = '18px'
      refResizer.value.style.height = refResizer.value.scrollHeight + 5 + 'px'
    }

    if (refResize.value) {
      refResize.value.forEach((e) => {
        e.style.height = '18px'
        e.style.height = e.scrollHeight + 5 + 'px'
      })
    }
  })
}

const currentPrompt = computed(() => {
  return store.prompts.find((p: any) => p.id === selectedPrompt.value)
})

const isEditMode = computed(() => {
  return store.editMode
})

const defaultStore = {
  flexRow: true,
  editMode: true,
  render: true,
  prompts: [
    {
      id: nanoid(),
      reuseChat: '7d1613a4-161a-421c-988e-8281ac009e00',
      name: 'Learn jap',
      prompt: 'Schreibe einen prompt mit $0',
      variables: [{ id: nanoid(), text: '', name: '', promptText: '$$' }],
      links: [{ id: nanoid(), url: '', name: '' }]
    }
  ]
}
const storageStore = JSON.parse(localStorage.getItem('store') ?? JSON.stringify(defaultStore))

const store = reactive(storageStore)

watch(store, (store) => {
  localStorage.setItem('store', JSON.stringify(store))
  renderedString.value = parseString()
})

watch(
  () => store.flexRow,
  () => {
    resizeAllElements()
  }
)

const selectedPrompt = ref<string | null>(localStorage.getItem('selectPrompt') ?? null)

watch(selectedPrompt, () => {
  resizeAllElements()
  renderedString.value = parseString()
})

function selectPrompt(id: string) {
  selectedPrompt.value = id

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

function gotoLink(link: any, variable: any) {
  window.open(link.url.replaceAll('$$', variable.text), '_blank')
}

function parseString() {
  if (!currentPrompt.value) {
    return
  }

  let string = currentPrompt.value.prompt ?? ''
  currentPrompt.value.variables.forEach((v: any, index: number) => {
    if (v.text) {
      const promptText = v.promptText.replaceAll(`$$`, v.text)
      string = string.replaceAll(`$${index}`, promptText)
    } else {
      string = string.replaceAll(`$${index}`, '')
    }
  })

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
  return store.prompts.filter((p: any) =>
    p.name.toLowerCase().includes(inputSearch.value.toLowerCase())
  )
})

function addPrompt() {
  const newId = nanoid()
  store.prompts.push({
    id: newId,
    reuseChat: '',
    name: '',
    prompt: '$0',
    variables: [{ id: nanoid(), text: '', name: '', promptText: '$$' }],
    links: [{ id: nanoid(), url: '', name: '' }]
  })
  inputSearch.value = ''

  selectPrompt(newId)

  store.editMode = true

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

  if (store.prompts.length > 0) {
    selectPrompt(store.prompts[store.prompts.length - 1].id)
  } else {
    selectPrompt('')
  }
}

function addVariable() {
  currentPrompt.value?.variables.push({
    id: nanoid(),
    text: '',
    name: '',
    promptText: '$$'
  })
}

function addLink() {
  if (!currentPrompt.value?.links) {
    currentPrompt.value.links = []
  }
  currentPrompt.value?.links.push({ id: nanoid(), url: '', name: '' })
}

function deleteVariable(id: string) {
  if (currentPrompt.value) {
    currentPrompt.value.variables = currentPrompt.value?.variables.filter((v: any) => v.id !== id)
  }
}

function deleteLink(id: string) {
  if (currentPrompt.value) {
    currentPrompt.value.links = currentPrompt.value?.links.filter((v: any) => v.id !== id)
  }
}

function clickFocus(e: any) {
  if (e.target?.select) {
    e.target?.select()
  }
}

function backupStore() {
  copyToClipboard(localStorage.getItem('store') ?? '')
}
function setStore() {
  if (!inputSetStore.value) {
    alert('input empty')
    return
  }

  localStorage.setItem('store', inputSetStore.value)

  inputSetStore.value = ''

  nextTick(() => {
    location.reload()
  })
}
</script>

<template>
  <div class="text-white p-3 min-h-full min-w-full gap-4 grid grid-cols-12 md:flex-row pt-5 pb-24">
    <section class="col-span-12">
      <div class="flex w-full gap-3">
        <button class="h-10" @click="store.showSearch = !store.showSearch">
          <icon-arrow :class="{ 'rotate-90': store.showSearch }" width="25px" />
        </button>

        <div v-if="store.showSearch" class="flex flex-1 gap-3">
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

        <div
          v-if="!store.showSearch"
          class="flex flex-1 gap-3 text-gray-300 items-center"
          @click="store.showSearch = !store.showSearch"
        >
          <span class="block">{{ currentPrompt.name }}</span>
        </div>
      </div>

      <ul v-if="store.showSearch" ref="refList" class="mt-3 max-h-52 overflow-y-auto">
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
              'bg-gray-600': selectedPrompt !== prompt.id,
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

      <hr class="md:mr-3 mt-3 mb-0 border-gray-600" />
    </section>

    <section v-if="currentPrompt" class="col-span-5 flex-1">
      <header class="my-2 flex flex-col justify-between">
        <section>
          <div class="flex items-baseline">
            <input-checkbox v-model="store.render" class="flex-1"
              ><icon-eye fill="#374151" width="25px"
            /></input-checkbox>

            <input-checkbox v-model="store.editMode" class="flex-1"
              ><icon-edit stroke="#374151" width="25px"
            /></input-checkbox>
          </div>
        </section>
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

      <div class="flex justify-between gap-4 mt-4">
        <button class="button flex-1 flex justify-center bg-blue-700" @click="copy">
          <icon-copy width="25px" />
        </button>
        <button class="button flex-1 flex justify-center bg-blue-700" @click="goto">
          <icon-send v-if="!anyLoading" width="25px" />
          <icon-spinner v-if="anyLoading" width="25px" class="animate-spin" />
        </button>
      </div>

      <div
        v-if="store.render"
        class="mt-3 break-words text-sm text-gray-200 p-3 bg-gray-900 rounded shadow whitespace-pre-wrap"
      >
        {{ renderedString }}
      </div>
    </section>

    <section v-if="currentPrompt" class="col-span-7 flex-1 -mx-1">
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
            ><button class="button px-2 bg-red-900 m-0 -mt-1" @click="deleteVariable(variable.id)">
              <icon-delete width="25px" />
            </button>
          </div>
          <div class="text-white" v-if="!isEditMode">
            {{ variable.name || '-' }}
          </div>
        </div>

        <input-text-area
          placeholder="variable"
          v-model="variable.text"
          :readonly="variable.readonly && !isEditMode"
          :clear="!variable.readonly || isEditMode"
        />

        <input-text-area
          placeholder="variable text"
          v-model="variable.promptText"
          v-if="isEditMode"
        />

        <section>
          <div class="grid grid-cols-2" v-if="isEditMode">
            <span class="col-span-2">Scrape</span>
            <input-checkbox v-model="variable.scrapeFrom">from</input-checkbox>
            <input-checkbox v-model="variable.scrapeTo">to</input-checkbox>
            <input-checkbox class="" v-model="variable.readonly">readonly</input-checkbox>
            <input-checkbox class="" v-model="variable.shareTarget">shared</input-checkbox>
            <input-checkbox class="" v-model="variable.fetchOnShare">fetch</input-checkbox>
          </div>

          <div v-if="!isEditMode && variable.scrapeTo">
            <div :key="fromVariable.id" v-for="fromVariable in currentPrompt.variables">
              <div v-if="fromVariable.scrapeFrom">
                <div
                  class="flex items-baseline mb-2"
                  :key="scrape.id"
                  v-for="(scrape, scrapeIndex) in currentPrompt.scrapes"
                >
                  <span class="text-gray-400 text-sm mr-2">
                    <span class="text-white">{{ fromVariable.name }}</span>
                  </span>
                  <span class="text-gray-600 mx-1">???</span>
                  <span class="text-white">{{ scrape.name || 'noname ' + scrapeIndex }}</span>
                  <span class="text-gray-600 mx-1">???</span>

                  <button
                    class="button text-xs shadow-lg bg-gray-700 rounded-lg p-3 mb-1 py-[3px] flex"
                    :class="{ loading: !!scrape.loading }"
                    v-if="fromVariable.id !== variable.id"
                    @click="scrapeToVariable(scrape, fromVariable, variable)"
                  >
                    fetch
                    <icon-spinner v-if="!!scrape.loading" class="ml-2 animate-spin" width="20px" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <button v-if="isEditMode" class="button px-2 bg-green-700 mt-4" @click="addVariable">
        <icon-add width="25px" />
      </button>

      <section>
        <section v-if="!!currentPrompt.links?.length">
          <hr class="mt-6 border-gray-600" />
          <header class="my-2">Links</header>

          <div
            class="bg-gray-900 rounded-lg p-3 mb-1 flex flex-wrap items-center gap-3"
            :key="link.id"
            v-for="(link, indexLink) in currentPrompt.links"
          >
            <span>{{ link.name || 'noname ' + indexLink }}:</span>
            <button
              class="button bg-gray-700 rounded-lg p-3 mb-1 py-[7px]"
              :key="variable.id"
              v-for="(variable, index) in currentPrompt.variables"
              @click="gotoLink(link, variable)"
            >
              {{ variable.name || 'var' + index }} - ${{ index }}
            </button>
          </div>

          <hr class="mr-3" />
        </section>

        <section v-if="isEditMode">
          <hr class="mt-6 border-gray-600" />
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
                placeholder="Name"
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

      <section class="">
        <section v-if="isEditMode">
          <hr class="mt-6 border-gray-600" />
          <header class="my-3">Scrape edit</header>
          <div
            class="bg-gray-900 rounded-lg p-3 mb-1"
            :key="scrape.id"
            v-for="scrape in currentPrompt.scrapes"
          >
            <div class="flex gap-3">
              <input
                class="input"
                type="text"
                @dblclick="clickFocus"
                v-model="scrape.name"
                placeholder="Name"
              />

              <button class="button px-2 bg-red-900 h-11 m-0" @click="deleteScrape(scrape.id)">
                <icon-delete width="25px" />
              </button>
            </div>

            <input
              class="input"
              type="text"
              @dblclick="clickFocus"
              v-model="scrape.url"
              placeholder="eg: https://dic.com/?w=$$"
            />

            <input
              class="input"
              type="text"
              @dblclick="clickFocus"
              v-model="scrape.selector"
              placeholder="Selector"
            />
          </div>

          <button class="button px-2 bg-green-700 mt-4" @click="addScrape">
            <icon-add width="25px" />
          </button>
        </section>
      </section>

      <section class="block mt-16" v-if="isEditMode">
        <hr class="mt-6 mb-6 border-gray-600" />
        <input-checkbox v-model="store.fetchSend">send after fetch</input-checkbox>

        <hr class="mt-6 mb-2 border-gray-600" />
        <hr class="mt-0 border-gray-600" />

        <button class="button px-2 w-full bg-gray-700 text-gray-400" @click="backupStore">
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
          <button
            class="flex-1 button px-2 bg-gray-700 text-gray-400"
            :class="{ 'bg-transparent text-gray-700': !inputSetStore }"
            @click="setStore"
          >
            Set store
          </button>
        </div>
      </section>
    </section>

    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { nanoid } from 'nanoid'
import InputClear from '@/components/InputClear.vue'
import IconAdd from '@/components/IconAdd.vue'
import IconDelete from '@/components/IconDelete.vue'
import IconCopy from '@/components/IconCopy.vue'
import InputCheckbox from '@/components/InputCheckbox.vue'
import IconEye from '@/components/IconEye.vue'
import IconEdit from '@/components/IconEdit.vue'
import InputTextArea from '@/components/InputTextArea.vue'
import IconSpinner from '@/components/IconSpinner.vue'
import IconSend from '@/components/IconSend.vue'
import IconArrow from '@/components/IconArrow.vue'

let inputSearch = ref('')

let inputSetStore = ref('')

let renderedString = ref('')

const refLi = ref<Record<string, any>>({})
const refResizer = ref<null | HTMLElement>(null)
const refResize = ref<null | HTMLElement[]>(null)

const isActive = ref(true)

const handleVisibilityChange = () => {
  isActive.value = document.visibilityState === 'visible'
}

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

onMounted(() => {
  grantPermission()
  window.addEventListener('DOMContentLoaded', () => {
    const parsedUrl = new URL(window.location.toString())
    const title = parsedUrl.searchParams.get('title')
    const text = parsedUrl.searchParams.get('text')
    const url = parsedUrl.searchParams.get('url')
    console.log('Title shared: ' + title)
    console.log('Text shared: ' + text)
    console.log('URL shared: ' + url)
    if (text) {
      nextTick(() => {
        currentPrompt.value.variables.forEach((v: any) => {
          if (v.shareTarget) {
            v.text = text

            const newUrl = `${window.location.pathname}`
            window.history.replaceState({}, '', newUrl)
          }
        })

        currentPrompt.value?.variables.forEach((to: any) => {
          if (to.fetchOnShare) {
            currentPrompt.value?.variables.forEach((from: any) => {
              if (from.scrapeFrom) {
                console.log({ to })
                console.log({ from })

                const res = scrapeToVariable(currentPrompt.value?.scrapes[0], from, to)

                if (store.fetchSend) {
                  nextTick(() => {
                    res.then(() => {
                      goto()
                    })
                  })
                }
              }
            })
          }
        })
      })
    }
  })

  document.addEventListener('visibilitychange', handleVisibilityChange)
  resizeAllElements()

  scrollToActive()

  renderedString.value = parseString()
})

function grantPermission() {
  navigator.permissions
    // eslint-disable-next-line no-undef
    .query({ name: 'clipboard-read' as PermissionName })
    .then((permissionStatus) => {
      console.log(permissionStatus.state)
    })
    .catch((error) => {
      console.error(error)
    })

  navigator.permissions
    // eslint-disable-next-line no-undef
    .query({ name: 'clipboard-write' as PermissionName })
    .then((permissionStatus) => {
      console.log(permissionStatus.state)
    })
    .catch((error) => {
      console.error(error)
    })
}

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
  fetchSend: false,
  showSearch: true,
  flexRow: true,
  readonly: false,
  editMode: true,
  render: true,
  prompts: [
    {
      id: nanoid(),
      reuseChat: '7d1613a4-161a-421c-988e-8281ac009e00',
      name: 'Learn jap',
      prompt: 'Schreibe einen prompt mit $0',
      variables: [
        {
          id: nanoid(),
          text: '',
          name: '',
          promptText: '$$',
          shareTarget: true,
          scrapeFrom: true,
          scrapeTo: false,
          readonly: false,
          fetchOnShare: false,
        },
      ],
      links: [{ id: nanoid(), url: '', name: '' }],
      scrapes: [
        {
          id: nanoid(),
          url: 'https://dictionary.goo.ne.jp/word/$$/',
          name: 'goo',
          selector: '.contents',
          loading: false,
        },
      ],
    },
  ],
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
  },
)

watch(isActive, () => {
  resizeAllElements()
})

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

function scrapeToVariable(scrape: any, fromVariable: any, toVariable: any) {
  const scrapeUrl = import.meta.env.VITE_SCRAPE
  const url = scrape.url.replace('$$', fromVariable.text)

  console.log('Start scrape', { scrapeUrl, url })

  scrape.loading = true

  return fetch(`${scrapeUrl}${encodeURIComponent(url)}`)
    .then((response) => {
      if (response.ok) {
        return response.json()
      }

      throw new Error('Network response was not ok.')
    })
    .then((data) => {
      let container = document.createElement('div')
      container.innerHTML = data.contents

      let scrapedContainer = container.querySelector(scrape.selector)
      if (scrapedContainer) {
        toVariable.text = scrapedContainer.innerText.trim()

        console.log('scrapedPage success', scrapedContainer)
      } else {
        toVariable.text = ''

        console.log('selector', scrape.selector)
        console.log('scrapedPage failed', container)
      }
    })
    .finally(() => (scrape.loading = false))
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
    p.name.toLowerCase().includes(inputSearch.value.toLowerCase()),
  )
})

const anyLoading = computed(() => {
  return currentPrompt?.value.scrapes.some((v: any) => v.loading)
})

function addPrompt() {
  const newId = nanoid()
  store.prompts.push({
    id: newId,
    reuseChat: '',
    name: '',
    prompt: '$0',
    variables: [
      { id: nanoid(), text: 'Wort', name: '', promptText: '$$', scrapeFrom: true, scrapeTo: false },
      {
        id: nanoid(),
        text: 'Kontext',
        name: '',
        promptText: '$$',
        shareTarget: true,
        scrapeFrom: false,
        scrapeTo: true,
        readonly: false,
        fetchOnShare: false,
      },
    ],
    links: [], //[{ id: nanoid(), url: '', name: '' }],
    scrapes: [
      {
        id: nanoid(),
        url: 'https://dictionary.goo.ne.jp/word/$$/',
        name: 'goo',
        selector: '.contents',
        loading: false,
      },
      {
        id: nanoid(),
        url: 'https://www.dwds.de/wb/etymwb/$$/',
        name: 'dwds',
        selector: '.etymwb-entry',
        loading: false,
      },
    ],
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
        inline: 'nearest',
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
    promptText: '$$',
    shareTarget: false,
    scrapeFrom: false,
    scrapeTo: false,
    readonly: false,
    fetchOnShare: false,
  })
}

function deleteVariable(id: string) {
  if (currentPrompt.value) {
    currentPrompt.value.variables = currentPrompt.value?.variables.filter((v: any) => v.id !== id)
  }
}

function addLink() {
  if (!currentPrompt.value?.links) {
    currentPrompt.value.links = []
  }
  currentPrompt.value?.links.push({ id: nanoid(), url: '', name: '' })
}

function deleteLink(id: string) {
  if (currentPrompt.value) {
    currentPrompt.value.links = currentPrompt.value?.links.filter((v: any) => v.id !== id)
  }
}

function addScrape() {
  if (!currentPrompt.value?.scrapes) {
    currentPrompt.value.scrapes = []
  }
  currentPrompt.value?.scrapes.push({ id: nanoid(), url: '', name: '', loading: false })
}

function deleteScrape(id: string) {
  if (currentPrompt.value) {
    currentPrompt.value.scrapes = currentPrompt.value?.scrapes.filter((v: any) => v.id !== id)
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

<template>
  <div
    class="auto-rows-max text-white p-3 min-h-full min-w-full gap-4 grid grid-cols-12 md:flex-row pt-5 pb-24"
  >
    <section class="col-span-12">
      <div class="flex w-full gap-3" :class="{ '-mt-3 -mb-1': !store.showSearch }">
        <button class="h-10" @click="store.showSearch = !store.showSearch">
          <icon-arrow :class="{ 'rotate-90': store.showSearch }" width="25px" />
        </button>

        <div v-show="store.showSearch" class="flex flex-1 gap-3">
          <input-clear
            ref="refInputClear"
            v-model="inputSearch"
            @click="clickFocus"
            @enter="store.showSearch = false"
            placeholder="Search"
            class="flex-1 h-10"
          />
          <button class="button px-2 h-10 bg-green-800" @click="addPrompt">
            <icon-add width="25px" />
          </button>

          <button class="button px-2 h-10 bg-cyan-800" @click="switchToList">
            <component :is="listView ? IconCode : IconGrid" width="25px" />
          </button>
        </div>

        <div
          v-if="!store.showSearch"
          class="flex flex-1 gap-3 text-gray-300 items-center"
          @click="store.showSearch = !store.showSearch"
        >
          <span class="block">{{ currentPrompt?.name ?? 'none' }}</span>
        </div>
      </div>

      <ul v-if="store.showSearch" ref="refList" class="mt-3 max-h-64 overflow-y-auto">
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
            @click="
              () => {
                store.showSearch = false
                selectPrompt(prompt.id)
              }
            "
            class="flex-1 button text-left"
          >
            <icon-star
              :fill="prompt.favorite ? '#fdec3d' : '#fff'"
              class="-ml-2 -mt-3 -mb-2 p-1 mr-1 h-8 inline"
              @click.prevent.stop="onFavorite(prompt.id)"
            />

            {{ prompt.name || '-' }}
          </button>

          <button
            v-if="isEditMode"
            class="button px-2 bg-green-900"
            @click="duplicatePrompt(prompt.id)"
          >
            <icon-copy width="25px" />
          </button>

          <button v-if="isEditMode" class="button px-2 bg-red-900" @click="deletePrompt(prompt.id)">
            <icon-delete width="25px" />
          </button>
        </li>
      </ul>

      <hr class="md:mr-3 mt-3 mb-0 border-gray-600" />
    </section>

    <main
      v-if="listView"
      class="col-span-12 auto-rows-max text-white min-h-full min-w-full gap-4 grid grid-cols-12 md:flex-row"
    >
      <section class="col-span-12 flex-1">
        <header class="my-2">Prompts</header>

        <input-clear
          v-model="inputSearchListPrompt"
          @click="clickFocus"
          placeholder="Search"
          class="mt-1 flex-1 h-10"
        />

        <div class="mt-4 overflow-y-auto max-h-[400px]">
          <div v-for="(prompt, index) in filteredPredefinedDataPrompts" class="mb-4" :key="index">
            <div class="font-bold flex items-center bg-gray-700 rounded-t-lg px-2">
              <div class="flex-1">{{ prompt.name }}</div>
              <button
                class="button py-1 px-2 flex justify-center bg-transparent shadow-none m-0"
                @click="addDefinedPrompt(prompt)"
              >
                <icon-copy width="25px" />
              </button>
            </div>
            <div
              class="shadow-inner bg-gray-900 rounded-b-lg p-2 text-gray-400 whitespace-pre-wrap max-h-32 overflow-y-auto"
            >
              {{ prompt.prompt }}
            </div>
            <div class="text-sm mt-2 pl-2 text-gray-400 whitespace-pre-wrap">{{ prompt.note }}</div>
          </div>
        </div>
      </section>
      <section class="col-span-12">
        <header class="my-2">Scrapes</header>

        <input-clear
          v-model="inputSearchListScrape"
          @click="clickFocus"
          placeholder="Search"
          class="mt-1 flex-1 h-10"
        />

        <div class="mt-4 overflow-y-auto max-h-[400px]">
          <div v-for="(scrape, index) in filteredPredefinedDataScrapes" class="mb-4" :key="index">
            <div class="font-bold flex items-center bg-gray-700 rounded-t-lg px-2">
              <div class="flex-1">{{ scrape.name }}</div>
              <button
                class="button py-1 px-2 flex justify-center bg-transparent shadow-none m-0"
                @click="addDefinedScrape(scrape)"
              >
                <icon-add width="25px" />
              </button>
            </div>
            <div class="bg-gray-900 p-2 rounded-b-lg">
              <div class="text-gray-400 text-sm">{{ scrape.url }}</div>
              <div class="text-sm mt-2 text-gray-500">{{ scrape.selector }}</div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <main
      v-if="!listView"
      class="col-span-12 auto-rows-max text-white min-h-full min-w-full gap-4 grid grid-cols-12 md:flex-row"
    >
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
          ref="refInputName"
        />

        <input-clear
          v-if="isEditMode"
          v-model="currentPrompt.reuseChat"
          placeholder="chat url"
          class="flex-1 mb-2"
        />

        <input-text-area
          placeholder="Prompt text"
          v-model="currentPrompt.prompt"
          :clear="false"
          v-if="isEditMode"
        />

        <div class="flex justify-between gap-4 mt-4 hidden">
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
              <span class="flex-1 flex items-center"> ${{ index }}</span
              ><button
                class="button px-2 bg-red-900 m-0 -mt-1"
                @click="deleteVariable(variable.id)"
              >
                <icon-delete width="25px" />
              </button>
            </div>
            <div class="text-white flex-1" v-if="!isEditMode">
              {{ variable.name || '-' }}
            </div>
            <button
              class="text-xs bg-blue-800/20 text-gray-400 rounded px-2 py-1"
              v-if="!isEditMode"
              @click="addShareHistory(variable.text)"
            >
              to shared
            </button>
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
              <input-checkbox class="" v-model="variable.canClear">can clear</input-checkbox>
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
                    <span class="text-gray-600 mx-1">►</span>
                    <span class="text-white">{{ scrape.name || 'noname ' + scrapeIndex }}</span>
                    <span class="text-gray-600 mx-1">►</span>

                    <button
                      class="button text-xs shadow-lg bg-gray-700 rounded-lg p-3 mb-1 py-[3px] flex"
                      :class="{ loading: !!scrape.loading }"
                      v-if="fromVariable.id !== variable.id"
                      @click="scrapeToVariable(scrape, fromVariable, variable)"
                    >
                      fetch
                      <icon-spinner
                        v-if="!!scrape.loading"
                        class="ml-2 animate-spin"
                        width="20px"
                      />
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

              <div class="flex align-baseline-center">
                <input
                  class="input mr-2 col-span-1"
                  type="number"
                  @dblclick="clickFocus"
                  v-model="scrape.clipLength"
                  placeholder="Clip after Char"
                />

                <input-checkbox class="h-10 col-span-1" v-model="scrape.clipHard"
                  >cut</input-checkbox
                >
              </div>

              <input-checkbox
                class="h-10"
                v-model="scrape.fetchOnShare"
                @click="deSelectAllScrapeFetchOnShare"
                >auto fetch</input-checkbox
              >
            </div>

            <button class="button px-2 bg-green-700 mt-4" @click="addScrape">
              <icon-add width="25px" />
            </button>
          </section>

          <section v-if="isEditMode">
            <hr class="mt-4 border-gray-600" />

            <small>Prompt copied x times</small>
            <input-clear
              v-model="inputCopied"
              type="number"
              placeholder="Copied"
              class="flex-1 h-10"
            />
          </section>

          <section class="block mt-16" v-if="isEditMode">
            <hr class="mt-6 mb-6 border-gray-600" />
            <input-checkbox v-model="store.fetchSend">send after fetch</input-checkbox>

            <hr class="my-6 border-gray-600" />

            <button class="button px-2 w-full bg-gray-700 text-gray-400" @click="backupStore">
              Backup prompts
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
                Set prompts
              </button>
            </div>
          </section>
        </section>
      </section>
    </main>

    <RouterView />
  </div>

  <section class="mt-0 mb-12 px-2 text-white">
    <section class="text-sm mt-3 text-gray-400">
      <div>Clicked {{ currentPrompt.copied }}</div>
      <div>Last copied {{ formatDate(currentPrompt.copiedAt) }}</div>
    </section>

    <header class="my-2">Shared history</header>
    <div
      class="bg-slate-900 mb-2 rounded-md p-2"
      :key="index"
      v-for="(history, index) in store.sharedHistory"
    >
      <div class="flex">
        <div class="truncate flex-1 text-ellipsis whitespace-nowrap block">
          {{ history || '-empty-' }}
        </div>
        <button class="p-2 bg-slate-800 rounded-lg" @click="removeShareHistory(index)">
          <icon-delete class="h-3" />
        </button>
      </div>

      <div class="flex flex-wrap gap-2 mt-2">
        <div :key="vIndex" v-for="(fromVariable, vIndex) in currentPrompt.variables">
          <button
            class="button text-xs shadow-lg bg-gray-700 rounded-lg px-3 mb-1 py-[5px] flex"
            @click="pasteShareHistory(index, fromVariable)"
          >
            {{ fromVariable.name }}
          </button>
        </div>
      </div>
    </div>
  </section>
  <!--  float margin    -->
  <div class="h-[90px] w-full"></div>

  <div class="w-full h-[60px] flex-col fixed bottom-0 backdrop-blur-sm shadow-t flex p-2" style="">
    <div class="absolute -mt-8 text-white text-sm" style="text-shadow: #000 1px 0 10px">
      {{ currentPrompt?.name ?? 'none' }}
    </div>
    <div class="flex w-full">
      <div class="flex flex-1 gap-4 h-full">
        <button class="button bg-blue-700/25 mb-0" @click="toggleSearch">
          <icon-magnifying width="25px" />
        </button>
      </div>
      <div class="flex flex-1 justify-end gap-4 h-full" v-if="currentPrompt">
        <button class="button bg-blue-700 mb-0" @click="applyShared">
          <span
            class="font-normal absolute -mt-8 text-xs text-left -ml-7 truncate"
            style="max-width: 70px"
            >{{ currentShared }}</span
          >
          <icon-share width="25px" />
        </button>
        <button class="button bg-blue-700 mb-0" @click="openFirstLink">
          <icon-link width="25px" />
        </button>

        <button class="button bg-blue-700 mb-0" @click="copy">
          <icon-copy width="25px" />
        </button>
        <button class="button bg-lime-700 mb-0" @click="goto">
          <icon-send v-if="!anyLoading" width="25px" />
          <icon-spinner v-if="anyLoading" width="25px" class="animate-spin" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shadow-t {
  box-shadow: 0 -4px 12px 20px rgb(4 4 4 / 27%);
}
</style>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import {
  computed,
  type ComputedRef,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  type Ref,
  ref,
  watch,
} from 'vue'
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
import IconGrid from '@/components/IconGrid.vue'
import IconCode from '@/components/IconCode.vue'
import predefinedData from '@/predefinedData'
import IconStar from '@/components/IconStar.vue'
import type { Prompt, Store } from '@/types'
import IconMagnifying from '@/components/IconMagnifying.vue'
import IconShare from '@/components/IconShare.vue'
import IconLink from '@/components/IconLink.vue'

const maxShareHistory = 10

let listView = ref(false)

function switchToList() {
  listView.value = !listView.value
}

let inputSearch = ref('')
let inputSearchListPrompt = ref('')
let inputSearchListScrape = ref('')
const refInputName = ref(null)

let inputSetStore = ref('')

const refInputClear = ref(null)

const inputCopied = computed({
  get: () => '' + currentPrompt.value.copied,
  set: (value) => (currentPrompt.value.copied = +(typeof value === 'number' ? '' + value : '0')),
})

let renderedString = ref('')

const refLi = ref<Record<string, any>>({})
const refResizer = ref<null | HTMLElement>(null)
const refResize = ref<null | HTMLElement[]>(null)

const isActive = ref(true)

const handleVisibilityChange = () => {
  isActive.value = document.visibilityState === 'visible'

  store.showSearch = false
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
        addShareHistory(text)

        if (!currentPrompt.value) {
          return
        }

        currentPrompt.value.variables.forEach((v: any) => {
          if (v.canClear) {
            v.text = ''
          }
          if (v.shareTarget) {
            v.text = text

            const newUrl = `${window.location.pathname}`
            window.history.replaceState({}, '', newUrl)
          }
        })

        scrapeFromTo()
      })
    }
  })

  document.addEventListener('visibilitychange', handleVisibilityChange)
  resizeAllElements()

  setTimeout(() => {
    scrollToActive()
  }, 80)

  renderedString.value = parseString()

  store.showSearch = false
})

function toggleSearch() {
  if (store.showSearch && !refInputClear.value.isFocused()) {
    refInputClear.value.focus()
    return
  }

  store.showSearch = !store.showSearch

  if (store.showSearch) {
    refInputClear.value.focus()
  }
}

function formatDate(isoDate) {
  if (!isoDate) {
    return '-'
  }

  try {
    const date = new Date(isoDate)
    const time = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    const dateString = date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    return `${time} ${dateString}`
  } catch (e) {
    return '-'
  }
}

function addDefinedPrompt(prompt) {
  console.log(prompt)
  currentPrompt.value.prompt = prompt.prompt
}
function addDefinedScrape(scrape) {
  console.log(scrape)
  if (!currentPrompt.value?.scrapes) {
    currentPrompt.value.scrapes = []
  }
  currentPrompt.value?.scrapes.push({
    id: nanoid(),
    url: scrape.url,
    name: scrape.name,
    selector: scrape.selector,
    loading: scrape.loading,
    fetchOnShare: scrape.fetchOnShare,
    clipHard: scrape.clipHard,
    clipLength: scrape.clipLength,
  })
}

function scrapeFromTo() {
  currentPrompt.value?.variables.forEach((to: any) => {
    if (to.fetchOnShare) {
      currentPrompt.value?.variables.forEach((from: any) => {
        if (from.scrapeFrom) {
          console.log({ to })
          console.log({ from })

          const foundScrape =
            currentPrompt.value?.scrapes.find((s: any) => s.fetchOnShare) ??
            currentPrompt.value?.scrapes[0]

          const res = scrapeToVariable(foundScrape, from, to)

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
}

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

function addShareHistory(txt) {
  console.log(txt.value)
  if (!store.sharedHistory) {
    store.sharedHistory = []
  }

  store.sharedHistory = [txt, ...store.sharedHistory]

  store.sharedHistory = [...store.sharedHistory.slice(0, maxShareHistory)]
}
function removeShareHistory(indexOf) {
  if (!store.sharedHistory) {
    store.sharedHistory = []
  }

  if (indexOf !== -1) {
    store.sharedHistory = [
      ...store.sharedHistory.slice(0, indexOf),
      ...store.sharedHistory.slice(indexOf + 1),
    ]
  }
  return store.sharedHistory
}

function pasteShareHistory(index, variable) {
  if (index !== 0) {
    addShareHistory(store.sharedHistory[index])
  }

  variable.text = store.sharedHistory[index]

  scrapeFromTo()

  window.scrollTo(0, 0)
}

function deSelectAllScrapeFetchOnShare() {
  currentPrompt.value?.scrapes.forEach((s: any) => (s.fetchOnShare = false))
}

function resizeAllElements() {
  nextTick(() => {
    if (refResizer.value) {
      if ('style' in refResizer.value) {
        refResizer.value.style.height = '18px'
        refResizer.value.style.height = refResizer.value.scrollHeight + 5 + 'px'
      }
    }

    if (refResize.value) {
      refResize.value?.forEach((e) => {
        e.style.height = '18px'
        e.style.height = e.scrollHeight + 5 + 'px'
      })
    }
  })
}

const currentPrompt: ComputedRef<Prompt | undefined> = computed(() => {
  return store.prompts.find((p: any) => p.id === selectedPrompt.value)
})

const currentShared: ComputedRef<string | undefined> = computed(() => {
  return store.sharedHistory[0] ?? ''
})

const isEditMode = computed(() => {
  return store.editMode
})

const defaultStore: Store = {
  fetchSend: false,
  showSearch: true,
  flexRow: true,
  readonly: false,
  editMode: true,
  render: true,
  sharedHistory: [],
  prompts: [
    {
      id: nanoid(),
      reuseChat: '',
      name: 'Learn jap',
      prompt: 'Schreibe einen prompt mit $0',
      variables: [
        {
          id: nanoid(),
          text: '',
          name: 'Wort',
          promptText: '$$',
          shareTarget: true,
          scrapeFrom: true,
          scrapeTo: false,
          readonly: false,
          fetchOnShare: false,
          canClear: true,
        },
        {
          id: nanoid(),
          text: '',
          name: 'Kontext',
          promptText: '$$',
          shareTarget: false,
          scrapeFrom: false,
          scrapeTo: true,
          readonly: false,
          fetchOnShare: true,
          canClear: true,
        },
      ],
      links: [],
      scrapes: [
        {
          id: nanoid(),
          url: 'https://dictionary.goo.ne.jp/word/$$/',
          name: 'goo',
          selector: '.contents',
          loading: false,
          fetchOnShare: false,
          clipHard: false,
          clipLength: 2500,
        },
      ],
    },
  ],
}
const storageStore: Store = JSON.parse(
  localStorage.getItem('store') ?? JSON.stringify(defaultStore),
)

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

watch(
  () => inputSearch.value,
  () => {
    filteredStore.value[0]?.id && selectPrompt(filteredStore.value[0]?.id)
  },
)

watch(isActive, () => {
  resizeAllElements()
  scrollToActive()
})

const selectedPrompt: Ref<string | null> = ref<string | null>(
  localStorage.getItem('selectPrompt') ?? null,
)

watch(selectedPrompt, () => {
  resizeAllElements()
  renderedString.value = parseString()
})

function selectPrompt(id: string) {
  selectedPrompt.value = id

  localStorage.setItem('selectPrompt', id)
}

function applyShared() {
  if (store.sharedHistory[0] && currentPrompt.value?.variables[0]) {
    currentPrompt.value.variables[0].text = store.sharedHistory[0]
    window.scrollTo(0, 0)
    nextTick(function () {
      scrapeFromTo()
    })
  }
}

function openFirstLink() {
  if (currentPrompt.value?.links[0] && currentPrompt.value?.variables[0]) {
    gotoLink(currentPrompt.value.links[0], currentPrompt.value?.variables[0])
  }
}

function copy() {
  const string = parseString()
  copyToClipboard(string)

  currentPrompt.value.copiedAt = new Date().toISOString()

  if (currentPrompt.value) {
    currentPrompt.value.copied ??= 0
    currentPrompt.value.copied = +currentPrompt.value.copied + 1
  }
  return string
}

function goto() {
  copy()
  if (currentPrompt.value?.reuseChat) {
    window.open(currentPrompt.value.reuseChat, '_blank')
  } else {
    window.open('https://chat.openai.com/chat', '_blank')
  }
}

function gotoLink(link: any, variable: any) {
  window.open(link.url.replaceAll('$$', variable.text), '_blank')
}

function scrapeToVariable(scrape: any, fromVariable: any, toVariable: any) {
  const scrapeUrl: string = import.meta.env.VITE_SCRAPE
  const url = scrape.url.replace('$$', fromVariable.text)

  console.log('Start scrape', { scrapeUrl, url })

  scrape.loading = true

  toVariable.text = ''

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

      const elements = container.getElementsByTagName('script')
      while (elements.length > 0) {
        elements[0]?.parentNode?.removeChild(elements[0]!)
      }

      let scrapedContainer = container.querySelector(scrape.selector)
      if (scrapedContainer) {
        let txt = scrapedContainer.innerText.trim()

        txt = txt.replace(/\s{5,}/gm, '  ')

        if (+scrape.clipLength > 0) {
          const clipLength = +scrape.clipLength
          if (scrape.clipHard) {
            txt = txt.slice(0, clipLength + 1)
          } else {
            const sep = '\n\n====--====\n\n'
            txt = txt.slice(0, clipLength + 1) + sep + txt.slice(clipLength + 1)
          }
        }

        toVariable.text = txt

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

const filteredStore: ComputedRef<Prompt[]> = computed(() => {
  const isSearch = !!inputSearch.value

  let prompts = inputSearch.value
    ? fuzzySearch(inputSearch.value, store.prompts, 'name')
    : store.prompts
  return prompts.sort((a, b) => {
    if (a.favorite && !b.favorite) return -1
    if (!a.favorite && b.favorite) return 1
    if (!isSearch) {
      return (b.copied ?? 0) - (a.copied ?? 0)
    }

    return 0
  })
})

function fuzzySearch(input, objects, key) {
  const terms = input.toLowerCase().split(/\s+/)
  const concatenatedTerms = terms.join('') // Concatenate all terms for sequential matching

  return objects
    .map((obj) => {
      const value = obj[key].toLowerCase()
      let termMatchScore = 0
      let allTermsMatch = true
      let concatenatedMatchScore = 0
      let concatenatedMatchIndex = 0

      // Check each term is in the string
      terms.forEach((term) => {
        let termIndex = value.indexOf(term)
        if (termIndex === -1) {
          allTermsMatch = false
        } else {
          termMatchScore += value.length - termIndex // Score term based on position
        }
      })

      // Check concatenated terms match in sequence
      for (let char of concatenatedTerms) {
        let charIndex = value.indexOf(char, concatenatedMatchIndex)
        if (charIndex !== -1 && charIndex >= concatenatedMatchIndex) {
          concatenatedMatchScore++
          concatenatedMatchIndex = charIndex + 1
        } else {
          concatenatedMatchScore = 0
          break
        }
      }

      // If not all terms match, give a score of 0
      if (!allTermsMatch) {
        termMatchScore = 0
      }

      // Combine scores from term matches and sequential character match
      let totalScore = termMatchScore + concatenatedMatchScore

      return { obj, score: totalScore }
    })
    .filter((item) => item.score > 0) // Keep only items that match all terms or the sequential characters
    .sort((a, b) => b.score - a.score || a.obj[key].localeCompare(b.obj[key])) // Sort by score, then alphabetically
    .map((item) => item.obj) // Return the objects, not the score wrapper
}

const filteredPredefinedDataPrompts = computed(() => {
  return predefinedData.prompts
    .filter((p: any) => p.name.toLowerCase().includes(inputSearchListPrompt.value.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))
})
const filteredPredefinedDataScrapes = computed(() => {
  return predefinedData.scrapes
    .filter((p: any) => p.name.toLowerCase().includes(inputSearchListScrape.value.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))
})

const anyLoading = computed(() => {
  return currentPrompt?.value.scrapes.some((v: any) => v.loading)
})

function addPrompt() {
  const newId = nanoid()
  const prompt: Prompt = {
    id: newId,
    reuseChat: '',
    name: '',
    prompt: '$0',
    variables: [
      {
        id: nanoid(),
        text: '',
        name: 'Wort',
        promptText: '$$',
        scrapeFrom: true,
        shareTarget: true,
        scrapeTo: false,
        readonly: false,
        fetchOnShare: false,
        canClear: true,
      },
      {
        id: nanoid(),
        text: '',
        name: 'Kontext',
        promptText: '$$',
        shareTarget: false,
        scrapeFrom: false,
        scrapeTo: true,
        readonly: false,
        fetchOnShare: true,
        canClear: true,
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
        fetchOnShare: false,
        clipHard: true,
        clipLength: 2500,
      },
      {
        id: nanoid(),
        url: 'https://www.dwds.de/wb/etymwb/$$/',
        name: 'dwds',
        selector: '.etymwb-entry',
        loading: false,
        fetchOnShare: false,
        clipHard: true,
        clipLength: 2500,
      },
    ],
  }
  store.prompts.push(prompt)
  inputSearch.value = ''

  selectPrompt(newId)

  store.editMode = true

  scrollToActive()

  focusInputName()
}

function focusInputName() {
  setTimeout(() => {
    refInputName.value?.$el.querySelector('input').focus()
  }, 200)
}

function scrollToActive() {
  nextTick(() => {
    if (refLi.value && selectedPrompt.value) {
      refLi.value[selectedPrompt.value]?.scrollIntoView({
        behavior: 'auto',
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

function onFavorite(index: string) {
  store.prompts.find((p) => p.id === index).favorite = !store.prompts.find((p) => p.id === index)
    .favorite
}

function duplicatePrompt(index: string) {
  const copied = JSON.parse(JSON.stringify(store.prompts.find((p) => p.id === index)))
  copied.id = nanoid()
  store.prompts.push(copied)

  selectPrompt(copied.id)
  scrollToActive()
  focusInputName()
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
    canClear: true,
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
  currentPrompt.value?.scrapes.push({
    selector: '',
    id: nanoid(),
    url: '',
    name: '',
    loading: false,
    fetchOnShare: false,
    clipHard: true,
    clipLength: 2500,
  })
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

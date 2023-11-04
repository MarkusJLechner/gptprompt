export interface Variable {
  id: string
  text: string
  name: string
  promptText: string
  shareTarget: boolean
  scrapeFrom: boolean
  scrapeTo: boolean
  readonly: boolean
  fetchOnShare: boolean
  canClear: boolean
}

export interface Link {
  id: string
  url: string
  name: string
}

export interface Scrape {
  id: string
  url: string
  name: string
  selector: string
  loading: boolean
  fetchOnShare: boolean
  clipHard: boolean
  clipLength: number
}

export interface Prompt {
  id: string
  reuseChat: string
  name: string
  prompt: string
  variables: Variable[]
  favorite?: boolean
  links?: Link[]
  scrapes?: Scrape[]
  copiedAt?: string
  copied?: number
}

export interface Store {
  fetchSend: boolean
  showSearch: boolean
  flexRow: boolean
  readonly: boolean
  editMode: boolean
  render: boolean
  sharedHistory: string[]
  prompts: Prompt[]
}

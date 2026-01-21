import { atom } from 'jotai'

export interface MusicTrack {
  id: string
  title: string
  artist?: string
  cover: string
  url: string
}

export interface MusicPlayerState {
  isPlaying: boolean
  isExpanded: boolean
  currentTrack: MusicTrack | null
  progress: number
}

type MusicPlayerAction =
  | { type: 'toggle' }
  | { type: 'toggleExpand' }
  | { type: 'update'; payload: Partial<MusicPlayerState> }

export const musicPlayerAtom = atom<MusicPlayerState>({
  isPlaying: false,
  isExpanded: false,
  currentTrack: null,
  progress: 0,
})

export const musicControlsAtom = atom(
  (get) => get(musicPlayerAtom),
  (get, set, action: MusicPlayerAction) => {
    const current = get(musicPlayerAtom)

    switch (action.type) {
      case 'toggle':
        set(musicPlayerAtom, { ...current, isPlaying: !current.isPlaying })
        break
      case 'toggleExpand':
        set(musicPlayerAtom, { ...current, isExpanded: !current.isExpanded })
        break
      case 'update':
        set(musicPlayerAtom, { ...current, ...action.payload })
        break
    }
  }
)

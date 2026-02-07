export interface Word {
  id: string;
  english: string;
  chinese: string;
  selected: boolean;
  groupId?: string; // Optional: if undefined/null, it might belong to 'Default' or just general
  createdAt: number;
  playCount: number;
}

export interface Group {
  id: string;
  name: string;
}

export enum AppState {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED'
}

export type SequenceItem = 'english' | 'chinese' | 'spell';

export interface PlayerSettings {
  durationMinutes: number;
  playbackRate: number;
  sequence: SequenceItem[];
}

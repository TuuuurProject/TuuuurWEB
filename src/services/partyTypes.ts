// Types de partie de l'API (ref.PartyType_PTY / enum PartyTypeType côté .NET)
export const PARTY_TYPE = {
  GROUP: 1,
  RANKED: 2,
  SOLO: 3,
} as const

export type PartyModeKey = 'solo' | 'group' | 'ranked'

const KEYS: Record<number, PartyModeKey> = {
  [PARTY_TYPE.GROUP]: 'group',
  [PARTY_TYPE.RANKED]: 'ranked',
  [PARTY_TYPE.SOLO]: 'solo',
}

/** Clé de mode (solo, group, ranked) à partir de l'id renvoyé par l'API */
export const partyModeKey = (id: number | undefined | null): PartyModeKey =>
  (id != null && KEYS[id]) || 'solo'

/** Icône Font Awesome associée à chaque mode */
export const PARTY_MODE_ICON: Record<PartyModeKey, string> = {
  solo: 'bullseye',
  group: 'users',
  ranked: 'bolt',
}

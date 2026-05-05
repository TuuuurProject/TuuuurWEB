export interface Match {
  id: string
  dt: string
  idPartyType: number
  idUserHost: string
  active: boolean
  finish: boolean
  score: number
  nbQuestions: number
  percent?: number
  time?: number
  partyType: PartyType
  partyDifficulty: PartyDifficulty[]
  partyTheme: PartyTheme[]
}

export interface PartyType {
  id: number
  label: string
}

export interface PartyDifficulty {
  id: number
  idParty: string
  idDifficulty: number
  difficulty: Difficulty
}

export interface Difficulty {
  id: number
  label: string
}

export interface PartyTheme {
  id: number
  idParty: string
  idTheme: number
  theme: Theme
}

export interface Theme {
  id: number
  icon: string
  label: string
}

export function getMockHistory(page: number = 1, size: number = 7) {
  const matches: Match[] = [
    {
      id: 'match-1',
      dt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Yesterday
      idPartyType: 1,
      idUserHost: '1',
      active: false,
      finish: true,
      score: 80,
      nbQuestions: 10,
      percent: 80,
      time: 120,
      partyType: { id: 1, label: 'Solo' },
      partyDifficulty: [
        {
          id: 1,
          idParty: 'match-1',
          idDifficulty: 2,
          difficulty: { id: 2, label: 'Moyen' },
        },
      ],
      partyTheme: [
        {
          id: 1,
          idParty: 'match-1',
          idTheme: 1,
          theme: { id: 1, icon: 'wand-magic-sparkles', label: 'Général' },
        },
      ],
    },
    {
      id: 'match-2',
      dt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      idPartyType: 1,
      idUserHost: '1',
      active: false,
      finish: true,
      score: 60,
      nbQuestions: 10,
      percent: 60,
      time: 150,
      partyType: { id: 1, label: 'Solo' },
      partyDifficulty: [
        {
          id: 2,
          idParty: 'match-2',
          idDifficulty: 1,
          difficulty: { id: 1, label: 'Facile' },
        },
      ],
      partyTheme: [
        {
          id: 2,
          idParty: 'match-2',
          idTheme: 2,
          theme: { id: 2, icon: 'university', label: 'Histoire' },
        },
      ],
    },
    {
      id: 'match-3',
      dt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
      idPartyType: 2,
      idUserHost: '1',
      active: false,
      finish: true,
      score: 90,
      nbQuestions: 15,
      percent: 90,
      time: 180,
      partyType: { id: 2, label: 'Groupe' },
      partyDifficulty: [
        {
          id: 3,
          idParty: 'match-3',
          idDifficulty: 3,
          difficulty: { id: 3, label: 'Difficile' },
        },
      ],
      partyTheme: [
        {
          id: 3,
          idParty: 'match-3',
          idTheme: 3,
          theme: { id: 3, icon: 'flask', label: 'Science' },
        },
      ],
    },
  ]

  const start = (page - 1) * size
  const end = start + size
  const paginatedMatches = matches.slice(start, end)

  return {
    history: paginatedMatches,
    totalParties: matches.length,
    currentPage: page,
    totalPages: Math.ceil(matches.length / size),
  }
}

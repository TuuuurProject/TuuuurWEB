export interface Theme {
  id: number
  icon: string
  label: string
}

export interface Difficulty {
  id: number
  label: string
}

export interface Question {
  id: number
  question: string
  answers: Answer[]
  correctAnswerId?: number
}

export interface Answer {
  id: number
  text: string
  isCorrect?: boolean
}

export interface PartyInfo {
  id: string
  active: boolean
  finish: boolean
  score: number
  nbQuestions: number
  currentQuestionIndex: number
  partyQuestions: PartyQuestion[]
}

export interface PartyQuestion {
  id: number
  idParty: string
  idQuestion: number
  question: Question
  userAnswerId: number | null
  isCorrect: boolean | null
}

let partyIdCounter = 1000

export function createSoloParty(
  themes: number[],
  difficulties: number[],
  nbQuestions: number,
): string {
  const partyId = `solo-${partyIdCounter++}`

  // Store the party data for later retrieval
  const partyData: PartyInfo = {
    id: partyId,
    active: true,
    finish: false,
    score: 0,
    nbQuestions,
    currentQuestionIndex: 0,
    partyQuestions: generateMockQuestions(partyId, nbQuestions),
  }

  // Store in memory (could be in a Map for real app)
  ;(globalThis as any).__mockParties = (globalThis as any).__mockParties || {}
  ;(globalThis as any).__mockParties[partyId] = partyData

  return partyId
}

export function getPartyInfo(partyId: string): PartyInfo | null {
  const parties = (globalThis as any).__mockParties || {}
  return parties[partyId] || null
}

export function answerQuestion(partyId: string, answerId: number | null): PartyInfo | null {
  const party = getPartyInfo(partyId)
  if (!party) return null

  const currentQuestion = party.partyQuestions[party.currentQuestionIndex]
  if (currentQuestion) {
    currentQuestion.userAnswerId = answerId

    // Check if answer is correct
    const correctAnswer = currentQuestion.question.answers.find((a) => a.isCorrect)
    currentQuestion.isCorrect = correctAnswer?.id === answerId

    if (currentQuestion.isCorrect) {
      party.score += 10
    }

    party.currentQuestionIndex++

    if (party.currentQuestionIndex >= party.nbQuestions) {
      party.finish = true
      party.active = false
    }
  }

  return party
}

function generateMockQuestions(partyId: string, count: number): PartyQuestion[] {
  const questions: PartyQuestion[] = []
  const mockQuestions = [
    {
      question: 'Quelle est la capitale de la France ?',
      answers: [
        { text: 'Paris', isCorrect: true },
        { text: 'Londres', isCorrect: false },
        { text: 'Berlin', isCorrect: false },
        { text: 'Madrid', isCorrect: false },
      ],
    },
    {
      question: 'Combien font 2 + 2 ?',
      answers: [
        { text: '3', isCorrect: false },
        { text: '4', isCorrect: true },
        { text: '5', isCorrect: false },
        { text: '6', isCorrect: false },
      ],
    },
    {
      question: 'Quel est le plus grand océan du monde ?',
      answers: [
        { text: 'Atlantique', isCorrect: false },
        { text: 'Indien', isCorrect: false },
        { text: 'Pacifique', isCorrect: true },
        { text: 'Arctique', isCorrect: false },
      ],
    },
    {
      question: 'En quelle année a eu lieu la Révolution française ?',
      answers: [
        { text: '1789', isCorrect: true },
        { text: '1776', isCorrect: false },
        { text: '1804', isCorrect: false },
        { text: '1815', isCorrect: false },
      ],
    },
    {
      question: 'Qui a peint la Joconde ?',
      answers: [
        { text: 'Picasso', isCorrect: false },
        { text: 'Van Gogh', isCorrect: false },
        { text: 'Léonard de Vinci', isCorrect: true },
        { text: 'Monet', isCorrect: false },
      ],
    },
  ]

  for (let i = 0; i < count; i++) {
    const mockQ = mockQuestions[i % mockQuestions.length]
    const answersWithIds = mockQ.answers.map((a, idx) => ({
      id: i * 10 + idx + 1,
      text: a.text,
      isCorrect: a.isCorrect,
    }))

    questions.push({
      id: i + 1,
      idParty: partyId,
      idQuestion: i + 1,
      question: {
        id: i + 1,
        question: mockQ.question,
        answers: answersWithIds,
      },
      userAnswerId: null,
      isCorrect: null,
    })
  }

  return questions
}

export interface GroupLobby {
  code: string
  hostId: number
  players: GroupPlayer[]
  categories: string[]
  questions: number
  shuffle: boolean
  specifics: string
}

export interface GroupPlayer {
  id: number
  name: string
  emoji: string
  ready: boolean
}

export function createGroupLobby(): GroupLobby {
  // Generate a secure random code using crypto API
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  const code = array[0].toString(36).substring(0, 6).toUpperCase().padEnd(6, '0')

  return {
    code,
    hostId: 1,
    players: [{ id: 1, name: 'TestUser', emoji: '👤', ready: true }],
    categories: ['general'],
    questions: 10,
    shuffle: true,
    specifics: '',
  }
}

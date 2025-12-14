import { http, HttpResponse } from 'msw'
import { mockUsers, createMockToken, getMockUserInfo, type UserInfo } from './data/user'
import { createSoloParty, getPartyInfo, answerQuestion, createGroupLobby } from './data/games'
import { getMockHistory } from './data/history'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7260/api/v1/'

console.log('[MSW Handlers] API_URL configured as:', API_URL)

// Session storage to track verification codes
const verificationCodes = new Map<string, string>()

export const handlers = [
  // AUTH: Login
  http.post(`${API_URL}auth/login`, async ({ request }) => {
    console.log('[MSW] Intercepting POST auth/login')
    const body = (await request.json()) as { login: string; password: string }
    const user = mockUsers[body.login as keyof typeof mockUsers]

    if (!user || user.password !== body.password) {
      return HttpResponse.json(
        {
          errors: {
            login: ['Identifiants invalides'],
          },
        },
        { status: 401 },
      )
    }

    // Simulate 2FA requirement
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    verificationCodes.set(body.login, code)
    console.log(`[MSW] 2FA code for ${body.login}: ${code}`)

    return HttpResponse.json(true)
  }),

  // AUTH: Verify 2FA
  http.post(`${API_URL}auth/2fa/verify`, async ({ request }) => {
    console.log('[MSW] Intercepting POST auth/2fa/verify')
    const body = (await request.json()) as { login: string; code: string }

    console.log('[MSW] 2FA verification for:', body.login, 'with code:', body.code)

    // In E2E mode, accept any 6-digit code for simplicity
    if (!body.code || body.code.length !== 6) {
      return HttpResponse.json(
        { errors: { code: ['Code invalide (6 chiffres requis)'] } },
        { status: 400 },
      )
    }

    const user = mockUsers[body.login as keyof typeof mockUsers]
    if (!user) {
      return HttpResponse.json({ errors: { login: ['Utilisateur non trouvé'] } }, { status: 404 })
    }

    const token = createMockToken(user.nickName, user.email)
    verificationCodes.delete(body.login)

    console.log('[MSW] 2FA verification successful, token generated')
    return HttpResponse.json({
      token: { token },
    })
  }),

  // AUTH: Register
  http.post(`${API_URL}auth/register`, async ({ request }) => {
    const body = await request.json()

    // Mock successful registration
    return HttpResponse.json({
      success: true,
      message: 'Compte créé avec succès',
    })
  }),

  // AUTH: Google login
  http.post(`${API_URL}auth/google`, async ({ request }) => {
    const body = (await request.json()) as { token: string }

    // Mock Google login
    const token = createMockToken('GoogleUser', 'google@example.com')

    return HttpResponse.json({
      token: { token },
    })
  }),

  // USER: Get user info
  http.get(`${API_URL}me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Extract user info from token (simplified)
    const userInfo: UserInfo = {
      nickName: 'TestUser',
      email: 'test@example.com',
      avatar: mockUsers.testuser.avatar,
    }

    return HttpResponse.json(userInfo)
  }),

  // USER: Update avatar
  http.put(`${API_URL}me/avatar`, async ({ request }) => {
    const body = (await request.json()) as { avatar: string }

    return HttpResponse.json({
      success: true,
      avatar: body.avatar,
    })
  }),

  // USER: Change password
  http.put(`${API_URL}me/change-password`, async ({ request }) => {
    const body = (await request.json()) as {
      currentPassword: string
      newPassword: string
    }

    return HttpResponse.json({
      success: true,
      message: 'Mot de passe modifié',
    })
  }),

  // USER: Delete account
  http.delete(`${API_URL}me`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Compte supprimé',
    })
  }),

  // SOLO: Create party
  http.post(`${API_URL}solo`, async ({ request }) => {
    const body = (await request.json()) as {
      themes: number[]
      difficulties: number[]
      nbQuestions: number
    }

    const partyId = createSoloParty(body.themes, body.difficulties, body.nbQuestions)

    return HttpResponse.json(partyId)
  }),

  // SOLO: Get party info
  http.get(`${API_URL}solo/:id`, ({ params }) => {
    const { id } = params
    const partyInfo = getPartyInfo(id as string)

    if (!partyInfo) {
      return HttpResponse.json({ error: 'Partie non trouvée' }, { status: 404 })
    }

    return HttpResponse.json(partyInfo)
  }),

  // SOLO: Answer question
  http.post(`${API_URL}solo/:id`, async ({ params, request }) => {
    const { id } = params
    const body = (await request.json()) as { answerId: number | null }

    const updatedParty = answerQuestion(id as string, body.answerId)

    if (!updatedParty) {
      return HttpResponse.json({ error: 'Partie non trouvée' }, { status: 404 })
    }

    return HttpResponse.json(updatedParty)
  }),

  // HISTORY: Get match history
  http.get(`${API_URL}history`, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const size = parseInt(url.searchParams.get('size') || '7')

    const historyData = getMockHistory(page, size)

    return HttpResponse.json(historyData)
  }),

  // GROUP: Create lobby (placeholder)
  http.post(`${API_URL}group`, async ({ request }) => {
    const lobby = createGroupLobby()

    return HttpResponse.json(lobby)
  }),

  // THEMES: Get themes list
  http.get(`${API_URL}Theme`, () => {
    const themes = [
      { id: '1', label: 'Général', icon: 'wand-magic-sparkles' },
      { id: '2', label: 'Histoire', icon: 'university' },
      { id: '3', label: 'Science', icon: 'flask' },
      { id: '4', label: 'Sport', icon: 'medal' },
      { id: '5', label: 'Musique', icon: 'music' },
      { id: '6', label: 'Cinéma', icon: 'film' },
    ]

    return HttpResponse.json(themes)
  }),
]

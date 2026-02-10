export interface UserInfo {
  nickName: string
  avatar: string
  email: string
}

export interface JWTPayload {
  sub: string
  email: string
  nickName: string
  exp: number
  iat: number
}

export const mockUsers = {
  testuser: {
    login: 'testuser',
    password: 'password123', // NOSONAR - Mock data for testing purposes only
    email: 'test@example.com',
    nickName: 'TestUser',
    avatar:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiM2QzVDRTciLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIzMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5UPC90ZXh0Pjwvc3ZnPg==',
  },
}

export function createMockToken(nickName: string, email: string): string {
  const payload: JWTPayload = {
    sub: '1',
    email,
    nickName,
    exp: Math.floor(Date.now() / 1000) + 3600 * 24, // 24h expiry
    iat: Math.floor(Date.now() / 1000),
  }

  // Simple mock JWT - not cryptographically valid
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payloadStr = btoa(JSON.stringify(payload))
  const signature = btoa('mock-signature')

  return `${header}.${payloadStr}.${signature}`
}

export function getMockUserInfo(login: string): UserInfo | null {
  const user = mockUsers[login as keyof typeof mockUsers]
  if (!user) return null

  return {
    nickName: user.nickName,
    avatar: user.avatar,
    email: user.email,
  }
}

import type { DefaultSession } from 'next-auth'

// App-specific session/JWT shape. The SIMPUS accessToken lives ONLY in the JWT
// (server-readable via lib/server-token.ts) — deliberately absent from Session.
declare module 'next-auth' {
  interface User {
    accessToken?: string
    username?: string
    role?: 'ADMIN' | 'DOCTOR' | 'STAFF'
  }

  interface Session {
    user: {
      id: string
      username: string
      role: 'ADMIN' | 'DOCTOR' | 'STAFF'
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    id?: string
    username?: string
    role?: 'ADMIN' | 'DOCTOR' | 'STAFF'
  }
}
